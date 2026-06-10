import { useParams } from "react-router-dom";
import { trackingStages } from "../../data";

export function ClientProjectDetail() {
  const { id } = useParams();

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Project Monitoring</p>
          <h1>{id ?? "AMB-2026-001"}</h1>
        </div>
        <span className="status-badge">Produksi</span>
      </div>
      <section className="dashboard-panel">
        <div className="mb-3 flex justify-between text-sm">
          <span>Progress proyek</span>
          <strong>58%</strong>
        </div>
        <div className="progress-track">
          <div style={{ width: "58%" }} />
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-9">
          {trackingStages.map((stage, index) => (
            <div key={stage} className={`stage-node ${index <= 4 ? "is-done" : ""}`}>
              <span>{index + 1}</span>
              <p>{stage}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Timeline Updates</h2>
          <div className="dashboard-row">
            <span>10 Juni 2026</span>
            <p>Produksi kabinet utama dimulai setelah approval material.</p>
          </div>
          <div className="dashboard-row">
            <span>06 Juni 2026</span>
            <p>Revisi detail handle dan proporsi panel disetujui.</p>
          </div>
        </article>
        <article className="dashboard-panel">
          <h2>Documents</h2>
          <div className="placeholder-grid">
            {["Quotation", "Desain Final", "Invoice"].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
