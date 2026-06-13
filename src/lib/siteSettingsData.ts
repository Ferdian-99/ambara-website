import { supabase, type Json } from "./supabase";

export type HomepageStat = {
  value: string;
  label: string;
};

export type HomepageService = {
  title: string;
  description: string;
};

export type HomepageSettings = {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    secondaryCtaText: string;
  };
  stats: HomepageStat[];
  about: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  services: HomepageService[];
};

export const homepageTextLimits = {
  heroEyebrow: 40,
  heroHeadline: 90,
  heroSubheadline: 220,
  ctaText: 30,
  statValue: 18,
  statLabel: 40,
  aboutEyebrow: 40,
  aboutHeadline: 100,
  aboutBody: 280,
  serviceTitle: 45,
  serviceDescription: 160,
};

export const homepageValidationMessage = "Teks terlalu panjang. Buat lebih singkat agar tampilan tetap rapi.";

export const defaultHomepageSettings: HomepageSettings = {
  hero: {
    eyebrow: "Custom Interior / Built-in Furniture",
    headline: "Interior custom yang dirancang rapi, diproduksi presisi, dan dipasang terukur.",
    subheadline:
      "AMBARA menangani hunian, kantor, dan cafe melalui desain interior, built-in furniture, produksi workshop, dan instalasi yang jelas dari awal sampai serah terima.",
    primaryCtaText: "Lihat Portofolio",
    secondaryCtaText: "Lacak Proyek",
  },
  stats: [
    { value: "Residensial", label: "Interior custom" },
    { value: "Office", label: "Ruang kerja" },
    { value: "Built-in", label: "Furniture presisi" },
  ],
  about: {
    eyebrow: "Tentang Ambara",
    headline: "Studio custom interior yang menyatukan desain, produksi, dan pemasangan.",
    body: "Kami bekerja dari kebutuhan ruang nyata: mendengar, mengukur, menyusun gambar kerja, memproduksi di workshop, lalu memastikan instalasi selesai rapi di lokasi.",
  },
  services: [
    {
      title: "Custom Furniture",
      description: "Furnitur custom yang dibuat sesuai ukuran ruang, kebutuhan pakai, material, dan detail produksi.",
    },
    {
      title: "Interior Design",
      description: "Perencanaan interior menyeluruh dari layout, konsep visual, material, hingga arahan produksi.",
    },
    {
      title: "Built-in Furniture",
      description: "Kabinet, wardrobe, kitchen, panel dinding, dan storage yang menyatu dengan arsitektur ruang.",
    },
  ],
};

function cloneDefaultHomepageSettings(): HomepageSettings {
  return JSON.parse(JSON.stringify(defaultHomepageSettings)) as HomepageSettings;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function withinLimit(value: string, limit: number) {
  return value.length > 0 && value.length <= limit;
}

export function validateHomepageSettings(settings: HomepageSettings) {
  const checks = [
    withinLimit(settings.hero.eyebrow, homepageTextLimits.heroEyebrow),
    withinLimit(settings.hero.headline, homepageTextLimits.heroHeadline),
    withinLimit(settings.hero.subheadline, homepageTextLimits.heroSubheadline),
    withinLimit(settings.hero.primaryCtaText, homepageTextLimits.ctaText),
    withinLimit(settings.hero.secondaryCtaText, homepageTextLimits.ctaText),
    withinLimit(settings.about.eyebrow, homepageTextLimits.aboutEyebrow),
    withinLimit(settings.about.headline, homepageTextLimits.aboutHeadline),
    withinLimit(settings.about.body, homepageTextLimits.aboutBody),
    settings.stats.length === 3,
    settings.services.length === 3,
    settings.stats.every((item) => withinLimit(item.value, homepageTextLimits.statValue) && withinLimit(item.label, homepageTextLimits.statLabel)),
    settings.services.every(
      (item) => withinLimit(item.title, homepageTextLimits.serviceTitle) && withinLimit(item.description, homepageTextLimits.serviceDescription),
    ),
  ];

  return checks.every(Boolean);
}

export function normalizeHomepageSettings(value: unknown): HomepageSettings {
  if (!isPlainObject(value)) return cloneDefaultHomepageSettings();

  const hero = isPlainObject(value.hero) ? value.hero : {};
  const about = isPlainObject(value.about) ? value.about : {};
  const rawStats = Array.isArray(value.stats) ? value.stats : [];
  const rawServices = Array.isArray(value.services) ? value.services : [];

  const settings: HomepageSettings = {
    hero: {
      eyebrow: readString(hero.eyebrow),
      headline: readString(hero.headline),
      subheadline: readString(hero.subheadline),
      primaryCtaText: readString(hero.primaryCtaText),
      secondaryCtaText: readString(hero.secondaryCtaText),
    },
    stats: rawStats.slice(0, 3).map((item) => {
      const stat = isPlainObject(item) ? item : {};
      return {
        value: readString(stat.value),
        label: readString(stat.label),
      };
    }),
    about: {
      eyebrow: readString(about.eyebrow),
      headline: readString(about.headline),
      body: readString(about.body),
    },
    services: rawServices.slice(0, 3).map((item) => {
      const service = isPlainObject(item) ? item : {};
      return {
        title: readString(service.title),
        description: readString(service.description),
      };
    }),
  };

  return validateHomepageSettings(settings) ? settings : cloneDefaultHomepageSettings();
}

type SupabaseQueryClient = {
  from: (table: string) => any;
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
};

function requireSupabase(): SupabaseQueryClient {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  return supabase as unknown as SupabaseQueryClient;
}

export async function getHomepageSettings() {
  if (!supabase) return cloneDefaultHomepageSettings();
  const client = supabase as unknown as SupabaseQueryClient;
  const { data, error } = await client.from("site_settings").select("value").eq("id", "homepage").maybeSingle();
  if (error) throw error;
  return normalizeHomepageSettings(data?.value);
}

export async function getAdminHomepageSettings() {
  const client = requireSupabase();
  const { data, error } = await client.from("site_settings").select("value").eq("id", "homepage").maybeSingle();
  if (error) throw error;
  return normalizeHomepageSettings(data?.value);
}

export async function updateHomepageSettings(settings: HomepageSettings) {
  if (!validateHomepageSettings(settings)) {
    throw new Error(homepageValidationMessage);
  }

  const client = requireSupabase();
  const { data: userData } = await client.auth.getUser();
  const { error } = await client.from("site_settings").upsert({
    id: "homepage",
    value: settings as unknown as Json,
    updated_at: new Date().toISOString(),
    updated_by: userData.user?.id ?? null,
  });

  if (error) throw error;
  return settings;
}
