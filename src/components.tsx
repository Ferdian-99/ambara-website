import { PropsWithChildren, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { navItems } from "./data";

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
          <Link to="/" className="text-lg font-semibold tracking-[0.34em]" onClick={closeMenu}>AMBARA</Link>
          <div className="hidden items-center gap-7 text-sm text-graphite/80 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link ${isActive ? "text-charcoal after:w-full" : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <Link to="/kontak" className="hidden border border-charcoal/20 px-5 py-2 text-sm transition hover:border-champagne hover:text-champagne md:inline-flex">Mulai Konsultasi</Link>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-charcoal/15 text-charcoal lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen}>
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="border-t border-charcoal/10 bg-ivory px-5 py-5 lg:hidden">
              <div className="flex flex-col gap-4 text-sm">
                {navItems.map((item) => (
                  <NavLink key={item.href} to={item.href} onClick={closeMenu} className={({ isActive }) => (isActive ? "text-champagne" : "")}>{item.label}</NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 px-5 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 text-sm text-graphite/65 md:grid-cols-[1fr_1.2fr_1fr]">
        <p className="font-semibold tracking-[0.28em] text-charcoal">AMBARA</p>
        <p>Studio furnitur premium dan desain interior untuk ruang privat, residensial, hospitality, dan komersial terkurasi.</p>
        <div className="md:text-right"><p>Jakarta, Indonesia</p><p>(c) 2026 AMBARA Studio</p></div>
      </div>
    </footer>
  );
}

export function VisualBlock({ tone = "from-[#efe8da] via-[#c9c1b3] to-[#282723]", tall = false }: { tone?: string; tall?: boolean }) {
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
          <div><SectionLabel>Konsultasi</SectionLabel><h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">Mari mulai dari ruang yang ingin Anda rasakan setiap hari.</h2></div>
          <div>
            <p className="text-lg leading-8 text-graphite/72">Ceritakan kebutuhan ruang, furnitur, atau arah interior yang sedang Anda bayangkan. Kami akan menanggapinya dengan tenang dan terukur.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="btn-primary" to="/kontak">Ajukan Proyek</Link><a className="btn-secondary" href="https://wa.me/6280000000000">WhatsApp</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
