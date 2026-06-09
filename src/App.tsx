import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Tentang", href: "#tentang" },
  { label: "Layanan", href: "#layanan" },
  { label: "Portofolio", href: "#portofolio" },
  { label: "Proses", href: "#proses" },
  { label: "Kontak", href: "#kontak" },
];

const services = [
  {
    title: "Furnitur Kustom",
    body: "Meja, kabinet, kursi, dan elemen ruang yang dibuat sesuai proporsi, material, serta ritme hidup pemiliknya.",
  },
  {
    title: "Desain Interior",
    body: "Perencanaan ruang menyeluruh, dari arah visual, tata letak, pemilihan material, hingga detail akhir yang terasa utuh.",
  },
  {
    title: "Styling dan Kurasi",
    body: "Kurasi furnitur, pencahayaan, objek, dan tekstur agar ruang terasa selesai tanpa kehilangan keheningannya.",
  },
];

const portfolio = [
  {
    title: "Kediaman Senopati",
    type: "Interior residensial",
    year: "2026",
    tone: "from-[#dad2c3] via-[#f4efe5] to-[#9c978c]",
  },
  {
    title: "Villa Batujimbar",
    type: "Furnitur kustom",
    year: "2025",
    tone: "from-[#ece5d6] via-[#cfc7ba] to-[#2f2f2c]",
  },
  {
    title: "Suite Dharmawangsa",
    type: "Kurasi ruang",
    year: "2025",
    tone: "from-[#f8f4eb] via-[#b8b1a6] to-[#c5a66b]",
  },
];

const process = [
  "Mendengar arah hidup, kebiasaan, dan rasa ruang yang ingin dibangun.",
  "Menyusun konsep, material, proporsi, serta bahasa visual yang tertahan.",
  "Membuat detail kerja, prototipe, dan koordinasi produksi dengan presisi.",
  "Menghadirkan ruang akhir yang tenang, rapi, dan siap dihuni lama.",
];

