import { supabase, type ContactMessageStatus, type Database } from "./supabase";

export type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
export type ContactMessageFilter = "active" | "new" | "read" | "followed_up" | "archived";

export type ContactMessageInput = {
  name: string;
  email: string | null;
  phone: string | null;
  project_type: string | null;
  budget_range: string | null;
  message: string;
};

type SupabaseQueryClient = {
  from: (table: string) => any;
};

function requireSupabase(): SupabaseQueryClient {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  return supabase as unknown as SupabaseQueryClient;
}

async function currentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function submitContactMessage(input: ContactMessageInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      project_type: input.project_type,
      budget_range: input.budget_range,
      message: input.message,
      source: "contact_page",
      status: "new",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function listContactMessages(filter: ContactMessageFilter = "active") {
  const client = requireSupabase();
  const query = client.from("contact_messages").select("*").order("created_at", { ascending: false });

  const { data, error } = filter === "archived"
    ? await query.eq("status", "archived")
    : filter === "active"
      ? await query.neq("status", "archived").is("archived_at", null)
      : await query.eq("status", filter).is("archived_at", null);

  if (error) throw error;
  return (data ?? []) as ContactMessageRow[];
}

export async function countNewContactMessages() {
  const client = requireSupabase();
  const { count, error } = await client
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .is("archived_at", null);

  if (error) throw error;
  return count ?? 0;
}

async function updateContactMessageStatus(id: string, values: Partial<ContactMessageRow>) {
  const client = requireSupabase();
  const { data, error } = await client.from("contact_messages").update(values).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ContactMessageRow;
}

export async function markContactMessageRead(id: string) {
  return updateContactMessageStatus(id, {
    status: "read" as ContactMessageStatus,
    read_at: new Date().toISOString(),
    handled_by: await currentUserId(),
  });
}

export async function markContactMessageFollowedUp(id: string) {
  return updateContactMessageStatus(id, {
    status: "followed_up" as ContactMessageStatus,
    read_at: new Date().toISOString(),
    handled_by: await currentUserId(),
  });
}

export async function archiveContactMessage(id: string) {
  return updateContactMessageStatus(id, {
    status: "archived" as ContactMessageStatus,
    archived_at: new Date().toISOString(),
    handled_by: await currentUserId(),
  });
}

export async function restoreContactMessage(id: string) {
  return updateContactMessageStatus(id, {
    status: "read" as ContactMessageStatus,
    read_at: new Date().toISOString(),
    archived_at: null,
    handled_by: await currentUserId(),
  });
}
