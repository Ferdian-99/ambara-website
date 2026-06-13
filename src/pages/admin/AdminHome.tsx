import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminOverview, type ClientRow, type ProjectUpdateRow, type ProjectWithClient } from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import { useDashboardContext } from "./AdminLayout";

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function AdminHome() {
  const { role } = useDashboardContext();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdateRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canViewProjects = hasPermission(role, "projects:view_all");
  const canCreateProject = hasPermission(role, "projects:create");
  const canManagePortfolio = role === "super_admin" || role === "content_manager";

  useEffect(() => {
    if (!canViewProjects) {
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchAdminOverview()
      .then((data) => {
        if (!mounted) return;
        setProjects(data.projects);
        setUpdates(data.updates);
        setClients(data.clients);
      })
      .catch(() => {
        if (mounted) setError("Overview belum dapat dimuat dari Supabase.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canViewProjects]);

  const metrics = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === "active").length;
    const finishing = projects.filter((project) => project.current_stage === "Finishing").length;
    const averageProgress = projects.length
      ? Math.round(projects.reduce((total, project) => total + project.progress_percentage, 0) / projects.length)
      : 0;

    return [
      ["Active Projects", String(activeProjects), "Proyek berjalan"],
      ["Finishing Stage", String(finishing), "Butuh QC akhir"],
      ["Client Records", String(clients.length), "Client terbaru termuat"],
      ["Average Progress", `${averageProgress}%`, "Rata-rata proyek"],
    ];
  }, [clients.length, projects]);

  if (!canViewProjects) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Content Manager</p>
          <h1 className="mt-4 font-serif text-4xl">Kelola konten portfolio publik AMBARA.</h1>
          <p>Role content manager dapat mengatur teks homepage dan showcase portfolio tanpa membuka data proyek operasional.</p>
          {canManagePortfolio && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary inline-flex" to="/admin/homepage">
                Edit Homepage
              </Link>
              <Link className="btn-secondary inline-flex" to="/admin/portfolio">
                Kelola Portfolio
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Overview</p>
          <h1>Kontrol proyek, klien, dan progres produksi.</h1>
        </div>
        {canCreateProject && (
          <Link className="btn-primary" to="/admin/projects/new">
            Buat Proyek
          </Link>
        )}
      </div>

      {loading && <p className="dashboard-muted">Memuat dashboard...</p>}
      {error && <p className="dashboard-alert">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dashboard-metrics">
            {metrics.map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{note}</p>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            {canManagePortfolio && (
              <>
                <article className="dashboard-panel">
                  <p className="section-label">CMS</p>
                  <h2>Edit Homepage</h2>
                  <p>Perbarui teks hero, statistik, tentang, dan layanan unggulan tanpa mengubah desain beranda.</p>
                  <Link className="btn-secondary mt-6 inline-flex" to="/admin/homepage">
                    Buka Homepage CMS
                  </Link>
                </article>
                <article className="dashboard-panel">
                  <p className="section-label">CMS</p>
                  <h2>Kelola Portfolio</h2>
                  <p>Tambah, edit, publish, dan arsipkan showcase publik AMBARA dari dashboard.</p>
                  <Link className="btn-secondary mt-6 inline-flex" to="/admin/portfolio">
                    Buka Portfolio CMS
                  </Link>
                </article>
              </>
            )}
            <article className="dashboard-panel">
              <h2>Recent Project Updates</h2>
              {updates.length ? (
                updates.map((item) => (
                  <div key={item.id} className="dashboard-row">
                    <span>{formatDate(item.created_at)} / {item.stage}</span>
                    <p><strong>{item.title}</strong></p>
                    {item.description && <p>{item.description}</p>}
                  </div>
                ))
              ) : (
                <div className="dashboard-empty">
                  <span>Belum ada update</span>
                  <p>Timeline terbaru akan muncul setelah project manager menambahkan pembaruan.</p>
                </div>
              )}
            </article>

            <article className="dashboard-panel">
              <h2>Active Projects</h2>
              {projects.length ? (
                projects.map((project) => (
                  <Link key={project.id} to={`/admin/projects/${project.id}`} className="dashboard-row dashboard-link-row">
                    <span>{project.project_code} / {project.current_stage} / {project.progress_percentage}%</span>
                    <p><strong>{project.project_name}</strong></p>
                    <p>{project.clients?.name ?? "Client belum terhubung"} / Estimasi {formatDate(project.estimated_completion)}</p>
                  </Link>
                ))
              ) : (
                <div className="dashboard-empty">
                  <span>Belum ada proyek</span>
                  <p>Project record akan muncul setelah dibuat.</p>
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
