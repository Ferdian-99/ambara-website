import { supabase, type Database } from "./supabase";

export type PortfolioItemRow = Database["public"]["Tables"]["portfolio_items"]["Row"];
export type PortfolioItemInput = {
  title: string;
  slug: string;
  category: string | null;
  location: string | null;
  year: string | null;
  short_description: string | null;
  description: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  services: string[];
  materials: string[];
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
};

type SupabaseQueryClient = {
  from: (table: string) => any;
};

function requireSupabase(): SupabaseQueryClient {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  return supabase as unknown as SupabaseQueryClient;
}

function describeSupabaseError(error: { message?: string; details?: string; hint?: string } | null | undefined) {
  if (!error) return "";
  return [error.message, error.details, error.hint].filter(Boolean).join(" ");
}

function toMutationError(label: string, error: { message?: string; details?: string; hint?: string } | null | undefined) {
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

export function slugifyPortfolioTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function listPublishedPortfolioItems() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .not("published_at", "is", null)
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortfolioItemRow[];
}

export async function listFeaturedPortfolioItems(limit = 4) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .not("published_at", "is", null)
    .is("archived_at", null)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PortfolioItemRow[];
}

export async function getPublishedPortfolioItemBySlug(slug: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as PortfolioItemRow | null;
}

export async function listAdminPortfolioItems() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortfolioItemRow[];
}

export async function createPortfolioItem(input: PortfolioItemInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .insert({
      ...input,
      slug: input.slug.trim(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat dibuat", error);
  return data as PortfolioItemRow;
}

export async function updatePortfolioItem(itemId: string, input: PortfolioItemInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .update({
      ...input,
      slug: input.slug.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat diperbarui", error);
  return data as PortfolioItemRow;
}

export async function archivePortfolioItem(itemId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat diarsipkan", error);
  return data as PortfolioItemRow;
}

export async function restorePortfolioItem(itemId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .update({ archived_at: null, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat dipulihkan", error);
  return data as PortfolioItemRow;
}

export async function publishPortfolioItem(itemId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .update({ published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat dipublish", error);
  return data as PortfolioItemRow;
}

export async function unpublishPortfolioItem(itemId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_items")
    .update({ published_at: null, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw toMutationError("Portfolio belum dapat di-unpublish", error);
  return data as PortfolioItemRow;
}

export async function uploadPortfolioImage(file: File, folder: "cover" | "gallery") {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storagePath = `${folder}/${Date.now()}-${uniqueId}-${safeStorageName(file.name)}`;

  const { error } = await supabase.storage.from("portfolio-images").upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) throw toMutationError("Gambar portfolio belum dapat diunggah", error);

  const { data } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);
  return data.publicUrl;
}
