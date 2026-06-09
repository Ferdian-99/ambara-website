import { CTASection, PageShell, Reveal, SectionLabel } from "../components";
import { processSteps } from "../data";

const descriptions = [
  "Membaca kebutuhan, karakter ruang, anggaran arah, dan ekspektasi hasil akhir.",
  "Mengambil dimensi, kondisi cahaya, titik teknis, dan batasan lapangan.",
  "Menyusun arah visual, proporsi, material utama, dan mood ruang.",
  "Merawat masukan klien tanpa membuat konsep kehilangan ketenangannya.",
  "Mengunci desain, material, timeline, dan lingkup produksi.",
  "Mengerjakan furnitur dan elemen interior dengan kontrol ukuran dan struktur.",
  "Merapikan permukaan, warna, hardware, dan detail pertemuan material.",
  "Mengatur pengiriman agar item tiba aman dan sesuai urutan instalasi.",
  "Memasang, menyetel, membersihkan, dan memastikan detail bekerja di ruang nyata.",
  "Menyerahkan hasil akhir beserta catatan perawatan dan dokumentasi proyek.",
];

export function Process() {
  return (
    <PageShell eyebrow="Proses Kerja" title="Proses yang jelas membuat ruang premium terasa lebih tenang sejak awal." intro="AMBARA membagi pekerjaan menjadi tahapan yang mudah dipahami klien, tanpa membuka backend atau sistem tracking sungguhan pada fase visual ini.">
      <section className="section-wrap"><div className="process-board">{processSteps.map((step, index) => <Reveal key={step} delay={index * 0.025}><article className="process-card"><span>{String(index + 1).padStart(2, "0")}</span><h2>{step}</h2><p>{descriptions[index]}</p></article></Reveal>)}</div></section>
      <section className="bg-charcoal py-20 text-linen md:py-28"><div className="content-grid"><div><SectionLabel>Komunikasi</SectionLabel><h2 className="section-title text-linen">Setiap keputusan penting dibuat terlihat, terukur, dan mudah diikuti.</h2></div><p className="lead-copy text-linen/70">Pada fase berikutnya, alur ini bisa dikembangkan menjadi sistem tracking real dengan akun klien, dashboard admin, RBAC, dokumen proyek, dan pembaruan produksi. Untuk saat ini, semua masih berupa preview frontend.</p></div></section>
      <CTASection />
    </PageShell>
  );
}
