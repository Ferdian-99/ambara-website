import { Link } from "react-router-dom";

export function ClientProjects() {
  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">My Projects</p>
          <h1>Proyek yang terhubung dengan akun Anda.</h1>
        </div>
      </div>
      <section className="dashboard-panel">
        <Link to="/client/projects/AMB-2026-001" className="client-project-card">
          <span>AMB-2026-001</span>
          <h2>Residensi Senja - Built-in Living Cabinet</h2>
          <p>Stage: Produksi / Progress: 58%</p>
        </Link>
      </section>
    </main>
  );
}
