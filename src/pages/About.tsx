import { CompanyProfileVideo, CTASection, PageShell, Reveal, SectionLabel, VisualBlock } from "../components";
import { whyAmbara } from "../data";

export function About() {
  return (
    <PageShell eyebrow="Tentang Ambara" title="Studio custom interior yang merancang, memproduksi, dan memasang dengan presisi." intro="AMBARA membantu hunian, office, dan cafe memiliki interior yang rapi secara fungsi, kuat secara produksi, dan tetap terasa premium dalam penggunaan harian.">
      <section className="section-wrap">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal><VisualBlock tall /></Reveal>
          <div className="space-y-10">
            {[
              ["Brand story", "Kami memulai dari kebutuhan klien yang menginginkan ruang personal dan siap dipakai: bukan sekadar indah untuk difoto, tetapi nyaman dihuni, mudah dirawat, dan rapi sejak instalasi selesai."],
              ["Design philosophy", "Desain AMBARA berangkat dari ritme hidup, skala ruang, kebutuhan storage, karakter material, dan batas produksi. Kami memilih garis yang tegas seperlunya agar ruang tetap bernapas."],
              ["Studio profile", "Tim kami menangani konsep, gambar kerja, detail built-in furniture, koordinasi produksi, instalasi, dan pengecekan akhir dengan komunikasi yang tenang dan terukur."],
            ].map(([title, body]) => (
              <Reveal key={title}>
                <article className="editorial-block">
                  <h2>{title}</h2>
                  <p>{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CompanyProfileVideo />

      <section className="bg-charcoal py-20 text-linen md:py-28">
        <div className="content-grid">
          <div>
            <SectionLabel>Craftsmanship Values</SectionLabel>
            <h2 className="section-title text-linen">Nilai kerja yang terasa pada detail akhir.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Proporsi tegas", "Produksi terukur", "Finishing rapi", "Instalasi jelas"].map((item, index) => (
              <Reveal key={item} delay={index * 0.04}><div className="dark-panel"><span>0{index + 1}</span><p>{item}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="content-grid">
          <div>
            <SectionLabel>Material Approach</SectionLabel>
            <h2 className="section-title">Kami memilih material dengan mempertimbangkan rupa, fungsi, produksi, dan perawatan.</h2>
          </div>
          <p className="lead-copy">Ivory, stone gray, charcoal, champagne metal, HPL premium, veneer, hardware soft-close, dan tekstur kayu yang tertahan disusun agar ruang terasa premium tanpa menjadi berat.</p>
        </div>
        <div className="mt-12 grid gap-px bg-charcoal/10 md:grid-cols-5">
          {whyAmbara.map((item, index) => <div key={item} className="bg-ivory p-6"><span className="text-champagne">0{index + 1}</span><p className="mt-8 leading-7">{item}</p></div>)}
        </div>
      </section>
      <CTASection />
    </PageShell>
  );
}
