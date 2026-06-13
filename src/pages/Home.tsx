import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CompanyProfileCTA,
  CompanyProfileVideo,
  CTASection,
  DesignMoodSelector,
  FAQSection,
  Reveal,
  SectionLabel,
  VisualBlock,
} from "../components";
import {
  featuredProject,
  finishingDetails,
  materialNotes,
  portfolioProjects,
  processSteps,
  services,
  whyAmbara,
} from "../data";
import { listFeaturedPortfolioItems, type PortfolioItemRow } from "../lib/portfolioData";
import { defaultHomepageSettings, getHomepageSettings, type HomepageSettings } from "../lib/siteSettingsData";

const staticFeaturedItems: PortfolioItemRow[] = portfolioProjects.map((project, index) => ({
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
  is_featured: index < 3,
  sort_order: index * 10,
  published_at: new Date().toISOString(),
  archived_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export function Home() {
  const [homepageContent, setHomepageContent] = useState<HomepageSettings>(defaultHomepageSettings);
  const [cmsFeaturedItems, setCmsFeaturedItems] = useState<PortfolioItemRow[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getHomepageSettings()
      .then((settings) => {
        if (mounted) setHomepageContent(settings);
      })
      .catch((fetchError) => {
        console.error("Homepage text CMS gagal dimuat:", fetchError);
        if (mounted) setHomepageContent(defaultHomepageSettings);
      });

    listFeaturedPortfolioItems(4)
      .then((items) => {
        if (mounted) setCmsFeaturedItems(items);
      })
      .catch((fetchError) => {
        console.error("Homepage portfolio CMS gagal dimuat:", fetchError);
        if (mounted) setCmsFeaturedItems([]);
      })
      .finally(() => {
        if (mounted) setPortfolioLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const homepagePortfolioItems = useMemo(
    () => (cmsFeaturedItems.length ? cmsFeaturedItems : staticFeaturedItems.slice(0, 3)),
    [cmsFeaturedItems],
  );
  const homepageFeaturedProject = homepagePortfolioItems[0];
  const featuredStory = homepageFeaturedProject.description ?? homepageFeaturedProject.short_description ?? featuredProject.story;
  const featuredMaterial = homepageFeaturedProject.materials.length ? homepageFeaturedProject.materials.join(", ") : featuredProject.mainMaterial;
  const featuredService = homepageFeaturedProject.services.length ? homepageFeaturedProject.services.join(", ") : featuredProject.type;

  return (
    <main>
      <section className="relative overflow-hidden pt-24">
        <div className="mx-auto grid min-h-[92svh] max-w-7xl gap-10 px-5 pb-14 pt-12 md:grid-cols-[0.86fr_1.14fr] md:px-8 md:pb-20 md:pt-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col justify-center">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.32em] text-champagne">{homepageContent.hero.eyebrow}</p>
            <h1 className="max-w-2xl font-serif text-4xl leading-[1.04] text-charcoal sm:text-5xl lg:text-6xl">{homepageContent.hero.headline}</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-graphite/72 md:text-lg">
              {homepageContent.hero.subheadline}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/portofolio">{homepageContent.hero.primaryCtaText}</Link>
              <Link className="btn-secondary" to="/lacak-proyek">{homepageContent.hero.secondaryCtaText}</Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-charcoal/10 py-5 text-xs uppercase tracking-[0.18em] text-graphite/60">
              {homepageContent.stats.map((stat) => (
                <span key={`${stat.value}-${stat.label}`} className="pr-3">
                  <strong className="block font-medium text-charcoal">{stat.value}</strong>
                  <small className="mt-1 block text-[0.65rem] font-normal text-graphite/55">{stat.label}</small>
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.12 }} className="hero-visual min-h-[520px] md:min-h-[680px]">
            <img src="/assets/ambara-hero.png" alt="Interior premium Ambara dengan furnitur kustom dan suasana hangat" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ivory/78 via-ivory/18 to-charcoal/10" />
            <div className="absolute inset-6 border border-white/45" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-white/45 pt-4 text-charcoal">
              <span className="max-w-[13rem] bg-ivory/72 px-3 py-2 text-sm leading-5 backdrop-blur-sm">Interior custom, built-in, dan instalasi rapi</span>
              <span className="bg-ivory/72 px-3 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur-sm">AMBARA</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-charcoal/10 bg-linen py-20 md:py-28">
        <div className="content-grid">
          <Reveal>
            <SectionLabel>{homepageContent.about.eyebrow}</SectionLabel>
            <h2 className="section-title">{homepageContent.about.headline}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lead-copy">{homepageContent.about.body}</p>
            <Link className="text-link mt-8 inline-flex" to="/tentang">Mengenal AMBARA</Link>
          </Reveal>
        </div>
      </section>

      <CompanyProfileVideo />

      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <SectionLabel>Layanan Pilihan</SectionLabel>
            <h2 className="section-title">Layanan untuk interior custom yang harus indah sekaligus siap diproduksi.</h2>
          </div>
          <Link className="text-link" to="/layanan">Lihat semua layanan</Link>
        </div>
        <div className="premium-grid mt-12">
          {homepageContent.services.map((service, index) => (
            <Reveal key={`${service.title}-${index}`} delay={index * 0.06}>
              <article className="service-panel">
                <span className="text-sm text-champagne">{services[index]?.number ?? `0${index + 1}`}</span>
                <h3 className="mt-10 font-serif text-3xl">{service.title}</h3>
                <p className="mt-4 leading-7 text-graphite/70">{service.description}</p>
                <div className="mt-8 border-t border-charcoal/10 pt-5 text-sm text-graphite/62">{services[index]?.suitable ?? "Layanan custom AMBARA yang dikerjakan terukur."}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-charcoal py-20 text-linen md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="section-heading">
            <div>
              <SectionLabel>Portofolio Pilihan</SectionLabel>
              <h2 className="section-title text-linen">Portofolio hunian, kantor, cafe, dan built-in yang dibuat terukur.</h2>
            </div>
            <Link className="text-link text-champagne" to="/portofolio">Jelajahi portofolio</Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-12">
            {portfolioLoading && <p className="md:col-span-12 text-sm uppercase tracking-[0.22em] text-champagne">Memuat portfolio pilihan...</p>}
            {homepagePortfolioItems.slice(0, 4).map((project, index) => (
              <Link key={project.slug} to={`/portofolio/${project.slug}`} className={`group ${index === 0 ? "md:col-span-7" : "md:col-span-5"}`}>
                <VisualBlock tall={index === 0} imageSrc={project.cover_image_url ?? undefined} imageAlt={`Portfolio Ambara ${project.title}`} />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-champagne">{project.category ?? "Portfolio"}</p>
                    <h3 className="mt-2 font-serif text-2xl">{project.title}</h3>
                    <p className="mt-1 text-sm text-linen/55">{project.short_description ?? project.services[0] ?? "Custom interior AMBARA"}</p>
                  </div>
                  <p className="text-sm text-linen/55">{project.year ?? ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <Reveal>
          <div className="featured-project">
            <div className="featured-copy">
              <SectionLabel>Featured Project</SectionLabel>
              <h2>{homepageFeaturedProject.title}</h2>
              <p>{featuredStory}</p>
              <div className="featured-meta">
                <div><span>Jenis project</span><strong>{featuredService}</strong></div>
                <div><span>Tahun</span><strong>{homepageFeaturedProject.year ?? featuredProject.year}</strong></div>
                <div><span>Lokasi</span><strong>{homepageFeaturedProject.location ?? featuredProject.location}</strong></div>
                <div><span>Area</span><strong>{featuredProject.area}</strong></div>
                <div><span>Material utama</span><strong>{featuredMaterial}</strong></div>
                <div><span>Durasi</span><strong>{featuredProject.duration}</strong></div>
              </div>
              <Link className="btn-primary mt-8" to={`/portofolio/${homepageFeaturedProject.slug}`}>Lihat Detail Project</Link>
            </div>
            <VisualBlock tall imageSrc={homepageFeaturedProject.cover_image_url ?? featuredProject.imageSrc} imageAlt={`Featured project Ambara ${homepageFeaturedProject.title}`} />
          </div>
        </Reveal>
      </section>

      <section className="section-wrap">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Material & Craftsmanship</SectionLabel>
            <h2 className="section-title">Detail dibuat agar kuat dipakai, rapi dipasang, dan tetap terasa premium.</h2>
          </div>
          <div className="grid gap-px bg-charcoal/10 sm:grid-cols-2">
            {materialNotes.map((item, index) => (
              <Reveal key={item} delay={index * 0.05} className="bg-ivory p-8">
                <span className="text-sm text-champagne">0{index + 1}</span>
                <h3 className="mt-12 font-serif text-2xl">{item}</h3>
                <p className="mt-4 leading-7 text-graphite/68">Keputusan kecil yang menentukan hasil: ukuran modul, ketebalan bidang, pertemuan panel, hardware, dan ketahanan harian.</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="section-heading">
            <div>
              <SectionLabel>Material & Finishing Detail</SectionLabel>
            <h2 className="section-title">Material dipilih bukan hanya karena tampak premium, tetapi karena siap bekerja di ruang nyata.</h2>
            </div>
            <p className="max-w-md leading-7 text-graphite/65">
              Setiap pilihan finishing dipertimbangkan dari ketahanan, rasa sentuhan, kemudahan perawatan, proses produksi, dan kualitas pemasangan di lokasi.
            </p>
          </div>
          <div className="material-finishing-layout">
            <Reveal className="material-finishing-image">
              <img src="/assets/material-finishing.png" alt="Detail material dan finishing furnitur premium Ambara" loading="lazy" />
            </Reveal>
            <div className="finishing-grid">
              {finishingDetails.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04}>
                  <article className="finishing-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DesignMoodSelector />

      <section className="bg-parchment py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionLabel>Proses Kerja</SectionLabel>
          <div className="grid gap-4 md:grid-cols-4">
            {processSteps.slice(0, 8).map((step, index) => (
              <div key={step} className="process-chip">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="content-grid">
          <div>
            <SectionLabel>Why Ambara</SectionLabel>
            <h2 className="section-title">Karena proyek custom interior membutuhkan komunikasi yang sama rapinya dengan hasil akhirnya.</h2>
          </div>
          <div className="space-y-4">
            {whyAmbara.map((item, index) => (
              <Reveal key={item} delay={index * 0.04}>
                <div className="reason-row"><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionLabel>Testimoni</SectionLabel>
          <div className="grid gap-6 md:grid-cols-3">
            {["A.P.", "R.M.", "N.S."].map((initial, index) => (
              <figure key={initial} className="testimonial-card">
                <div className="initial-mark">{initial}</div>
                <blockquote>"Prosesnya terasa tenang, rinci, dan sangat jelas. Hasil akhirnya rapi tanpa kehilangan karakter ruang."</blockquote>
                <figcaption>{index === 0 ? "Residensial, Jakarta Selatan" : index === 1 ? "Villa privat, Bali" : "Studio komersial, Bandung"}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />

      <section className="section-wrap pt-0">
        <CompanyProfileCTA />
      </section>

      <CTASection />
    </main>
  );
}
