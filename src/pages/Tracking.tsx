import { useState } from "react";
import { PageShell, Reveal, SectionLabel } from "../components";
import { trackingStages } from "../data";

export function Tracking() {
  const [code, setCode] = useState("AMB-2026-001");
  const activeIndex = 4;
  const progress = 58;

  return (
    <PageShell
      eyebrow="Lacak Proyek"
      title="Preview pelacakan proyek untuk pengalaman klien yang lebih jelas."
      intro="Halaman ini adalah mock frontend publik. Belum ada backend, database, login, atau data proyek sungguhan."
    >
      <section className="section-wrap">
        <div className="tracking-panel">
          <div>
            <SectionLabel>Project Monitoring</SectionLabel>
            <h2 className="font-serif text-4xl">Masukkan kode proyek</h2>
            <p className="mt-4 leading-7 text-graphite/70">
              Gunakan contoh kode <strong>AMB-2026-001</strong> untuk melihat simulasi progres produksi.
            </p>
          </div>
          <form className="tracking-form" onSubmit={(event) => event.preventDefault()}>
            <input value={code} onChange={(event) => setCode(event.target.value)} aria-label="Kode proyek" />
            <button type="submit">Lacak</button>
          </form>
        </div>

        <Reveal>
          <article className="mock-project-card">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-champagne">Mock Project</p>
                <h2 className="mt-3 font-serif text-4xl">Residensi Senja - Built-in Living Cabinet</h2>
                <p className="mt-3 text-graphite/65">Client: Nama Klien / Kode: {code || "AMB-2026-001"}</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <div className="status-badge">Produksi</div>
                <p className="text-sm text-graphite/60">Last update: 10 Juni 2026</p>
              </div>
            </div>

            <div className="project-monitor-grid">
              <div><span>Payment status</span><strong>DP diterima / Termin produksi menunggu approval</strong></div>
              <div><span>Project PIC</span><strong>Nadia S. - Project Coordinator</strong></div>
              <div><span>Estimated completion</span><strong>28 Juli 2026</strong></div>
            </div>

            <div className="mt-10">
              <div className="mb-3 flex justify-between text-sm"><span>Progress proyek</span><strong>{progress}%</strong></div>
              <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-9">
              {trackingStages.map((stage, index) => (
                <div key={stage} className={`stage-node ${index <= activeIndex ? "is-done" : ""}`}>
                  <span>{index + 1}</span>
                  <p>{stage}</p>
                </div>
              ))}
            </div>

            <div className="progress-note">
              <strong>Progress notes</strong>
              <p>
                Panel kabinet utama sudah masuk tahap produksi. Tim workshop sedang menyelesaikan struktur dasar
                sebelum masuk proses veneer dan finishing akhir.
              </p>
            </div>
          </article>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <section className="timeline-card">
              <h2>Timeline pembaruan</h2>
              {[
                ["10 Juni 2026", "Produksi kabinet utama dimulai setelah approval material."],
                ["06 Juni 2026", "Revisi detail handle dan proporsi panel disetujui."],
                ["31 Mei 2026", "Konsep desain dan material board dikirim ke klien."],
              ].map(([date, text]) => <div key={date} className="timeline-row"><span>{date}</span><p>{text}</p></div>)}
            </section>
          </Reveal>
          <Reveal delay={0.06}>
            <section className="timeline-card">
              <h2>Dokumen Proyek</h2>
              <div className="placeholder-grid">
                {["Quotation", "Desain Final", "Invoice"].map((item) => <div key={item}>{item}<span>Preview dokumen</span></div>)}
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal>
          <section className="timeline-card">
            <h2>Workshop Progress Photo</h2>
            <p className="mb-6 leading-7 text-graphite/70">
              Fitur monitoring proyek ini akan membantu klien membaca perkembangan workshop secara visual pada fase sistem real berikutnya.
            </p>
            <div className="workshop-visual">
              <img src="/assets/workshop-progress.png" alt="Preview foto progress workshop furnitur Ambara" loading="lazy" />
              <div className="workshop-grid">
                {["Rangka kabinet", "Proses veneer", "Hardware fitting", "Finishing sample"].map((item) => <div key={item}>{item}</div>)}
              </div>
            </div>
          </section>
        </Reveal>
      </section>
    </PageShell>
  );
}