const testimonials = [
  {
    quote:
      "AMBARA tidak hanya membuat ruang kami terlihat indah. Mereka membuatnya terasa benar, tenang, dan sangat pribadi.",
    name: "Ayu Prameswari",
    role: "Pemilik Kediaman Privat",
  },
  {
    quote:
      "Detail furniturnya halus, proporsinya matang, dan prosesnya terasa sangat terjaga dari awal sampai akhir.",
    name: "Raka Mahendra",
    role: "Klien Residensial",
  },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-1 h-px w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`}
      />
      <span
        className={`absolute left-0 top-3 h-px w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
      />
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-champagne">
      {children}
    </p>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-charcoal/10 bg-ivory/78 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="text-lg font-semibold tracking-[0.34em]" onClick={closeMenu}>
            AMBARA
          </a>
          <div className="hidden items-center gap-9 text-sm text-graphite/80 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#kontak"
            className="hidden border border-charcoal/20 px-5 py-2 text-sm transition hover:border-champagne hover:text-champagne md:inline-flex"
          >
            Mulai Konsultasi
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-charcoal/15 text-charcoal md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-charcoal/10 bg-ivory px-5 py-5 md:hidden"
          >
            <div className="flex flex-col gap-4 text-sm">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              ))}
              <a href="#kontak" onClick={closeMenu} className="mt-2 border border-charcoal/20 px-4 py-3 text-center">
                Mulai Konsultasi
              </a>
            </div>
          </motion.div>
        )}
      </header>

      <main id="home">
        <section className="relative min-h-[94svh] overflow-hidden pt-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 md:grid-cols-[0.86fr_1.14fr] md:px-8 md:pb-20 md:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col justify-center"
            >
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.32em] text-champagne">
                Studio furnitur dan interior
              </p>
              <h1 className="max-w-2xl font-serif text-4xl leading-[1.04] text-charcoal sm:text-5xl lg:text-6xl">
                Ruang yang dirancang dengan tenang, dibuat untuk bertahan.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-graphite/72 md:text-lg">
                AMBARA merancang furnitur premium dan interior yang terasa lapang,
                tertata, dan berumur panjang. Setiap garis dibuat seperlunya,
                setiap material dipilih dengan sabar.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a className="btn-primary" href="#portofolio">
                  Lihat Portofolio
                </a>
                <a className="btn-secondary" href="#tentang">
                  Mengenal AMBARA
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.12 }}
              className="hero-visual"
              aria-label="Komposisi visual interior premium AMBARA"
            >
              <div className="absolute inset-6 border border-white/45" />
              <div className="absolute left-[12%] top-[14%] h-[46%] w-[36%] border border-charcoal/20 bg-linen/64 backdrop-blur-sm" />
              <div className="absolute right-[10%] top-[18%] h-[62%] w-[32%] bg-charcoal/90" />
              <div className="absolute bottom-[18%] left-[18%] h-[20%] w-[62%] bg-ivory shadow-soft" />
              <div className="absolute bottom-[25%] left-[24%] h-px w-[48%] bg-champagne" />
              <div className="absolute bottom-[31%] right-[18%] h-20 w-20 rounded-full border border-champagne/70" />
              <div className="absolute right-10 top-10 h-28 w-px bg-champagne/70" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-charcoal/15 pt-4 text-charcoal">
                <span className="max-w-[12rem] text-sm leading-5">Koleksi ruang privat dan furnitur kustom</span>
                <span className="text-xs uppercase tracking-[0.24em]">Jakarta</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="tentang" className="border-y border-charcoal/10 bg-linen py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[0.72fr_1.28fr] md:px-8">
            <div>
              <SectionLabel>Tentang Ambara</SectionLabel>
              <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                Kami percaya kemewahan terbaik selalu terasa hening.
              </h2>
            </div>
            <div className="grid gap-8 text-graphite/76 md:grid-cols-2">
              <p className="text-lg leading-8">
                AMBARA adalah studio furnitur premium dan desain interior untuk
                hunian, villa, butik, dan ruang privat yang membutuhkan rasa,
                ketelitian, serta kendali material.
              </p>
              <p className="text-lg leading-8">
                Pendekatan kami bukan mengejar bentuk yang berteriak. Kami
                mencari proporsi yang tenang, tekstur yang jujur, dan detail yang
                tetap relevan setelah musim berganti.
              </p>
            </div>
          </div>
        </section>

        <section id="layanan" className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="max-w-2xl">
              <SectionLabel>Layanan</SectionLabel>
              <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                Layanan yang dirancang untuk ruang dengan standar yang tidak tergesa.
              </h2>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden border border-charcoal/10 bg-charcoal/10 md:grid-cols-3">
              {services.map((service, index) => (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="group bg-ivory p-8 transition duration-300 hover:bg-linen md:min-h-[320px]"
                >
                  <span className="text-sm text-champagne">0{index + 1}</span>
                  <h3 className="mt-16 font-serif text-3xl">{service.title}</h3>
                  <p className="mt-5 leading-7 text-graphite/70">{service.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="portofolio" className="bg-charcoal py-24 text-linen md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <SectionLabel>Portofolio</SectionLabel>
                <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                  Ruang pilihan dengan detail yang diam-diam bekerja.
                </h2>
              </div>
              <p className="max-w-sm leading-7 text-linen/62">
                Beberapa studi visual untuk menunjukkan arah rasa AMBARA:
                bersih, terukur, dan dekat dengan material.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {portfolio.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="group"
                >
                  <div className={`portfolio-panel bg-gradient-to-br ${item.tone}`}>
                    <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(23,23,23,.10)_1px,transparent_1px)] [background-size:42px_42px]" />
                    <div className="absolute bottom-5 left-5 h-24 w-24 border border-white/40 transition duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
                    <div className="absolute right-6 top-6 h-28 w-px bg-white/40" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl">{item.title}</h3>
                      <p className="mt-1 text-sm text-linen/55">{item.type}</p>
                    </div>
                    <p className="text-sm text-champagne">{item.year}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="proses" className="py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[0.78fr_1.22fr] md:px-8">
            <div>
              <SectionLabel>Proses Kerja</SectionLabel>
              <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                Dari percakapan pertama sampai ruang siap ditempati.
              </h2>
            </div>
            <div className="border-l border-charcoal/15">
              {process.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="relative pb-12 pl-8 last:pb-0"
                >
                  <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-champagne" />
                  <p className="text-sm text-champagne">0{index + 1}</p>
                  <p className="mt-3 max-w-2xl text-xl leading-8 text-graphite/78">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-parchment py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionLabel>Testimoni</SectionLabel>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <motion.figure
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.6 }}
                  className="border border-charcoal/10 bg-ivory p-8 md:p-10"
                >
                  <blockquote className="font-serif text-2xl leading-snug md:text-3xl">
                    "{testimonial.quote}"
                  </blockquote>
                  <figcaption className="mt-8 text-sm text-graphite/68">
                    <span className="block text-charcoal">{testimonial.name}</span>
                    {testimonial.role}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        <section id="kontak" className="px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-7xl border border-charcoal/10 bg-linen px-6 py-14 md:px-14 md:py-20">
            <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-end">
              <div>
                <SectionLabel>Kontak</SectionLabel>
                <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
                  Mari mulai dari ruang yang ingin Anda rasakan setiap hari.
                </h2>
              </div>
              <div>
                <p className="text-lg leading-8 text-graphite/72">
                  Ceritakan kebutuhan ruang, furnitur, atau arah interior yang
                  sedang Anda bayangkan. Kami akan menanggapinya dengan tenang,
                  jernih, dan terukur.
                </p>
                <a className="btn-primary mt-8 w-full sm:w-auto" href="mailto:hello@ambara.studio">
                  hello@ambara.studio
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-charcoal/10 px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-graphite/65 md:flex-row">
          <p className="font-semibold tracking-[0.28em] text-charcoal">AMBARA</p>
          <p>Furnitur premium dan desain interior. Jakarta, Indonesia.</p>
          <p>(c) 2026 AMBARA Studio</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
