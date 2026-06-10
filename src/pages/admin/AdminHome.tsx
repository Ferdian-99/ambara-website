import { Link } from "react-router-dom";
import { useDashboardContext } from "./AdminLayout";

const metrics = [
  ["Active Projects", "12", "Proyek berjalan"],
  ["Finishing Stage", "4", "Butuh QC akhir"],
  ["Client Updates", "18", "Pembaruan bulan ini"],
  ["Documents", "36", "File proyek tersimpan"],
];

export function AdminHome() {
  const { role } = useDashboardContext();

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Overview</p>
          <h1>Kontrol proyek, klien, dan progres produksi.</h1>
        </div>
        <Link className="btn-primary" to="/admin/projects/new">
          Buat Proyek
        </Link>
      </div>
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
        <article className="dashboard-panel">
          <h2>Recent Project Updates</h2>
          {["Produksi kabinet Residensi Senja dimulai", "Desain final Villa Aksara disetujui", "Invoice Studio Nara diunggah"].map((item) => (
            <div key={item} className="dashboard-row">
              <span>Hari ini</span>
              <p>{item}</p>
            </div>
          ))}
        </article>
        <article className="dashboard-panel">
          <h2>Akses Role</h2>
          <p>
            Role aktif saat ini: <strong>{role}</strong>. Pembatasan route berjalan di frontend dan harus diperkuat dengan Row Level Security Supabase.
          </p>
        </article>
      </section>
    </main>
  );
}
