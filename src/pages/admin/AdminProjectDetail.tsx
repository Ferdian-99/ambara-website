import { useParams } from "react-router-dom";
import { trackingStages } from "../../data";

export function AdminProjectDetail() {
  const { id } = useParams();

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Project Detail</p>
          <h1>{id ?? "AMB-2026-001"}</h1>
        </div>
        <span className="status-badge">Produksi</span>
      </div>
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Update Progress</h2>
          <form className="dashboard-form compact">
            <label>
              Stage
              <select defaultValue="Produksi">
                {trackingStages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label>
              Progress Percentage
              <input type="number" defaultValue={58} min={0} max={100} />
            </label>
            <label>
              Progress Notes
              <textarea defaultValue="Panel utama masuk tahap produksi workshop." />
            </label>
            <button type="button">Simpan Update</button>
          </form>
        </article>
        <article className="dashboard-panel">
          <h2>Upload Struktur</h2>
          <div className="upload-zone">Upload progress photos ke bucket `project-photos`.</div>
          <div className="upload-zone">Upload quotation, desain final, invoice ke bucket `project-documents`.</div>
        </article>
      </section>
    </main>
  );
}
