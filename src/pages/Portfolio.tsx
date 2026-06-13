import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, Reveal, VisualBlock } from "../components";
import { portfolioProjects } from "../data";
import { listPublishedPortfolioItems, type PortfolioItemRow } from "../lib/portfolioData";

const filterCategories = ["Semua", "Residensial", "Villa", "Komersial"];

const fallbackItems: PortfolioItemRow[] = portfolioProjects.map((project, index) => ({
  id: project.slug,
  title: project.title,
  slug: project.slug,
  category: project.category,
  location: project.location,
  year: project.year,
  short_description: project.concept,
  description: project.solution,
  cover_image_url: project.imageSrc,
  gallery_urls: [project.imageSrc],
  services: [project.type],
  materials: project.materials,
  is_featured: index === 0,
  sort_order: index * 10,
  published_at: new Date().toISOString(),
  archived_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export function Portfolio() {
  const [active, setActive] = useState("Semua");
  const [cmsItems, setCmsItems] = useState<PortfolioItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listPublishedPortfolioItems()
      .then((items) => {
        if (mounted) setCmsItems(items);
      })
      .catch(() => {
        if (mounted) setCmsItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const items = cmsItems.length ? cmsItems : fallbackItems;
  const projects = useMemo(
    () => active === "Semua"
      ? items
      : items.filter((project) => project.category?.trim().toLowerCase() === active.toLowerCase()),
    [active, items],
  );

  return (
    <PageShell
      eyebrow="Portofolio"
      title="Galeri ruang yang dikurasi dengan ritme editorial dan detail arsitektural."
      intro="Setiap proyek adalah studi tentang kebiasaan, material, cahaya, dan cara sebuah ruang digunakan dalam jangka panjang."
    >
      <section className="section-wrap">
        {loading && <p className="mb-6 text-sm uppercase tracking-[0.2em] text-champagne">Memuat portfolio...</p>}
        <div className="flex flex-wrap gap-3">
          {filterCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={`filter-pill ${active === category ? "is-active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-12">
          {projects.map((project, index) => (
            <Reveal key={project.slug} className={`${index % 3 === 0 ? "md:col-span-7" : "md:col-span-5"}`}>
              <Link to={`/portofolio/${project.slug}`} className="group block">
                <VisualBlock
                  tall={index % 3 === 0}
                  imageSrc={project.cover_image_url ?? undefined}
                  imageAlt={`Portfolio Ambara ${project.title}`}
                />
                <div className="portfolio-caption">
                  <div>
                    <p>{project.category ?? "Portfolio"} / {project.location ?? "Indonesia"}</p>
                    <h2>{project.title}</h2>
                    <span>{project.short_description ?? "Custom interior dan furniture AMBARA"}</span>
                  </div>
                  <strong>{project.year ?? ""}</strong>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
