import { Link, useParams } from "react-router-dom";
import { CTASection, PageShell, Reveal, SectionLabel, VisualBlock } from "../components";
import { portfolioProjects } from "../data";

export function PortfolioDetail() {
  const { slug } = useParams();
  const project = portfolioProjects.find((item) => item.slug === slug) ?? portfolioProjects[0];
  return (
    <PageShell eyebrow={project.category} title={project.title} intro={project.concept}>
      <section className="section-wrap"><div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><VisualBlock tone={project.tone} tall /><div className="project-meta"><div><span>Tipe</span><p>{project.type}</p></div><div><span>Tahun</span><p>{project.year}</p></div><div><span>Lokasi</span><p>{project.location}</p></div></div></div></section>
      <section className="bg-linen py-20 md:py-28"><div className="content-grid"><div><SectionLabel>Design Concept</SectionLabel><h2 className="section-title">{project.concept}</h2></div><div><p className="lead-copy">{project.solution}</p><div className="mt-8 flex flex-wrap gap-2">{project.materials.map((item) => <span key={item} className="material-pill">{item}</span>)}</div></div></div></section>
      <section className="section-wrap"><div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((item) => <Reveal key={item}><VisualBlock tone={project.tone} /></Reveal>)}</div></section>
      <section className="section-wrap pt-0"><div className="grid gap-6 md:grid-cols-2"><article className="editorial-block"><h2>Project challenge</h2><p>{project.challenge}</p></article><article className="editorial-block"><h2>Solution</h2><p>{project.solution}</p></article></div><Link className="text-link mt-10 inline-flex" to="/portofolio">Kembali ke portofolio</Link></section>
      <CTASection />
    </PageShell>
  );
}
