import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  archivePortfolioItem,
  createPortfolioItem,
  listAdminPortfolioItems,
  parseCommaList,
  publishPortfolioItem,
  restorePortfolioItem,
  slugifyPortfolioTitle,
  unpublishPortfolioItem,
  updatePortfolioItem,
  uploadPortfolioImage,
  type PortfolioItemInput,
  type PortfolioItemRow,
} from "../../lib/portfolioData";
import { useDashboardContext } from "./AdminLayout";

const maxImageSize = 8 * 1024 * 1024;
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const initialForm = {
  title: "",
  slug: "",
  category: "",
  location: "",
  year: "",
  short_description: "",
  description: "",
  cover_image_url: "",
  gallery_urls: "",
  services: "",
  materials: "",
  is_featured: false,
  sort_order: "0",
  published: false,
};

function hasAllowedExtension(file: File) {
  const name = file.name.toLowerCase();
  return allowedImageExtensions.some((extension) => name.endsWith(extension));
}

function formFromItem(item: PortfolioItemRow) {
  return {
    title: item.title,
    slug: item.slug,
    category: item.category ?? "",
    location: item.location ?? "",
    year: item.year ?? "",
    short_description: item.short_description ?? "",
    description: item.description ?? "",
    cover_image_url: item.cover_image_url ?? "",
    gallery_urls: item.gallery_urls.join("\n"),
    services: item.services.join(", "),
    materials: item.materials.join(", "),
    is_featured: item.is_featured,
    sort_order: String(item.sort_order),
    published: Boolean(item.published_at),
  };
}

function inputFromForm(form: typeof initialForm): PortfolioItemInput {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyPortfolioTitle(form.title),
    category: form.category.trim() || null,
    location: form.location.trim() || null,
    year: form.year.trim() || null,
    short_description: form.short_description.trim() || null,
    description: form.description.trim() || null,
    cover_image_url: form.cover_image_url.trim() || null,
    gallery_urls: form.gallery_urls.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
    services: parseCommaList(form.services),
    materials: parseCommaList(form.materials),
    is_featured: form.is_featured,
    sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    published_at: form.published ? new Date().toISOString() : null,
  };
}

