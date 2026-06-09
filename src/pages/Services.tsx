import { Link } from "react-router-dom";
import { CTASection, PageShell, Reveal } from "../components";
import { services } from "../data";

export function Services() {
  return (
    <PageShell eyebrow="Layanan" title="Layanan detail untuk furnitur, interior, dan ruang yang perlu dirancang dari awal." intro="Setiap layanan disusun seperti panel kerja premium: jelas ruang lingkupnya, tenang prosesnya, dan rapi hasil akhirnya.">
      <section className="section-wrap space-y-6">
        {services.map((service, index) => <Reveal key={service.slug} delay={index * 0.03}><article className="service-detail-panel"><div><span className="text-sm text-champagne">{service.number}</span><h2 className="mt-4 font-serif text-4xl">{service.title}</h2><p className="mt-5 max-w-xl leading-8 text-graphite/72">{service.summary}</p><Link className="text-link mt-8 inline-flex" to="/kontak">Diskusikan layanan</Link></div><div className="detail-columns"><div><h3>Cocok untuk</h3><p>{service.suitable}</p></div><div><h3>Deliverables</h3><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Proses</h3><ul>{service.process.map((item) => <li key={item}>{item}</li>)}</ul></div></div></article></Reveal>)}
      </section>
      <CTASection />
    </PageShell>
  );
}
