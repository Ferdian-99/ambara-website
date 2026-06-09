import { CTASection, PageShell, Reveal, SectionLabel, VisualBlock } from "../components";
import { whyAmbara } from "../data";

export function About() {
  return (
    <PageShell eyebrow="Tentang Ambara" title="Studio furnitur dan interior yang bekerja dengan hening, presisi, dan rasa ruang." intro="AMBARA lahir dari keyakinan bahwa ruang terbaik tidak perlu banyak bicara. Ia cukup hadir dengan proporsi yang benar, material yang jujur, dan detail yang selesai dengan rapi.">
      <section className="section-wrap"><div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"><Reveal><VisualBlock tall /></Reveal><div className="space-y-10">{[["Brand story", "Kami memulai dari kebutuhan klien yang menginginkan ruang personal: bukan sekadar indah untuk difoto, tetapi nyaman untuk dihuni, mudah dirawat, dan terasa matang dari hari pertama."], ["Design philosophy", "Desain AMBARA berangkat dari ritme hidup, cahaya, skala ruang, dan karakter material. Kami memilih garis yang seperlunya agar ruang punya napas."], ["Studio profile", "Tim kecil kami menangani konsep, detail furnitur, koordinasi produksi, dan final styling dengan komunikasi yang tenang dan terukur."]].map(([title, body]) => <Reveal key={title}><article className="editorial-block"><h2>{title}</h2><p>{body}</p></article></Reveal>)}</div></div></section>
      <section className="bg-charcoal py-20 text-linen md:py-28"><div className="content-grid"><div><SectionLabel>Craftsmanship Values</SectionLabel><h2 className="section-title text-linen">Nilai kerja yang terasa pada detail akhir.</h2></div><div className="grid gap-4 sm:grid-cols-2">{["Proporsi tenang", "Material terukur", "Finishing rapi", "Komunikasi jelas"].map((item, index) => <Reveal key={item} delay={index * 0.04}><div className="dark-panel"><span>0{index + 1}</span><p>{item}</p></div></Reveal>)}</div></div></section>
      <section className="section-wrap"><div className="content-grid"><div><SectionLabel>Material Approach</SectionLabel><h2 className="section-title">Kami memilih material seperti memilih nada: tidak semua harus dominan.</h2></div><p className="lead-copy">Ivory, stone gray, charcoal, champagne metal, linen, plaster matte, dan tekstur kayu yang tertahan disusun agar saling memberi ruang. Hasilnya premium tanpa terasa berat.</p></div><div className="mt-12 grid gap-px bg-charcoal/10 md:grid-cols-5">{whyAmbara.map((item, index) => <div key={item} className="bg-ivory p-6"><span className="text-champagne">0{index + 1}</span><p className="mt-8 leading-7">{item}</p></div>)}</div></section>
      <CTASection />
    </PageShell>
  );
}