export function AdminPortfolio() {
  const { role } = useDashboardContext();
  const [items, setItems] = useState<PortfolioItemRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManage = role === "super_admin" || role === "content_manager";
  const canArchive = role === "super_admin";
  const sortedItems = useMemo(() => items, [items]);

  const loadItems = async () => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setItems(await listAdminPortfolioItems());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Portfolio belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !editingId) {
        next.slug = slugifyPortfolioTitle(String(value));
      }
      return next;
    });
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Judul portfolio wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const input = inputFromForm(form);
      if (editingId) {
        await updatePortfolioItem(editingId, input);
        setSuccess("Portfolio berhasil diperbarui.");
      } else {
        await createPortfolioItem(input);
        setSuccess("Portfolio berhasil dibuat.");
      }
      resetForm();
      await loadItems();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Portfolio belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File | null, folder: "cover" | "gallery") => {
    if (!file) return;
    setError("");
    setSuccess("");

    if (!hasAllowedExtension(file)) {
      setError("Format gambar belum didukung. Gunakan JPG, JPEG, PNG, atau WEBP.");
      return;
    }

    if (file.size > maxImageSize) {
      setError("Ukuran gambar maksimal 8 MB.");
      return;
    }

    folder === "cover" ? setUploadingCover(true) : setUploadingGallery(true);
    try {
      const url = await uploadPortfolioImage(file, folder);
      if (folder === "cover") {
        updateField("cover_image_url", url);
      } else {
        setForm((current) => ({
          ...current,
          gallery_urls: [current.gallery_urls, url].filter(Boolean).join("\n"),
        }));
      }
      setSuccess("Gambar portfolio berhasil diunggah.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gambar belum dapat diunggah.");
    } finally {
      folder === "cover" ? setUploadingCover(false) : setUploadingGallery(false);
    }
  };

  const handleAction = async (item: PortfolioItemRow, action: "publish" | "unpublish" | "archive" | "restore") => {
    const labels = {
      publish: "publish",
      unpublish: "unpublish",
      archive: "arsipkan",
      restore: "pulihkan",
    };

    if ((action === "archive" || action === "restore") && !window.confirm(`Yakin ingin ${labels[action]} portfolio ini?`)) return;

    setActionId(item.id);
    setError("");
    setSuccess("");
    try {
      if (action === "publish") await publishPortfolioItem(item.id);
      if (action === "unpublish") await unpublishPortfolioItem(item.id);
      if (action === "archive") await archivePortfolioItem(item.id);
      if (action === "restore") await restorePortfolioItem(item.id);
      setSuccess("Status portfolio berhasil diperbarui.");
      await loadItems();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Status portfolio belum dapat diperbarui.");
    } finally {
      setActionId(null);
    }
  };

  if (!canManage) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Portfolio CMS hanya untuk super admin dan content manager.</h1>
          <p>Role ini dapat tetap menggunakan area dashboard sesuai akses operasional yang tersedia.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Portfolio CMS</p>
          <h1>Kelola showcase publik AMBARA.</h1>
          <p className="mt-5 max-w-3xl leading-7 text-graphite/70">
            Atur proyek portfolio, gambar cover, galeri, dan status publish tanpa mengubah kode frontend.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Portfolio Items</h2>
            <button type="button" className="dashboard-ghost-button" onClick={resetForm}>Item Baru</button>
          </div>
          {loading && <p className="dashboard-muted">Memuat portfolio...</p>}
          {error && <p className="dashboard-alert">{error}</p>}
          {success && <p className="dashboard-success">{success}</p>}
          {!loading && sortedItems.length === 0 && (
            <div className="dashboard-empty">
              <span>Belum ada portfolio</span>
              <p>Portfolio yang dibuat di CMS akan tampil di halaman publik setelah dipublish.</p>
            </div>
          )}
          {!loading && sortedItems.map((item) => (
            <div key={item.id} className="dashboard-row">
              <div className="dashboard-item-topline">
                <span>{item.category ?? "Portfolio"} / {item.year ?? "Tahun belum diisi"}</span>
                <div className="dashboard-action-row">
                  <button type="button" className="dashboard-ghost-button" onClick={() => { setEditingId(item.id); setForm(formFromItem(item)); }}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="dashboard-ghost-button"
                    disabled={actionId === item.id}
                    onClick={() => void handleAction(item, item.published_at ? "unpublish" : "publish")}
                  >
                    {item.published_at ? "Unpublish" : "Publish"}
                  </button>
                  {canArchive && (
                    <button
                      type="button"
                      className={item.archived_at ? "dashboard-ghost-button" : "dashboard-delete-button"}
                      disabled={actionId === item.id}
                      onClick={() => void handleAction(item, item.archived_at ? "restore" : "archive")}
                    >
                      {item.archived_at ? "Pulihkan" : "Arsipkan"}
                    </button>
                  )}
                </div>
              </div>
              <p><strong>{item.title}</strong></p>
              <p>{item.short_description ?? item.slug}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.published_at && <span className="dashboard-status-pill">PUBLISHED</span>}
                {item.archived_at && <span className="dashboard-status-pill">DIARSIPKAN</span>}
                {item.is_featured && <span className="dashboard-status-pill">FEATURED</span>}
              </div>
            </div>
          ))}
        </article>

        <article className="dashboard-panel">
          <h2>{editingId ? "Edit Portfolio" : "Buat Portfolio"}</h2>
          <form className="dashboard-form compact" onSubmit={handleSubmit}>
            <label>
              Title
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Residensi Senja" />
            </label>
            <label>
              Slug
              <input value={form.slug} onChange={(event) => updateField("slug", slugifyPortfolioTitle(event.target.value))} placeholder="residensi-senja" />
            </label>
            <div className="form-grid three">
              <label>
                Category
                <input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Residensial" />
              </label>
              <label>
                Location
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Jakarta Selatan" />
              </label>
              <label>
                Year
                <input value={form.year} onChange={(event) => updateField("year", event.target.value)} placeholder="2026" />
              </label>
            </div>
            <label>
              Short description
              <textarea value={form.short_description} onChange={(event) => updateField("short_description", event.target.value)} />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>
            <label>
              Cover image URL
              <input value={form.cover_image_url} onChange={(event) => updateField("cover_image_url", event.target.value)} />
            </label>
            <label>
              Upload cover image
              <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void handleImageUpload(event.target.files?.[0] ?? null, "cover")} />
              <small>{uploadingCover ? "Mengunggah cover..." : "JPG, JPEG, PNG, atau WEBP. Maksimal 8 MB."}</small>
            </label>
            <label>
              Gallery URLs
              <textarea value={form.gallery_urls} onChange={(event) => updateField("gallery_urls", event.target.value)} placeholder="Satu URL per baris" />
            </label>
            <label>
              Upload gallery image
              <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void handleImageUpload(event.target.files?.[0] ?? null, "gallery")} />
              <small>{uploadingGallery ? "Mengunggah galeri..." : "Gambar akan ditambahkan ke daftar Gallery URLs."}</small>
            </label>
            <div className="form-grid">
              <label>
                Services
                <input value={form.services} onChange={(event) => updateField("services", event.target.value)} placeholder="Interior Design, Built-in Furniture" />
              </label>
              <label>
                Materials
                <input value={form.materials} onChange={(event) => updateField("materials", event.target.value)} placeholder="Veneer, HPL premium" />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Sort order
                <input type="number" value={form.sort_order} onChange={(event) => updateField("sort_order", event.target.value)} />
              </label>
              <label>
                Featured
                <select value={form.is_featured ? "yes" : "no"} onChange={(event) => updateField("is_featured", event.target.value === "yes")}>
                  <option value="no">Tidak</option>
                  <option value="yes">Ya</option>
                </select>
              </label>
            </div>
            <label>
              Published
              <select value={form.published ? "yes" : "no"} onChange={(event) => updateField("published", event.target.value === "yes")}>
                <option value="no">Draft</option>
                <option value="yes">Published</option>
              </select>
            </label>
            <div className="dashboard-action-row">
              <button type="submit" disabled={saving || uploadingCover || uploadingGallery}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Portfolio" : "Buat Portfolio"}
              </button>
              {editingId && <button type="button" onClick={resetForm}>Batal</button>}
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
