import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjectsForClientUser, type ClientProjectSummary } from "../../lib/projectData";
import { useClientContext } from "./ClientLayout";

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function ClientHome() {
  const { authState } = useClientContext();
  const [projects, setProjects] = useState<ClientProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = authState.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchProjectsForClientUser(userId)
      .then((rows) => {
        if (mounted) setProjects(rows);
      })
      .catch(() => {
        if (mounted) setError("Ringkasan proyek belum dapat dimuat.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authState.user?.id]);

  const featuredProject = projects[0] ?? null;
  const averageProgress = useMemo(() => {
    if (!projects.length) return 0;
    return Math.round(projects.reduce((total, project) => total + project.progress_percentage, 0) / projects.length);
  }, [projects]);

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Client Overview</p>
          <h1>Ringkasan proyek dan pembaruan terbaru.</h1>
        </div>
        <Link className="btn-secondary" to="/client/projects">
          Lihat Proyek
        </Link>
      </div>

      {loading && <p className="dashboard-muted">Memuat proyek Anda...</p>}
      {error && <p className="dashboard-alert">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <section className="dashboard-panel">
          <div className="dashboard-empty">
            <span>Belum ada proyek terhubung</span>
            <p>Project akan muncul setelah tim AMBARA menghubungkan client record dengan akun Anda.</p>
          </div>
        </section>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <section className="dashboard-metrics">
            <article>
              <span>Tahap Saat Ini</span>
              <strong>{featuredProject?.current_stage}</strong>
              <p>{featuredProject?.project_name}</p>
            </article>
            <article>
              <span>Progress</span>
              <strong>{averageProgress}%</strong>
              <p>Rata-rata progress proyek</p>
            </article>
            <article>
              <span>Estimasi Selesai</span>
              <strong>{formatDate(featuredProject?.estimated_completion ?? null)}</strong>
              <p>Estimasi project terbaru</p>
            </article>
            <article>
              <span>Total Proyek</span>
              <strong>{projects.length}</strong>
              <p>Terhubung dengan akun Anda</p>
            </article>
          </section>

          <section className="dashboard-panel mt-8">
            <h2>Proyek terbaru</h2>
            {projects.slice(0, 3).map((project) => (
              <Link key={project.id} to={`/client/projects/${project.id}`} className="dashboard-row dashboard-link-row">
                <span>{project.project_code} / {project.current_stage} / {project.progress_percentage}%</span>
                <p><strong>{project.project_name}</strong></p>
                <p>{project.project_type} / Estimasi {formatDate(project.estimated_completion)}</p>
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
