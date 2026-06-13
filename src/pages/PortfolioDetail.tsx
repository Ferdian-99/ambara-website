import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CTASection, PageShell, Reveal, SectionLabel, VisualBlock } from "../components";
import { portfolioProjects } from "../data";
import { getPublishedPortfolioItemBySlug, type PortfolioItemRow } from "../lib/portfolioData";

function staticToPortfolio(slug: string | undefined): PortfolioItemRow | null {
  const project = portfolioProjects.find((item) => item.slug === slug);
  if (!project) return null;
  return {
    id: project.slug,
    title: project.title,
    slug: project.slug,
    category: project.category,
    location: project.location,
    year: project.year,
    short_description: project.concept,
    description: `${project.challenge}\n\n${project.solution}`,
    cover_image_url: project.imageSrc,
    gallery_urls: [project.imageSrc, project.imageSrc, project.imageSrc],
    services: [project.type],
    materials: project.materials,
    is_featured: false,
    sort_order: 0,
    published_at: new Date().toISOString(),
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function PortfolioDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState<PortfolioItemRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublishedPortfolioItemBySlug(slug ?? "")
      .then((item) => {
        if (!mounted) return;
        setProject(item ?? staticToPortfolio(slug));
      })
      .catch(() => {
        if (mounted) setProject(staticToPortfolio(slug));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <PageShell eyebrow="Portofolio" title="Memuat detail portfolio." intro="Data proyek sedang disiapkan.">
        <section className="section-wrap">
          <p className="dashboard-muted">Memuat portfolio...</p>
        </section>
      </PageShell>
    );
  }

  if (!project) {
    return (
      <PageShell eyebrow="Portofolio" title="Portfolio tidak ditemukan." intro="Proyek ini belum dipublish atau sudah tidak tersedia.">
        <section className="section-wrap">
          <Link className="text-link" to="/portofolio">Kembali ke portofolio</Link>
        </section>
      </PageShell>
    );
  }

  const gallery = project.gallery_urls.length ? project.gallery_urls : project.cover_image_url ? [project.cover_image_url] : [];

  return (
    <PageShell eyebrow={project.category ?? "Portofolio"} title={project.title} intro={project.short_description ?? project.description ?? "Portfolio AMBARA"}>
      <section className="section-wrap">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <VisualBlock tall imageSrc={project.cover_image_url ?? undefined} imageAlt={`Portfolio Ambara ${project.title}`} />
          <div className="project-meta">
            <div><span>Kategori</span><p>{project.category ?? "Portfolio"}</p></div>
            <div><span>Tahun</span><p>{project.year ?? "Belum diisi"}</p></div>
            <div><span>Lokasi</span><p>{project.location ?? "Belum diisi"}</p></div>
          </div>
        </div>
      </section>
      <section className="bg-linen py-20 md:py-28">
        <div className="content-grid">
          <div>
            <SectionLabel>Design Concept</SectionLabel>
            <h2 className="section-title">{project.short_description ?? project.title}</h2>
          </div>
          <div>
            <p className="lead-copy whitespace-pre-line">{project.description ?? "Detail portfolio akan dilengkapi oleh tim AMBARA."}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.materials.map((item) => <span key={item} className="material-pill">{item}</span>)}
            </div>
          </div>
        </div>
      </section>
      <section className="section-wrap">
        <div className="grid gap-6 md:grid-cols-3">
          {(gallery.length ? gallery : [undefined, undefined, undefined]).slice(0, 3).map((image, index) => (
            <Reveal key={`${image ?? "visual"}-${index}`}>
              <VisualBlock imageSrc={image} imageAlt={`${project.title} - galeri ${index + 1}`} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section-wrap pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="editorial-block">
            <h2>Layanan</h2>
            <p>{project.services.length ? project.services.join(", ") : "Interior design dan custom furniture."}</p>
          </article>
          <article className="editorial-block">
            <h2>Material</h2>
            <p>{project.materials.length ? project.materials.join(", ") : "Material akan disesuaikan dengan kebutuhan ruang."}</p>
          </article>
        </div>
        <Link className="text-link mt-10 inline-flex" to="/portofolio">Kembali ke portofolio</Link>
      </section>
      <CTASection />
    </PageShell>
  );
}
