import { FormEvent, useEffect, useState } from "react";
import {
  defaultHomepageSettings,
  getAdminHomepageSettings,
  homepageTextLimits,
  homepageValidationMessage,
  updateHomepageSettings,
  validateHomepageSettings,
  type HomepageSettings,
} from "../../lib/siteSettingsData";
import { useDashboardContext } from "./AdminLayout";

type HeroField = keyof HomepageSettings["hero"];
type AboutField = keyof HomepageSettings["about"];
type StatField = keyof HomepageSettings["stats"][number];
type ServiceField = keyof HomepageSettings["services"][number];

function cloneSettings(settings: HomepageSettings): HomepageSettings {
  return JSON.parse(JSON.stringify(settings)) as HomepageSettings;
}

function Field({
  label,
  value,
  limit,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const isOverLimit = value.length > limit;
  return (
    <label>
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className={isOverLimit ? "text-red-600" : "text-graphite/45"}>{value.length}/{limit}</span>
      </span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {isOverLimit && <small className="text-red-700">{homepageValidationMessage}</small>}
    </label>
  );
}

export function AdminHomepage() {
  const { role } = useDashboardContext();
  const [form, setForm] = useState<HomepageSettings>(() => cloneSettings(defaultHomepageSettings));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManage = role === "super_admin" || role === "content_manager";
  const canReset = role === "super_admin";

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    let mounted = true;
    getAdminHomepageSettings()
      .then((settings) => {
        if (mounted) setForm(settings);
      })
      .catch((loadError) => {
        console.error("Homepage CMS gagal dimuat:", loadError);
        if (mounted) setError("Homepage belum dapat dimuat. Coba refresh halaman atau hubungi admin teknis.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canManage]);

  const updateHero = (field: HeroField, value: string) => {
    setForm((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
    setError("");
    setSuccess("");
  };

  const updateAbout = (field: AboutField, value: string) => {
    setForm((current) => ({ ...current, about: { ...current.about, [field]: value } }));
    setError("");
    setSuccess("");
  };

  const updateStat = (index: number, field: StatField, value: string) => {
    setForm((current) => ({
      ...current,
      stats: current.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
    setError("");
    setSuccess("");
  };

  const updateService = (index: number, field: ServiceField, value: string) => {
    setForm((current) => ({
      ...current,
      services: current.services.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateHomepageSettings(form)) {
      setError(homepageValidationMessage);
      return;
    }

    setSaving(true);
    try {
      await updateHomepageSettings(form);
      setSuccess("Teks homepage berhasil disimpan.");
    } catch (saveError) {
      console.error("Homepage CMS gagal disimpan:", saveError);
      setError(saveError instanceof Error && saveError.message === homepageValidationMessage
        ? homepageValidationMessage
        : "Homepage gagal disimpan. Coba ulangi beberapa saat lagi.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setForm(cloneSettings(defaultHomepageSettings));
    setError("");
    setSuccess("Teks default sudah dimuat. Klik Simpan untuk menerapkan.");
  };

  if (!canManage) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Homepage CMS hanya untuk super admin dan content manager.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Homepage CMS</p>
          <h1>Edit teks utama beranda AMBARA.</h1>
          <p className="mt-5 max-w-3xl leading-7 text-graphite/70">
            Ubah konten teks tanpa mengubah desain, warna, layout, atau urutan section.
          </p>
        </div>
        {canReset && (
          <button type="button" className="dashboard-ghost-button" onClick={resetToDefault}>
            Kembalikan teks default
          </button>
        )}
      </div>

      {loading && <p className="dashboard-muted">Memuat teks homepage...</p>}
      {error && <p className="dashboard-alert">{error}</p>}
      {success && <p className="dashboard-success">{success}</p>}

      {!loading && (
        <form className="dashboard-form compact" onSubmit={handleSubmit}>
          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <h2>Hero Utama</h2>
              <Field label="Label kecil" value={form.hero.eyebrow} limit={homepageTextLimits.heroEyebrow} onChange={(value) => updateHero("eyebrow", value)} />
              <Field label="Judul utama" value={form.hero.headline} limit={homepageTextLimits.heroHeadline} onChange={(value) => updateHero("headline", value)} textarea />
              <Field label="Deskripsi singkat" value={form.hero.subheadline} limit={homepageTextLimits.heroSubheadline} onChange={(value) => updateHero("subheadline", value)} textarea />
              <div className="form-grid">
                <Field label="Teks tombol utama" value={form.hero.primaryCtaText} limit={homepageTextLimits.ctaText} onChange={(value) => updateHero("primaryCtaText", value)} />
                <Field label="Teks tombol kedua" value={form.hero.secondaryCtaText} limit={homepageTextLimits.ctaText} onChange={(value) => updateHero("secondaryCtaText", value)} />
              </div>
            </article>

            <article className="dashboard-panel">
              <h2>Preview Teks</h2>
              <div className="mt-6 border border-charcoal/10 bg-ivory p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-champagne">{form.hero.eyebrow}</p>
                <h3 className="mt-5 font-serif text-4xl leading-tight">{form.hero.headline}</h3>
                <p className="mt-5 leading-7 text-graphite/70">{form.hero.subheadline}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="btn-primary">{form.hero.primaryCtaText}</span>
                  <span className="btn-secondary">{form.hero.secondaryCtaText}</span>
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-panel">
            <h2>Statistik</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {form.stats.map((stat, index) => (
                <div key={index} className="border border-charcoal/10 bg-ivory p-4">
                  <Field label="Angka" value={stat.value} limit={homepageTextLimits.statValue} onChange={(value) => updateStat(index, "value", value)} />
                  <Field label="Label" value={stat.label} limit={homepageTextLimits.statLabel} onChange={(value) => updateStat(index, "label", value)} />
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <h2>Tentang Ambara</h2>
            <Field label="Label kecil" value={form.about.eyebrow} limit={homepageTextLimits.aboutEyebrow} onChange={(value) => updateAbout("eyebrow", value)} />
            <Field label="Judul section" value={form.about.headline} limit={homepageTextLimits.aboutHeadline} onChange={(value) => updateAbout("headline", value)} textarea />
            <Field label="Deskripsi" value={form.about.body} limit={homepageTextLimits.aboutBody} onChange={(value) => updateAbout("body", value)} textarea />
          </section>

          <section className="dashboard-panel">
            <h2>Layanan Unggulan</h2>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {form.services.map((service, index) => (
                <div key={index} className="border border-charcoal/10 bg-ivory p-4">
                  <Field label="Judul layanan" value={service.title} limit={homepageTextLimits.serviceTitle} onChange={(value) => updateService(index, "title", value)} />
                  <Field label="Deskripsi layanan" value={service.description} limit={homepageTextLimits.serviceDescription} onChange={(value) => updateService(index, "description", value)} textarea />
                </div>
              ))}
            </div>
          </section>

          <div className="dashboard-action-row">
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Homepage"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
