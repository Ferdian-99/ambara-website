import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trackingStages } from "../../data";
import { fetchClientProjectBundle, type ProjectBundle } from "../../lib/projectData";
import { useClientContext } from "./ClientLayout";

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function ClientProjectDetail() {
  const { id } = useParams();
  const { authState } = useClientContext();
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = authState.user?.id;
    if (!id || !userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchClientProjectBundle(id, userId)
      .then((data) => {
        if (mounted) setBundle(data);
      })
      .catch(() => {
        if (mounted) setError("Detail proyek belum dapat dimuat.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authState.user?.id, id]);

  const activeIndex = useMemo(() => {
    if (!bundle) return -1;
    return Math.max(0, trackingStages.indexOf(bundle.project.current_stage));
  }, [bundle]);

  if (loading) {
    return (
      <main className="dashboard-content">
        <p className="dashboard-muted">Memuat detail proyek...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="dashboard-alert">{error}</p>
          <Link className="btn-secondary mt-5 inline-flex" to="/client/projects">
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
          <p className="section-label">Proyek tidak ditemukan</p>
          <h1 className="mt-4 font-serif text-4xl">Project tidak ditemukan untuk akun ini.</h1>
          <p>Client hanya dapat melihat proyek yang terhubung dengan akun mereka.</p>
          <Link className="btn-secondary mt-5 inline-flex" to="/client/projects">
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
          <p className="section-label">Project Monitoring</p>
          <h1>{project.project_name}</h1>
          <p className="mt-4 text-graphite/65">{project.project_code} / {project.project_type}</p>
        </div>
        <span className="status-badge">{project.current_stage}</span>
      </div>

      <section className="dashboard-panel">
        <div className="project-summary-grid">
          <div><span>Status</span><strong>{project.status}</strong></div>
          <div><span>Lokasi</span><strong>{project.location ?? "Belum diisi"}</strong></div>
          <div><span>Estimasi</span><strong>{formatDate(project.estimated_completion)}</strong></div>
          <div><span>Progress</span><strong>{project.progress_percentage}%</strong></div>
        </div>
        <div className="mt-8">
          <div className="mb-3 flex justify-between text-sm">
            <span>Progress proyek</span>
            <strong>{project.progress_percentage}%</strong>
          </div>
          <div className="progress-track">
            <div style={{ width: `${project.progress_percentage}%` }} />
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-9">
          {trackingStages.map((stage, index) => (
            <div key={stage} className={`stage-node ${index <= activeIndex ? "is-done" : ""}`}>
              <span>{index + 1}</span>
              <p>{stage}</p>
            </div>
          ))}
        </div>
        {project.notes && <p className="mt-8 leading-7 text-graphite/70">{project.notes}</p>}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Timeline Progress</h2>
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
              <span>Timeline belum diperbarui</span>
              <p>Pembaruan akan tampil setelah tim AMBARA menambahkan progress terbaru.</p>
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <h2>Dokumen</h2>
          {documents.length ? (
            <div className="placeholder-grid">
              {documents.map((item) => (
                <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer">
                  {item.file_name}<span>{item.file_type ?? "Dokumen"}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <span>Dokumen belum tersedia</span>
              <p>Quotation, desain final, dan invoice akan tampil setelah diunggah oleh tim AMBARA.</p>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-panel mt-8">
        <h2>Foto Progress</h2>
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
          <div className="dashboard-empty">
            <span>Foto belum tersedia</span>
            <p>Dokumentasi progress akan muncul setelah tim AMBARA mengunggah pembaruan visual.</p>
          </div>
        )}
      </section>
    </main>
  );
}
