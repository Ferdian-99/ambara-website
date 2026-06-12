import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trackingStages } from "../../data";
import {
  addProjectUpdate,
  deleteProjectDocument,
  deleteProjectPhoto,
  deleteProjectUpdate,
  fetchProjectBundle,
  normalizeProgress,
  uploadProjectDocument,
  uploadProjectPhoto,
  type DocumentCategory,
  type ProjectBundle,
  type ProjectDocumentRow,
  type ProjectPhotoRow,
  type ProjectUpdateRow,
} from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import type { ProjectStage } from "../../lib/supabase";
import { useDashboardContext } from "./AdminLayout";

const documentCategories: DocumentCategory[] = ["Quotation", "Desain Final", "Invoice", "Kontrak", "Lainnya"];
const documentExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const photoExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const maxDocumentSize = 10 * 1024 * 1024;
const maxPhotoSize = 8 * 1024 * 1024;

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function hasAllowedExtension(file: File, extensions: string[]) {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kendala yang belum diketahui.";
}

export function AdminProjectDetail() {
  const { id } = useParams();
  const { authState, role } = useDashboardContext();
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<ProjectStage>("Konsultasi");
  const [progress, setProgress] = useState("0");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>("Quotation");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [documentUploadSuccess, setDocumentUploadSuccess] = useState("");
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState("");
  const [documentInputKey, setDocumentInputKey] = useState(0);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const canView = hasPermission(role, "projects:view_all");
  const canManage = hasPermission(role, "projects:manage");
  const canUpload = hasPermission(role, "documents:upload");

  const loadProject = async () => {
    if (!id || !canView) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchProjectBundle(id);
      setBundle(data);
      if (data) {
        setStage(data.project.current_stage);
        setProgress(String(data.project.progress_percentage));
      }
    } catch {
      setError("Detail proyek belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canView]);

  const activeIndex = useMemo(() => {
    if (!bundle) return -1;
    return Math.max(0, trackingStages.indexOf(bundle.project.current_stage));
  }, [bundle]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!bundle) return;

    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Judul dan deskripsi progress wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await addProjectUpdate({
        project_id: bundle.project.id,
        title: title.trim(),
        description: description.trim(),
        stage,
        progress_percentage: normalizeProgress(Number(progress)),
        created_by: authState.user?.id ?? null,
      });
      setTitle("");
      setDescription("");
      setSuccess("Progress proyek berhasil diperbarui.");
      await loadProject();
    } catch {
      setError("Progress belum dapat disimpan. Pastikan role memiliki akses update proyek.");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!bundle || !documentFile) {
      setDocumentUploadError("Pilih file dokumen terlebih dahulu.");
      return;
    }

    setDocumentUploadError("");
    setDocumentUploadSuccess("");

    if (!hasAllowedExtension(documentFile, documentExtensions)) {
      setDocumentUploadError("Format dokumen belum didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG.");
      return;
    }

    if (documentFile.size > maxDocumentSize) {
      setDocumentUploadError("Ukuran dokumen maksimal 10 MB.");
      return;
    }

    const finalName = documentName.trim() || documentFile.name;
    setUploadingDocument(true);
    try {
      await uploadProjectDocument({
        project_id: bundle.project.id,
        file: documentFile,
        file_name: finalName,
        file_type: documentCategory,
        uploaded_by: authState.user?.id ?? null,
      });
      setDocumentFile(null);
      setDocumentName("");
      setDocumentCategory("Quotation");
      setDocumentInputKey((current) => current + 1);
      setDocumentUploadSuccess("Dokumen proyek berhasil diunggah.");
      await loadProject();
    } catch {
      setDocumentUploadError("Dokumen belum dapat diunggah. Periksa bucket Storage dan policy upload.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handlePhotoUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!bundle || !photoFile) {
      setPhotoUploadError("Pilih foto progress terlebih dahulu.");
      return;
    }

    setPhotoUploadError("");
    setPhotoUploadSuccess("");

    if (!hasAllowedExtension(photoFile, photoExtensions)) {
      setPhotoUploadError("Format foto belum didukung. Gunakan JPG, JPEG, PNG, atau WEBP.");
      return;
    }

    if (photoFile.size > maxPhotoSize) {
      setPhotoUploadError("Ukuran foto maksimal 8 MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      await uploadProjectPhoto({
        project_id: bundle.project.id,
        file: photoFile,
        caption: photoCaption.trim() || null,
        uploaded_by: authState.user?.id ?? null,
      });
      setPhotoFile(null);
      setPhotoCaption("");
      setPhotoInputKey((current) => current + 1);
      setPhotoUploadSuccess("Foto progress berhasil diunggah.");
      await loadProject();
    } catch {
      setPhotoUploadError("Foto progress belum dapat diunggah. Periksa bucket Storage dan policy upload.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCopyProjectCode = async () => {
    if (!bundle) return;
    setCopySuccess("");
    setDeleteError("");

    if (!navigator.clipboard) {
      setDeleteError("Kode proyek belum dapat disalin otomatis dari browser ini.");
      return;
    }

    try {
      await navigator.clipboard.writeText(bundle.project.project_code);
      setCopySuccess("Kode proyek disalin.");
    } catch {
      setDeleteError("Kode proyek belum dapat disalin otomatis.");
    }
  };

  const handleDeleteUpdate = async (item: ProjectUpdateRow) => {
    if (!window.confirm("Hapus timeline update ini?")) return;

    setDeleteTargetId(item.id);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      await deleteProjectUpdate(item.id);
      setDeleteSuccess("Timeline update berhasil dihapus.");
      await loadProject();
    } catch (deleteError) {
      setDeleteError(getErrorMessage(deleteError));
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleDeleteDocument = async (item: ProjectDocumentRow) => {
    if (!window.confirm("Hapus dokumen proyek ini?")) return;

    setDeleteTargetId(item.id);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const result = await deleteProjectDocument(item);
      setDeleteSuccess(result.storageWarning ?? "Dokumen proyek berhasil dihapus.");
      await loadProject();
    } catch (deleteError) {
      setDeleteError(getErrorMessage(deleteError));
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleDeletePhoto = async (item: ProjectPhotoRow) => {
    if (!window.confirm("Hapus foto progress ini?")) return;

    setDeleteTargetId(item.id);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const result = await deleteProjectPhoto(item);
      setDeleteSuccess(result.storageWarning ?? "Foto progress berhasil dihapus.");
      await loadProject();
    } catch (deleteError) {
      setDeleteError(getErrorMessage(deleteError));
    } finally {
      setDeleteTargetId(null);
    }
  };

  if (!canView) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Role ini tidak dapat membuka detail proyek.</h1>
          <p>Area ini dibuka untuk super admin, project manager, dan sales sesuai hak akses.</p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="dashboard-content">
        <p className="dashboard-muted">Memuat detail proyek...</p>
      </main>
    );
  }

  if (error && !bundle) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="dashboard-alert">{error}</p>
          <Link className="btn-secondary mt-5 inline-flex" to="/admin/projects">
            Kembali ke Projects
          </Link>
        </section>
      </main>
    );
  }

  if (!bundle) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Project not found</p>
          <h1 className="mt-4 font-serif text-4xl">Project record tidak ditemukan.</h1>
          <p>Periksa kembali URL atau buka daftar proyek.</p>
          <Link className="btn-secondary mt-5 inline-flex" to="/admin/projects">
            Kembali ke Projects
          </Link>
        </section>
      </main>
    );
  }

  const { project, updates, documents, photos } = bundle;

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading project-detail-heading">
        <div>
          <p className="section-label">Project Detail</p>
          <h1>{project.project_name}</h1>
          <p className="mt-4 text-graphite/65">{project.project_code} / {project.clients?.name ?? "Client belum terhubung"}</p>
          {copySuccess && <p className="project-inline-note">{copySuccess}</p>}
        </div>
        <div className="project-heading-actions">
          <span className="status-badge">{project.status}</span>
          <span className="dashboard-status-pill">{project.current_stage}</span>
          <button className="dashboard-ghost-button" type="button" onClick={handleCopyProjectCode}>
            Salin kode
          </button>
        </div>
      </div>

      <section className="dashboard-panel project-operations-panel">
        <div className="project-summary-grid">
          <div><span>Tipe</span><strong>{project.project_type}</strong></div>
          <div><span>Lokasi</span><strong>{project.location ?? "Belum diisi"}</strong></div>
          <div><span>Client</span><strong>{project.clients?.name ?? "Belum terhubung"}</strong></div>
          <div><span>Estimasi</span><strong>{formatDate(project.estimated_completion)}</strong></div>
        </div>
        <div className="mt-8">
          <div className="mb-3 flex justify-between text-sm">
            <span>Progress proyek</span>
            <strong>{project.progress_percentage}%</strong>
          </div>
          <div className="progress-track"><div style={{ width: `${project.progress_percentage}%` }} /></div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-9">
          {trackingStages.map((item, index) => (
            <div key={item} className={`stage-node ${index <= activeIndex ? "is-done" : ""}`}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
        {project.notes && <p className="mt-8 leading-7 text-graphite/70">{project.notes}</p>}
        {(deleteError || deleteSuccess) && (
          <div className="mt-6">
            {deleteError && <p className="dashboard-alert">{deleteError}</p>}
            {deleteSuccess && <p className="dashboard-success">{deleteSuccess}</p>}
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Progress Management</h2>
          {canManage ? (
            <form className="dashboard-form compact" onSubmit={handleSubmit}>
              {error && <p className="dashboard-alert">{error}</p>}
              {success && <p className="dashboard-success">{success}</p>}
              <label>
                Judul update
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Produksi kabinet utama dimulai" />
              </label>
              <label>
                Stage
                <select value={stage} onChange={(event) => setStage(event.target.value as ProjectStage)}>
                  {trackingStages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Progress Percentage
                <div className="progress-input-row">
                  <input type="range" value={progress} onChange={(event) => setProgress(event.target.value)} min={0} max={100} />
                  <input type="number" value={progress} onChange={(event) => setProgress(event.target.value)} min={0} max={100} />
                </div>
              </label>
              <label>
                Progress Description
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tuliskan pembaruan progress yang akan terlihat oleh client." />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Update"}
              </button>
            </form>
          ) : (
            <p>Role ini dapat melihat status proyek, tetapi tidak dapat menambahkan update progress.</p>
          )}
        </article>

        <article className="dashboard-panel">
          <h2>Timeline Updates</h2>
          {updates.length ? (
            updates.map((item) => (
              <div key={item.id} className="dashboard-row">
                <div className="dashboard-item-topline">
                  <span>{formatDate(item.created_at)} / {item.stage} / {item.progress_percentage}%</span>
                  {canManage && (
                    <button
                      className="dashboard-delete-button"
                      type="button"
                      disabled={deleteTargetId === item.id}
                      onClick={() => void handleDeleteUpdate(item)}
                    >
                      {deleteTargetId === item.id ? "Menghapus..." : "Hapus"}
                    </button>
                  )}
                </div>
                <p><strong>{item.title}</strong></p>
                {item.description && <p>{item.description}</p>}
              </div>
            ))
          ) : (
            <div className="dashboard-empty">
              <span>Timeline kosong</span>
              <p>Update progress akan tampil setelah project manager menambahkan pembaruan.</p>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Documents</h2>
          {canUpload ? (
            <form className="dashboard-form compact" onSubmit={handleDocumentUpload}>
              {documentUploadError && <p className="dashboard-alert">{documentUploadError}</p>}
              {documentUploadSuccess && <p className="dashboard-success">{documentUploadSuccess}</p>}
              <label>
                File dokumen
                <input
                  key={documentInputKey}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                />
                <small>PDF, DOC, DOCX, JPG, atau PNG. Maksimal 10 MB.</small>
              </label>
              <label>
                Nama dokumen
                <input value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder="Quotation final" />
              </label>
              <label>
                Kategori dokumen
                <select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value as DocumentCategory)}>
                  {documentCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={uploadingDocument}>
                {uploadingDocument ? "Mengunggah dokumen..." : "Upload Dokumen"}
              </button>
            </form>
          ) : (
            <p>Role ini dapat melihat dokumen proyek, tetapi tidak dapat mengunggah dokumen baru.</p>
          )}
          {documents.length ? (
            <div className="dashboard-file-list">
              {documents.map((item) => (
                <div key={item.id} className="dashboard-file-row">
                  <a href={item.file_url} target="_blank" rel="noreferrer">
                    {item.file_name}<span>{item.file_type ?? "Dokumen"}</span>
                  </a>
                  {canManage && (
                    <button
                      className="dashboard-delete-button"
                      type="button"
                      disabled={deleteTargetId === item.id}
                      onClick={() => void handleDeleteDocument(item)}
                    >
                      {deleteTargetId === item.id ? "Menghapus..." : "Hapus"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="upload-zone">Belum ada dokumen proyek yang diunggah.</div>
          )}
        </article>

        <article className="dashboard-panel">
          <h2>Progress Photos</h2>
          {canUpload ? (
            <form className="dashboard-form compact" onSubmit={handlePhotoUpload}>
              {photoUploadError && <p className="dashboard-alert">{photoUploadError}</p>}
              {photoUploadSuccess && <p className="dashboard-success">{photoUploadSuccess}</p>}
              <label>
                Foto progress
                <input
                  key={photoInputKey}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                />
                <small>JPG, JPEG, PNG, atau WEBP. Maksimal 8 MB.</small>
              </label>
              <label>
                Caption
                <input value={photoCaption} onChange={(event) => setPhotoCaption(event.target.value)} placeholder="Finishing kabinet area pantry" />
              </label>
              <button type="submit" disabled={uploadingPhoto}>
                {uploadingPhoto ? "Mengunggah foto..." : "Upload Foto Progress"}
              </button>
            </form>
          ) : (
            <p>Role ini dapat melihat foto progress, tetapi tidak dapat mengunggah foto baru.</p>
          )}
          {photos.length ? (
            <div className="admin-photo-grid">
              {photos.map((item) => (
                <figure key={item.id}>
                  <img src={item.image_url} alt={item.caption ?? "Foto progress proyek Ambara"} loading="lazy" />
                  <figcaption>
                    <span>{item.caption ?? "Progress proyek"}</span>
                    {canManage && (
                      <button
                        className="dashboard-delete-button"
                        type="button"
                        disabled={deleteTargetId === item.id}
                        onClick={() => void handleDeletePhoto(item)}
                      >
                        {deleteTargetId === item.id ? "Menghapus..." : "Hapus"}
                      </button>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="upload-zone">Belum ada foto progress yang diunggah.</div>
          )}
        </article>
      </section>
    </main>
  );
}
