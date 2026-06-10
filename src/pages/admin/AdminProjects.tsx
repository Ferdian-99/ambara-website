import { Link } from "react-router-dom";

const projectRows = [
  ["AMB-2026-001", "Residensi Senja", "Produksi", "58%", "Jakarta Selatan"],
  ["AMB-2026-002", "Villa Aksara", "Konsep Desain", "24%", "Bali"],
  ["AMB-2026-003", "Studio Nara", "Finishing", "82%", "Bandung"],
];

export function AdminProjects() {
  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Projects</p>
          <h1>Daftar proyek dan status pengerjaan.</h1>
        </div>
        <Link className="btn-primary" to="/admin/projects/new">
          Buat Proyek
        </Link>
      </div>
      <section className="dashboard-panel">
        <div className="dashboard-table">
          <div className="dashboard-table-head">
            <span>Kode</span>
            <span>Proyek</span>
            <span>Stage</span>
            <span>Progress</span>
            <span>Lokasi</span>
          </div>
          {projectRows.map(([code, name, stage, progress, location]) => (
            <Link key={code} to={`/admin/projects/${code}`} className="dashboard-table-row">
              <span>{code}</span>
              <strong>{name}</strong>
              <span>{stage}</span>
              <span>{progress}</span>
              <span>{location}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
