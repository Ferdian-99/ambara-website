import { supabase, type Database, type ProjectStage, type ProjectStatus } from "./supabase";

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectUpdateRow = Database["public"]["Tables"]["project_updates"]["Row"];
export type ProjectDocumentRow = Database["public"]["Tables"]["project_documents"]["Row"];
export type ProjectPhotoRow = Database["public"]["Tables"]["project_photos"]["Row"];

export type ProjectWithClient = ProjectRow & {
  clients: ClientRow | null;
};

export type ProjectBundle = {
  project: ProjectWithClient;
  updates: ProjectUpdateRow[];
  documents: ProjectDocumentRow[];
  photos: ProjectPhotoRow[];
};

export type ClientProjectSummary = ProjectWithClient;

export type CreateClientInput = {
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export type CreateProjectInput = {
  client_id: string;
  project_code: string;
  project_name: string;
  project_type: string;
  location: string | null;
  current_stage: ProjectStage;
  progress_percentage: number;
  status: ProjectStatus;
  estimated_completion: string | null;
  notes: string | null;
};

export type CreateProjectUpdateInput = {
  project_id: string;
  title: string;
  description: string | null;
  stage: ProjectStage;
  progress_percentage: number;
  created_by: string | null;
};

export type InviteClientResult = {
  client: ClientRow;
  user_id: string;
  already_linked?: boolean;
  delivery?: "invite" | "password_reset";
  message?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SupabaseQueryClient = {
  from: (table: string) => any;
};

function requireSupabase(): SupabaseQueryClient {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  return supabase as unknown as SupabaseQueryClient;
}

export function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function fetchAdminProjects() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("projects")
    .select("*, clients(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProjectWithClient[];
}

export async function fetchAdminOverview() {
  const client = requireSupabase();
  const [{ data: projects, error: projectsError }, { data: updates, error: updatesError }, { data: clients, error: clientsError }] =
    await Promise.all([
      client.from("projects").select("*, clients(*)").order("created_at", { ascending: false }).limit(6),
      client.from("project_updates").select("*").order("created_at", { ascending: false }).limit(5),
      client.from("clients").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

  if (projectsError) throw projectsError;
  if (updatesError) throw updatesError;
  if (clientsError) throw clientsError;

  return {
    projects: (projects ?? []) as ProjectWithClient[],
    updates: updates ?? [],
    clients: clients ?? [],
  };
}

export async function fetchClients() {
  const client = requireSupabase();
  const { data, error } = await client.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

export async function fetchClientLinkProfiles() {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles").select("*").order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function createClientRecord(input: CreateClientInput) {
  const client = requireSupabase();
  const { data, error } = await client.from("clients").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateClientPortalUser(clientId: string, userId: string | null) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("clients")
    .update({ user_id: userId })
    .eq("id", clientId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ClientRow;
}

export async function inviteClientToPortal(clientId: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");

  const { data, error } = await supabase.functions.invoke("invite-client", {
    body: { client_id: clientId },
  });

  if (error) throw new Error(error.message);

  const payload = data as InviteClientResult & { error?: string };
  if (payload.error) throw new Error(payload.error);

  return payload as InviteClientResult;
}

export async function createProjectRecord(input: CreateProjectInput) {
  const client = requireSupabase();
  const { data, error } = await client.from("projects").insert(input).select("*, clients(*)").single();
  if (error) throw error;
  return data as ProjectWithClient;
}

export async function fetchProjectBundle(identifier: string): Promise<ProjectBundle | null> {
  const client = requireSupabase();
  const query = client.from("projects").select("*, clients(*)");
  const { data, error } = uuidPattern.test(identifier)
    ? await query.eq("id", identifier).maybeSingle()
    : await query.eq("project_code", identifier).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const project = data as ProjectWithClient;
  const [{ data: updates, error: updatesError }, { data: documents, error: documentsError }, { data: photos, error: photosError }] =
    await Promise.all([
      client.from("project_updates").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
      client.from("project_documents").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
      client.from("project_photos").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
    ]);

  if (updatesError) throw updatesError;
  if (documentsError) throw documentsError;
  if (photosError) throw photosError;

  return {
    project,
    updates: updates ?? [],
    documents: documents ?? [],
    photos: photos ?? [],
  };
}

export async function addProjectUpdate(input: CreateProjectUpdateInput) {
  const client = requireSupabase();
  const normalizedProgress = normalizeProgress(input.progress_percentage);

  const { data, error } = await client
    .from("project_updates")
    .insert({ ...input, progress_percentage: normalizedProgress })
    .select("*")
    .single();

  if (error) throw error;

  const { error: projectError } = await client
    .from("projects")
    .update({
      current_stage: input.stage,
      progress_percentage: normalizedProgress,
    })
    .eq("id", input.project_id);

  if (projectError) throw projectError;
  return data;
}

export async function fetchProjectsForClientUser(userId: string) {
  const client = requireSupabase();
  const { data: clientRows, error: clientsError } = await client.from("clients").select("*").eq("user_id", userId);
  if (clientsError) throw clientsError;

  const clientIds = ((clientRows ?? []) as ClientRow[]).map((item) => item.id);
  if (!clientIds.length) return [];

  const { data, error } = await client
    .from("projects")
    .select("*, clients(*)")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientProjectSummary[];
}

export async function fetchClientProjectBundle(identifier: string, userId: string): Promise<ProjectBundle | null> {
  const client = requireSupabase();
  const { data: clientRows, error: clientsError } = await client.from("clients").select("*").eq("user_id", userId);
  if (clientsError) throw clientsError;

  const clientIds = ((clientRows ?? []) as ClientRow[]).map((item) => item.id);
  if (!clientIds.length) return null;

  const bundle = await fetchProjectBundle(identifier);
  if (!bundle || !clientIds.includes(bundle.project.client_id)) return null;

  return bundle;
}
