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

export type DocumentCategory = "Quotation" | "Desain Final" | "Invoice" | "Kontrak" | "Lainnya";

export type UploadProjectDocumentInput = {
  project_id: string;
  file: File;
  file_name: string;
  file_type: DocumentCategory;
  uploaded_by: string | null;
};

export type UploadProjectPhotoInput = {
  project_id: string;
  file: File;
  caption: string | null;
  uploaded_by: string | null;
};

export type DeleteStorageBackedRecordResult = {
  storageWarning?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SupabaseQueryClient = {
  from: (table: string) => any;
};

function describeSupabaseError(error: { message?: string; details?: string; hint?: string } | null | undefined) {
  if (!error) return "";
  return [error.message, error.details, error.hint].filter(Boolean).join(" ");
}

function toDeleteError(label: string, error: { message?: string; details?: string; hint?: string } | null | undefined) {
  const message = describeSupabaseError(error);
  return new Error(message ? `${label}: ${message}` : label);
}

function safeStorageName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueStoragePath(projectId: string, folder: "documents" | "photos", fileName: string) {
  const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${projectId}/${folder}/${Date.now()}-${uniqueId}-${safeStorageName(fileName)}`;
}

function storagePathFromPublicUrl(fileUrl: string, bucket: "project-documents" | "project-photos") {
  const marker = `/storage/v1/object/public/${bucket}/`;

  try {
    const url = new URL(fileUrl);
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    const markerIndex = fileUrl.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(fileUrl.slice(markerIndex + marker.length));
  }
}

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

export async function markClientPortalActivated() {
  if (!supabase) return;
  const { error } = await supabase.rpc("mark_own_client_portal_active");
  if (error) throw error;
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

export async function uploadProjectDocument(input: UploadProjectDocumentInput) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const client = requireSupabase();
  const storagePath = uniqueStoragePath(input.project_id, "documents", input.file.name);

  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      contentType: input.file.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("project-documents").getPublicUrl(storagePath);
  const { data, error } = await client
    .from("project_documents")
    .insert({
      project_id: input.project_id,
      file_name: input.file_name,
      file_url: publicUrlData.publicUrl,
      file_type: input.file_type,
      uploaded_by: input.uploaded_by,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ProjectDocumentRow;
}

export async function uploadProjectPhoto(input: UploadProjectPhotoInput) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const client = requireSupabase();
  const storagePath = uniqueStoragePath(input.project_id, "photos", input.file.name);

  const { error: uploadError } = await supabase.storage
    .from("project-photos")
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      contentType: input.file.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("project-photos").getPublicUrl(storagePath);
  const { data, error } = await client
    .from("project_photos")
    .insert({
      project_id: input.project_id,
      image_url: publicUrlData.publicUrl,
      caption: input.caption,
      uploaded_by: input.uploaded_by,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ProjectPhotoRow;
}

export async function deleteProjectUpdate(updateId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("project_updates").delete().eq("id", updateId).select("id").maybeSingle();
  if (error) throw toDeleteError("Timeline update belum dapat dihapus", error);
  if (!data) throw new Error("Timeline update tidak terhapus. Record tidak ditemukan atau akses RLS menolak penghapusan.");
}

export async function deleteProjectDocument(document: ProjectDocumentRow): Promise<DeleteStorageBackedRecordResult> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const client = requireSupabase();
  const storagePath = storagePathFromPublicUrl(document.file_url, "project-documents");
  let storageWarning: string | undefined;

  const { data, error } = await client.from("project_documents").delete().eq("id", document.id).select("id").maybeSingle();
  if (error) throw toDeleteError("Dokumen belum dapat dihapus dari database", error);
  if (!data) throw new Error("Dokumen tidak terhapus. Record tidak ditemukan atau akses RLS menolak penghapusan.");

  if (storagePath) {
    const { error: storageError } = await supabase.storage.from("project-documents").remove([storagePath]);
    if (storageError) {
      storageWarning = `Dokumen sudah dihapus dari database, tetapi file storage mungkin masih tersisa. ${describeSupabaseError(storageError)}`;
    }
  } else {
    storageWarning = "Dokumen sudah dihapus dari database, tetapi path file storage tidak dapat dibaca otomatis.";
  }

  return { storageWarning };
}

export async function deleteProjectPhoto(photo: ProjectPhotoRow): Promise<DeleteStorageBackedRecordResult> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const client = requireSupabase();
  const storagePath = storagePathFromPublicUrl(photo.image_url, "project-photos");
  let storageWarning: string | undefined;

  const { data, error } = await client.from("project_photos").delete().eq("id", photo.id).select("id").maybeSingle();
  if (error) throw toDeleteError("Foto belum dapat dihapus dari database", error);
  if (!data) throw new Error("Foto tidak terhapus. Record tidak ditemukan atau akses RLS menolak penghapusan.");

  if (storagePath) {
    const { error: storageError } = await supabase.storage.from("project-photos").remove([storagePath]);
    if (storageError) {
      storageWarning = `Foto sudah dihapus dari database, tetapi file storage mungkin masih tersisa. ${describeSupabaseError(storageError)}`;
    }
  } else {
    storageWarning = "Foto sudah dihapus dari database, tetapi path file storage tidak dapat dibaca otomatis.";
  }

  return { storageWarning };
}

export async function fetchProjectsForClientUser(userId: string) {
  const client = requireSupabase();
  const { data: clientRows, error: clientsError } = await client.from("clients").select("*").eq("user_id", userId);
  if (clientsError) throw clientsError;

  const linkedClients = (clientRows ?? []) as ClientRow[];
  if (linkedClients.some((item) => !item.portal_activated_at)) {
    await markClientPortalActivated().catch(() => undefined);
  }

  const clientIds = linkedClients.map((item) => item.id);
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

  const linkedClients = (clientRows ?? []) as ClientRow[];
  if (linkedClients.some((item) => !item.portal_activated_at)) {
    await markClientPortalActivated().catch(() => undefined);
  }

  const clientIds = linkedClients.map((item) => item.id);
  if (!clientIds.length) return null;

  const bundle = await fetchProjectBundle(identifier);
  if (!bundle || !clientIds.includes(bundle.project.client_id)) return null;

  return bundle;
}
