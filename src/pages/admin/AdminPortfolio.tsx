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

function galleryListFromForm(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
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
    gallery_urls: galleryListFromForm(form.gallery_urls),
    services: parseCommaList(form.services),
    materials: parseCommaList(form.materials),
    is_featured: form.is_featured,
    sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    published_at: form.published ? new Date().toISOString() : null,
  };
}

function friendlyError(fallback: string, technicalError: unknown) {
  console.error(fallback, technicalError);
  return fallback;
}

function statusLabel(item: PortfolioItemRow) {
  if (item.archived_at) return "Diarsipkan";
  if (item.published_at) return "Tampil di Website";
  return "Draft";
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
  const galleryUrls = useMemo(() => galleryListFromForm(form.gallery_urls), [form.gallery_urls]);

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
      setError(friendlyError("Portfolio belum dapat dimuat. Coba refresh halaman atau hubungi admin teknis.", loadError));
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

  const setGalleryUrls = (urls: string[]) => {
    setForm((current) => ({ ...current, gallery_urls: urls.join("\n") }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const editItem = (item: PortfolioItemRow) => {
    setEditingId(item.id);
    setForm(formFromItem(item));
    setError("");
    setSuccess("");
  };

  const validateImage = (file: File) => {
    if (!hasAllowedExtension(file)) {
      return "Foto gagal diupload. Pastikan format JPG, PNG, atau WEBP.";
    }

    if (file.size > maxImageSize) {
      return "Foto gagal diupload. Ukuran file maksimal 8 MB.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Nama project wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const input = inputFromForm(form);
      if (editingId) {
        await updatePortfolioItem(editingId, input);
        setSuccess("Data portfolio berhasil diperbarui.");
      } else {
        await createPortfolioItem(input);
        setSuccess("Portfolio baru berhasil dibuat.");
      }
      resetForm();
      await loadItems();
    } catch (saveError) {
      setError(friendlyError("Data portfolio gagal disimpan. Coba ulangi beberapa saat lagi.", saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) return;
    setError("");
    setSuccess("");

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadPortfolioImage(file, "cover");
      updateField("cover_image_url", url);
      setSuccess("Foto utama berhasil diupload.");
    } catch (uploadError) {
      setError(friendlyError("Foto gagal diupload. Pastikan format JPG/PNG/WEBP dan ukuran file tidak terlalu besar.", uploadError));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setSuccess("");

    const fileList = Array.from(files);
    const validationError = fileList.map(validateImage).find(Boolean);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of fileList) {
        uploadedUrls.push(await uploadPortfolioImage(file, "gallery"));
      }
      setGalleryUrls([...galleryUrls, ...uploadedUrls]);
      setSuccess(fileList.length > 1 ? "Foto galeri berhasil diupload." : "Foto galeri berhasil ditambahkan.");
    } catch (uploadError) {
      setError(friendlyError("Foto gagal diupload. Pastikan format JPG/PNG/WEBP dan ukuran file tidak terlalu besar.", uploadError));
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setGalleryUrls(galleryUrls.filter((item) => item !== url));
    setSuccess("Foto galeri dihapus dari daftar. Simpan portfolio untuk menerapkan perubahan.");
  };

  const handleAction = async (item: PortfolioItemRow, action: "publish" | "unpublish" | "archive" | "restore") => {
    const labels = {
      publish: "menampilkan portfolio ini di website",
      unpublish: "menyembunyikan portfolio ini dari website",
      archive: "mengarsipkan portfolio ini",
      restore: "memulihkan portfolio ini",
    };

    if ((action === "archive" || action === "restore") && !window.confirm(`Yakin ingin ${labels[action]}?`)) return;

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
      setError(friendlyError("Status portfolio gagal diperbarui. Coba ulangi beberapa saat lagi.", actionError));
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
            Buat dan perbarui project portfolio yang tampil di website, termasuk foto utama, galeri, cerita project, dan status tampil.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Daftar Portfolio</h2>
            <button type="button" className="dashboard-ghost-button" onClick={resetForm}>Project Baru</button>
          </div>
          {loading && <p className="dashboard-muted">Memuat portfolio...</p>}
          {error && <p className="dashboard-alert">{error}</p>}
          {success && <p className="dashboard-success">{success}</p>}
          {!loading && sortedItems.length === 0 && (
            <div className="dashboard-empty">
              <span>Belum ada portfolio</span>
              <p>Portfolio yang dibuat di sini akan tampil di halaman publik setelah diaktifkan.</p>
            </div>
          )}
          {!loading && sortedItems.map((item) => (
            <div key={item.id} className="dashboard-row">
              <div className="grid gap-5 md:grid-cols-[112px_1fr]">
                <div className="h-28 overflow-hidden border border-charcoal/10 bg-linen">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={`Foto utama ${item.title}`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs uppercase tracking-[0.16em] text-graphite/45">Belum ada foto</div>
                  )}
                </div>
                <div>
                  <div className="dashboard-item-topline">
                    <span>{item.category ?? "Jenis belum diisi"} / {item.location ?? "Lokasi belum diisi"} / {item.year ?? "Tahun belum diisi"}</span>
                    <div className="dashboard-action-row">
                      <button type="button" className="dashboard-ghost-button" onClick={() => editItem(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="dashboard-ghost-button"
                        disabled={actionId === item.id}
                        onClick={() => void handleAction(item, item.published_at ? "unpublish" : "publish")}
                      >
                        {item.published_at ? "Sembunyikan" : "Publish"}
                      </button>
                      {canArchive && (
                        <button
                          type="button"
                          className={item.archived_at ? "dashboard-ghost-button" : "dashboard-delete-button"}
                          disabled={actionId === item.id}
                          onClick={() => void handleAction(item, item.archived_at ? "restore" : "archive")}
                        >
                          {item.archived_at ? "Pulihkan Portfolio" : "Arsipkan Portfolio"}
                        </button>
                      )}
                    </div>
                  </div>
                  <p><strong>{item.title}</strong></p>
                  <p>{item.short_description ?? "Deskripsi singkat belum diisi."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="dashboard-status-pill">{statusLabel(item).toUpperCase()}</span>
                    {item.is_featured && <span className="dashboard-status-pill">MUNCUL DI BERANDA</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </article>

        <article className="dashboard-panel">
          <h2>{editingId ? "Edit Portfolio" : "Buat Portfolio"}</h2>
          <form className="dashboard-form compact" onSubmit={handleSubmit}>
            <label>
              Nama Project
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Residensi Senja" />
            </label>
            <div className="form-grid three">
              <label>
                Jenis Project
                <input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Residensial" />
              </label>
              <label>
                Lokasi
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Jakarta Selatan" />
              </label>
              <label>
                Tahun
                <input value={form.year} onChange={(event) => updateField("year", event.target.value)} placeholder="2026" />
              </label>
            </div>
            <label>
              Deskripsi Singkat
              <textarea value={form.short_description} onChange={(event) => updateField("short_description", event.target.value)} placeholder="Ringkasan singkat yang tampil di kartu portfolio." />
            </label>
            <label>
              Cerita Project
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Ceritakan konsep, kebutuhan ruang, dan pendekatan AMBARA untuk project ini." />
            </label>

            <div className="border border-charcoal/10 bg-linen p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Foto Utama</p>
              {form.cover_image_url ? (
                <img src={form.cover_image_url} alt="Preview foto utama portfolio" className="mt-4 aspect-[4/3] w-full border border-charcoal/10 object-cover" loading="lazy" />
              ) : (
                <div className="mt-4 flex aspect-[4/3] items-center justify-center border border-dashed border-charcoal/20 bg-ivory text-sm text-graphite/55">
                  Belum ada foto utama
                </div>
              )}
              <label className="mt-4 block">
                Upload Foto Utama
                <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void handleCoverUpload(event.target.files?.[0] ?? null)} />
                <small>{uploadingCover ? "Mengunggah foto utama..." : "JPG, JPEG, PNG, atau WEBP. Maksimal 8 MB."}</small>
              </label>
            </div>

            <div className="border border-charcoal/10 bg-linen p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Foto Galeri</p>
              {galleryUrls.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {galleryUrls.map((url) => (
                    <div key={url} className="relative overflow-hidden border border-charcoal/10 bg-ivory">
                      <img src={url} alt="Preview foto galeri portfolio" className="aspect-square w-full object-cover" loading="lazy" />
                      <button type="button" className="absolute bottom-2 right-2 bg-ivory/90 px-3 py-1 text-xs text-charcoal shadow-line" onClick={() => removeGalleryImage(url)}>
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-charcoal/20 bg-ivory p-6 text-sm text-graphite/55">
                  Belum ada foto galeri.
                </div>
              )}
              <label className="mt-4 block">
                Tambah Foto Galeri
                <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void handleGalleryUpload(event.target.files)} />
                <small>{uploadingGallery ? "Mengunggah foto galeri..." : "Bisa pilih satu atau beberapa foto. Maksimal 8 MB per foto."}</small>
              </label>
            </div>

            <div className="form-grid">
              <label>
                Layanan yang Dikerjakan
                <input value={form.services} onChange={(event) => updateField("services", event.target.value)} placeholder="Interior Design, Built-in Furniture" />
              </label>
              <label>
                Material / Finishing
                <input value={form.materials} onChange={(event) => updateField("materials", event.target.value)} placeholder="Veneer, HPL premium, metal accent" />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Urutan Tampil
                <input type="number" value={form.sort_order} onChange={(event) => updateField("sort_order", event.target.value)} />
              </label>
              <label>
                Tampilkan di Beranda
                <select value={form.is_featured ? "yes" : "no"} onChange={(event) => updateField("is_featured", event.target.value === "yes")}>
                  <option value="no">Tidak</option>
                  <option value="yes">Ya</option>
                </select>
                <small>Jika aktif, project ini bisa muncul di section portfolio beranda.</small>
              </label>
            </div>
            <label>
              Tampilkan di Website
              <select value={form.published ? "yes" : "no"} onChange={(event) => updateField("published", event.target.value === "yes")}>
                <option value="no">Draft</option>
                <option value="yes">Tampil</option>
              </select>
              <small>Jika aktif, portfolio ini akan muncul di halaman publik.</small>
            </label>

            <details className="border border-charcoal/10 bg-ivory p-4">
              <summary className="cursor-pointer text-sm font-medium text-charcoal">Pengaturan lanjutan</summary>
              <p className="mt-3 text-sm leading-6 text-graphite/62">Bagian ini biasanya tidak perlu diubah.</p>
              <div className="mt-4 grid gap-4">
                <label>
                  Slug
                  <input value={form.slug} onChange={(event) => updateField("slug", slugifyPortfolioTitle(event.target.value))} placeholder="residensi-senja" />
                </label>
                <label>
                  Cover image URL
                  <input value={form.cover_image_url} onChange={(event) => updateField("cover_image_url", event.target.value)} />
                </label>
                <label>
                  Gallery URLs
                  <textarea value={form.gallery_urls} onChange={(event) => updateField("gallery_urls", event.target.value)} placeholder="Satu URL per baris" />
                </label>
              </div>
            </details>

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
