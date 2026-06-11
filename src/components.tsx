import { PropsWithChildren, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { faqItems, moodOptions, navItems } from "./data";

const logoCandidates = {
  dark: ["/assets/ambara-logo-dark.png", "/assets/ambara-logo-primary.png", "/assets/ambara-logo.png"],
  light: ["/assets/ambara-logo-light.png", "/assets/ambara-logo.png"],
};

export function SectionLabel({ children }: PropsWithChildren) {
  return <p className="section-label">{children}</p>;
}

export function Reveal({ children, className = "", delay = 0 }: PropsWithChildren<{ className?: string; delay?: number }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageShell({ eyebrow, title, intro, children }: PropsWithChildren<{ eyebrow: string; title: string; intro: string }>) {
  return (
    <main className="pt-24">
      <section className="page-hero">
        <div className="content-grid">
          <Reveal>
            <SectionLabel>{eyebrow}</SectionLabel>
            <h1 className="page-title">{title}</h1>
          </Reveal>
          <Reveal delay={0.08} className="self-end">
            <p className="lead-copy">{intro}</p>
          </Reveal>
        </div>
      </section>
      {children}
    </main>
  );
}

function BrandMark({ variant = "dark", compact = false }: { variant?: "dark" | "light"; compact?: boolean }) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function findLogo() {
      for (const candidate of logoCandidates[variant]) {
        const image = new Image();
        const loaded = await new Promise<boolean>((resolve) => {
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = candidate;
        });

        if (cancelled) return;
        if (loaded) {
          setLogoSrc(candidate);
          return;
        }
      }
    }

    void findLogo();

    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Logo AMBARA"
        className={`${compact ? "h-8 max-w-[132px]" : "h-10 max-w-[160px]"} w-auto object-contain`}
        loading="eager"
      />
    );
  }

  return (
    <span className={`${compact ? "text-base" : "text-lg"} font-semibold tracking-[0.34em] ${variant === "light" ? "text-linen" : "text-charcoal"}`}>
      AMBARA
    </span>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span className={`absolute left-0 top-1 h-px w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
      <span className={`absolute left-0 top-3 h-px w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
    </span>
  );
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-charcoal/10 bg-ivory/82 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center" onClick={closeMenu} aria-label="AMBARA Home">
            <BrandMark compact />
          </Link>
          <div className="hidden items-center gap-7 text-sm text-graphite/80 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link ${isActive ? "text-charcoal after:w-full" : ""}`}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/login" className={({ isActive }) => `nav-link text-graphite/60 ${isActive ? "text-charcoal after:w-full" : ""}`}>
              Portal
            </NavLink>
          </div>
          <Link to="/kontak" className="hidden border border-charcoal/20 px-5 py-2 text-sm transition hover:border-champagne hover:text-champagne md:inline-flex">
            Mulai Konsultasi
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-charcoal/15 text-charcoal lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-charcoal/10 bg-ivory px-5 py-5 lg:hidden"
            >
              <div className="flex flex-col gap-4 text-sm">
                {navItems.map((item) => (
                  <NavLink key={item.href} to={item.href} onClick={closeMenu} className={({ isActive }) => (isActive ? "text-champagne" : "")}>
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => (isActive ? "text-champagne" : "text-graphite/70")}>
                  Portal
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal px-5 py-12 text-linen md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 text-sm text-linen/62 md:grid-cols-[1fr_1.2fr_1fr]">
        <div>
          <BrandMark variant="light" />
          <p className="mt-5 text-xs uppercase tracking-[0.22em] text-champagne">Custom Interior / Residential / Office / Cafe</p>
        </div>
        <p>
          Studio interior custom yang merancang, memproduksi, dan memasang built-in furniture untuk hunian, kantor, dan ruang usaha dengan alur kerja yang rapi.
        </p>
        <div className="md:text-right">
          <p>Jakarta, Indonesia</p>
          <p>(c) 2026 AMBARA Studio</p>
        </div>
      </div>
    </footer>
  );
}

export function CompanyProfileVideo() {
  return (
    <section className="section-wrap">
      <div className="company-video-panel">
        <div className="company-video-copy">
          <SectionLabel>Company Profile</SectionLabel>
          <h2>Mengenal Ambara Lebih Dekat</h2>
          <p>
            Tentang proses, nilai kerja, dan pendekatan Ambara dalam merancang interior custom dari desain, produksi, hingga instalasi.
          </p>
        </div>
        <div className="company-video-frame">
          <iframe
            src="https://www.youtube.com/embed/CQDK8Bhcxn8"
            title="Company Profile AMBARA"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function VisualBlock({
  tone = "from-[#efe8da] via-[#c9c1b3] to-[#282723]",
  tall = false,
  imageSrc,
  imageAlt = "Visual interior premium Ambara",
}: {
  tone?: string;
  tall?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}) {
  if (imageSrc) {
    return (
      <div className={`visual-image-block ${tall ? "min-h-[540px]" : "min-h-[360px]"}`}>
        <img src={imageSrc} alt={imageAlt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/28 via-charcoal/5 to-ivory/12" />
      </div>
    );
  }

  return (
    <div className={`visual-block bg-gradient-to-br ${tone} ${tall ? "min-h-[540px]" : "min-h-[360px]"}`}>
      <div className="absolute inset-6 border border-white/40" />
      <div className="absolute bottom-[18%] left-[16%] h-[18%] w-[58%] bg-ivory/82 shadow-soft" />
      <div className="absolute right-[12%] top-[18%] h-[58%] w-[28%] bg-charcoal/88" />
      <div className="absolute bottom-[28%] left-[22%] h-px w-[42%] bg-champagne" />
    </div>
  );
}

export function CTASection() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl border border-charcoal/10 bg-linen px-6 py-12 md:px-14 md:py-18">
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <SectionLabel>Konsultasi</SectionLabel>
            <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">Mari mulai dari ruang yang ingin Anda rasakan setiap hari.</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-graphite/72">Ceritakan kebutuhan interior, built-in furniture, atau area usaha yang ingin dibuat lebih rapi. Kami akan membaca ruang, produksi, dan instalasinya secara terukur.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/kontak">Ajukan Proyek</Link>
              <a className="btn-secondary" href="https://wa.me/6280000000000">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CompanyProfileCTA() {
  return (
    <div className="company-profile-cta">
      <div>
        <SectionLabel>Company Profile</SectionLabel>
        <h2>Download Company Profile</h2>
        <p>
          Berisi ringkasan layanan custom interior, overview portofolio residensial, office, dan cafe, pendekatan material, serta alur kerja proyek AMBARA.
          Tombol ini masih berupa placeholder frontend dan belum menghasilkan PDF.
        </p>
      </div>
      <button type="button">Download Company Profile</button>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-wrap">
      <div className="content-grid">
        <div>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="section-title">Pertanyaan yang biasanya muncul sebelum memulai proyek.</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div key={item.question} className="faq-item">
              <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                <span>{item.question}</span>
                <strong>{openIndex === index ? "-" : "+"}</strong>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {item.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DesignMoodSelector() {
  const [selected, setSelected] = useState(moodOptions[0]);

  return (
    <section className="bg-linen py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="section-heading">
          <div>
            <SectionLabel>Design Mood Selector</SectionLabel>
            <h2 className="section-title">Pilih arah rasa ruang yang paling dekat dengan kebutuhan Anda.</h2>
          </div>
          <p className="max-w-md leading-7 text-graphite/65">
            Preview frontend ini membantu calon klien membaca kemungkinan arah desain sebelum konsultasi dan produksi custom.
          </p>
        </div>
        <div className="mood-selector">
          <div className="mood-options">
            {moodOptions.map((mood) => (
              <button
                key={mood.name}
                type="button"
                onClick={() => setSelected(mood)}
                className={selected.name === mood.name ? "is-active" : ""}
              >
                {mood.name}
              </button>
            ))}
          </div>
          <motion.div key={selected.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mood-preview">
            <p className="text-xs uppercase tracking-[0.24em] text-champagne">Preview mood</p>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div>
              <span>Arah warna/material</span>
              <strong>{selected.direction}</strong>
            </div>
            <div>
              <span>Rekomendasi layanan</span>
              <strong>{selected.service}</strong>
            </div>
            <Link className="btn-primary mt-8" to="/kontak">Konsultasi Mood</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function FloatingWhatsApp() {
  return (
    <a className="floating-whatsapp" href="https://wa.me/6280000000000" aria-label="Chat Ambara via WhatsApp">
      <span>Butuh konsultasi ruang?</span>
      <strong>Chat Ambara</strong>
    </a>
  );
}
