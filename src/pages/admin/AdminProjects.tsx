import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminProjects, type ProjectWithClient } from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import { useDashboardContext } from "./AdminLayout";

export function AdminProjects() {
  const { role } = useDashboardContext();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreate = hasPermission(role, "projects:create");
  const canView = hasPermission(role, "projects:view_all");

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchAdminProjects()
      .then((rows) => {
        if (mounted) setProjects(rows);
      })
      .catch(() => {
        if (mounted) setError("Daftar proyek belum dapat dimuat. Periksa koneksi atau konfigurasi RLS.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canView]);

  if (!canView) {
    return (
      <main className="dashboard-content">
        <AccessPanel />
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Projects</p>
          <h1>Daftar proyek dan status pengerjaan.</h1>
        </div>
        {canCreate && (
          <Link className="btn-primary" to="/admin/projects/new">
            Buat Proyek
          </Link>
        )}
      </div>

      <section className="dashboard-panel">
        {loading && <p className="dashboard-muted">Memuat proyek AMBARA...</p>}
        {error && <p className="dashboard-alert">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <div className="dashboard-empty">
            <span>Belum ada proyek</span>
            <p>Project record akan tampil di sini setelah dibuat oleh tim AMBARA.</p>
          </div>
        )}
        {!loading && !error && projects.length > 0 && (
          <div className="dashboard-table">
            <div className="dashboard-table-head project-table">
              <span>Kode</span>
              <span>Proyek</span>
              <span>Client</span>
              <span>Stage</span>
              <span>Progress</span>
              <span>Lokasi</span>
            </div>
            {projects.map((project) => (
              <Link key={project.id} to={`/admin/projects/${project.id}`} className="dashboard-table-row project-table">
                <span>{project.project_code}</span>
                <strong>{project.project_name}</strong>
                <span>{project.clients?.name ?? "Client belum terhubung"}</span>
                <span>{project.current_stage}</span>
                <span>{project.progress_percentage}%</span>
                <span>{project.location ?? "Belum diisi"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function AccessPanel() {
  return (
    <section className="dashboard-panel">
      <p className="section-label">Content Manager</p>
      <h1 className="mt-4 font-serif text-4xl">Area CMS disiapkan untuk fase berikutnya.</h1>
      <p>Role ini dapat masuk dashboard, tetapi pengelolaan proyek tidak dibuka pada fase ini.</p>
    </section>
  );
}
