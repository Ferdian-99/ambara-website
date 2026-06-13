import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjectsForClientUser, type ClientProjectSummary } from "../../lib/projectData";
import { useClientContext } from "./ClientLayout";

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function ClientProjects() {
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
        if (mounted) setError("Daftar proyek belum dapat dimuat.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authState.user?.id]);

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Proyek Saya</p>
          <h1>Proyek yang terhubung dengan akun Anda.</h1>
        </div>
      </div>

      <section className="dashboard-panel">
        {loading && <p className="dashboard-muted">Memuat proyek...</p>}
        {error && <p className="dashboard-alert">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <div className="dashboard-empty">
            <span>Belum ada proyek</span>
            <p>Proyek akan tampil setelah tim AMBARA menghubungkannya dengan akun client Anda.</p>
          </div>
        )}
        {!loading && !error && projects.map((project) => (
          <Link key={project.id} to={`/client/projects/${project.id}`} className="client-project-card">
            <span>{project.project_code} / {project.current_stage}</span>
            <h2>{project.project_name}</h2>
            <p>{project.project_type} / {project.location ?? "Lokasi belum diisi"}</p>
            <div className="mt-5">
              <div className="mb-3 flex justify-between text-sm">
                <span>Progress</span>
                <strong>{project.progress_percentage}%</strong>
              </div>
              <div className="progress-track"><div style={{ width: `${project.progress_percentage}%` }} /></div>
            </div>
            <p>Estimasi selesai: {formatDate(project.estimated_completion)}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
