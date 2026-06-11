import { createClient } from "npm:@supabase/supabase-js@2";

type ClientRecord = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} belum dikonfigurasi.`);
  return value;
}

function getSiteUrl() {
  return (Deno.env.get("SITE_URL") ?? "https://ambara-website.vercel.app").replace(/\/$/, "");
}

async function findUserByEmail(adminClient: ReturnType<typeof createClient>, email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < 1000) return null;
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method tidak didukung." }, 405);
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = getSiteUrl();
    const redirectTo = `${siteUrl}/update-password`;

    const authorization = req.headers.get("Authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return jsonResponse({ error: "Sesi admin tidak ditemukan." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authUser, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !authUser.user) {
      return jsonResponse({ error: "Sesi admin tidak valid." }, 401);
    }

    const { data: requesterProfile, error: requesterError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", authUser.user.id)
      .maybeSingle();

    if (requesterError) throw requesterError;

    if (!requesterProfile || !["super_admin", "sales"].includes(requesterProfile.role)) {
      return jsonResponse({ error: "Role ini tidak dapat mengirim undangan portal client." }, 403);
    }

    const body = await req.json().catch(() => null);
    const clientId = typeof body?.client_id === "string" ? body.client_id.trim() : "";

    if (!clientId) {
      return jsonResponse({ error: "client_id wajib dikirim." }, 400);
    }

    const { data: clientData, error: clientError } = await adminClient
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (clientError) throw clientError;
    const clientRecord = clientData as ClientRecord | null;
    if (!clientRecord) {
      return jsonResponse({ error: "Client tidak ditemukan." }, 404);
    }

    if (!clientRecord.email?.trim()) {
      return jsonResponse({ error: "Email client belum tersedia." }, 400);
    }

    if (clientRecord.user_id) {
      return jsonResponse({
        client: clientRecord,
        user_id: clientRecord.user_id,
        already_linked: true,
        message: "Akses portal client sudah terhubung.",
      });
    }

    const email = clientRecord.email.trim().toLowerCase();
    const existingUser = await findUserByEmail(adminClient, email);
    let invitedUserId = existingUser?.id ?? null;
    let delivery: "invite" | "password_reset" = "invite";

    if (existingUser) {
      delivery = "password_reset";
      const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) throw resetError;
    } else {
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          full_name: clientRecord.name,
          role: "client",
        },
      });

      if (inviteError) throw inviteError;
      invitedUserId = inviteData.user?.id ?? null;
    }

    if (!invitedUserId) {
      return jsonResponse({ error: "User undangan belum dapat dibuat." }, 500);
    }

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: invitedUserId,
        full_name: clientRecord.name,
        email,
        role: "client",
        phone: clientRecord.phone,
      },
      { onConflict: "id" },
    );

    if (profileError) throw profileError;

    const { data: linkedClientData, error: linkError } = await adminClient
      .from("clients")
      .update({ user_id: invitedUserId })
      .eq("id", clientRecord.id)
      .select("*")
      .single();

    if (linkError) throw linkError;
    const linkedClient = linkedClientData as ClientRecord;

    return jsonResponse({
      client: linkedClient,
      user_id: invitedUserId,
      delivery,
      redirect_to: redirectTo,
      message: "Undangan portal berhasil dikirim.",
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Undangan portal belum dapat dikirim.",
      },
      500,
    );
  }
});
