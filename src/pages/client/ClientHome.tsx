import { Link } from "react-router-dom";

export function ClientHome() {
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
      <section className="dashboard-metrics">
        <article>
          <span>Current Stage</span>
          <strong>Produksi</strong>
          <p>Residensi Senja</p>
        </article>
        <article>
          <span>Progress</span>
          <strong>58%</strong>
          <p>Berjalan sesuai rencana</p>
        </article>
        <article>
          <span>Estimated Completion</span>
          <strong>28 Jul</strong>
          <p>Estimasi serah terima</p>
        </article>
      </section>
      <section className="dashboard-panel">
        <h2>Pembaruan terbaru</h2>
        <div className="dashboard-row">
          <span>10 Juni 2026</span>
          <p>Panel kabinet utama sudah masuk tahap produksi workshop.</p>
        </div>
      </section>
    </main>
  );
}
