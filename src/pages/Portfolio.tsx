import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, Reveal, VisualBlock } from "../components";
import { portfolioProjects } from "../data";

const categories = ["Semua", "Residensial", "Villa", "Komersial", "Hospitality"];

export function Portfolio() {
  const [active, setActive] = useState("Semua");
  const projects = useMemo(() => active === "Semua" ? portfolioProjects : portfolioProjects.filter((project) => project.category === active), [active]);
  return (
    <PageShell eyebrow="Portofolio" title="Galeri ruang yang dikurasi dengan ritme editorial dan detail arsitektural." intro="Setiap proyek adalah studi tentang kebiasaan, material, cahaya, dan cara sebuah ruang digunakan dalam jangka panjang.">
      <section className="section-wrap"><div className="flex flex-wrap gap-3">{categories.map((category) => <button key={category} type="button" onClick={() => setActive(category)} className={`filter-pill ${active === category ? "is-active" : ""}`}>{category}</button>)}</div><div className="mt-12 grid gap-7 md:grid-cols-12">{projects.map((project, index) => <Reveal key={project.slug} className={`${index % 3 === 0 ? "md:col-span-7" : "md:col-span-5"}`}><Link to={`/portofolio/${project.slug}`} className="group block"><VisualBlock tone={project.tone} tall={index % 3 === 0} /><div className="portfolio-caption"><div><p>{project.category} • {project.location}</p><h2>{project.title}</h2><span>{project.type}</span></div><strong>{project.year}</strong></div></Link></Reveal>)}</div></section>
    </PageShell>
  );
}
