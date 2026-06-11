import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trackingStages } from "../../data";
import {
  addProjectUpdate,
  fetchProjectBundle,
  normalizeProgress,
  type ProjectBundle,
} from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import type { ProjectStage } from "../../lib/supabase";
import { useDashboardContext } from "./AdminLayout";

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
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

  const canView = hasPermission(role, "projects:view_all");
  const canManage = hasPermission(role, "projects:manage");

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
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Project Detail</p>
          <h1>{project.project_name}</h1>
          <p className="mt-4 text-graphite/65">{project.project_code} / {project.clients?.name ?? "Client belum terhubung"}</p>
        </div>
        <span className="status-badge">{project.current_stage}</span>
      </div>

      <section className="dashboard-panel">
        <div className="project-summary-grid">
          <div><span>Tipe</span><strong>{project.project_type}</strong></div>
          <div><span>Lokasi</span><strong>{project.location ?? "Belum diisi"}</strong></div>
          <div><span>Status</span><strong>{project.status}</strong></div>
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
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Update Progress</h2>
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
                <input type="number" value={progress} onChange={(event) => setProgress(event.target.value)} min={0} max={100} />
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
                <span>{formatDate(item.created_at)} / {item.stage} / {item.progress_percentage}%</span>
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
          {documents.length ? (
            <div className="placeholder-grid">
              {documents.map((item) => (
                <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer">
                  {item.file_name}<span>{item.file_type ?? "Dokumen"}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="upload-zone">Belum ada dokumen. Upload file akan diaktifkan pada fase berikutnya.</div>
          )}
        </article>

        <article className="dashboard-panel">
          <h2>Progress Photos</h2>
          {photos.length ? (
            <div className="admin-photo-grid">
              {photos.map((item) => (
                <figure key={item.id}>
                  <img src={item.image_url} alt={item.caption ?? "Foto progress proyek Ambara"} loading="lazy" />
                  <figcaption>{item.caption ?? "Progress proyek"}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="upload-zone">Belum ada foto progress. Upload foto akan diaktifkan pada fase berikutnya.</div>
          )}
        </article>
      </section>
    </main>
  );
}
