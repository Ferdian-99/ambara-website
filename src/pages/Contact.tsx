import { PageShell, Reveal, SectionLabel } from "../components";

export function Contact() {
  return (
    <PageShell eyebrow="Kontak" title="Ceritakan ruang yang ingin Anda bangun dengan tenang." intro="Form ini masih preview frontend. Untuk komunikasi awal, gunakan WhatsApp atau email placeholder sampai sistem backend dibuat pada fase berikutnya.">
      <section className="section-wrap"><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"><Reveal><form className="contact-form" onSubmit={(event) => event.preventDefault()}><div><label>Nama</label><input placeholder="Nama lengkap" /></div><div><label>Email / WhatsApp</label><input placeholder="Kontak yang bisa dihubungi" /></div><div><label>Jenis proyek</label><select><option>Custom Furniture</option><option>Interior Design</option><option>Built-in Furniture</option><option>Commercial Project</option></select></div><div><label>Catatan proyek</label><textarea placeholder="Ceritakan ruang, lokasi, kebutuhan, dan estimasi waktu." /></div><button type="submit">Kirim Preview Inquiry</button></form></Reveal><Reveal delay={0.08}><aside className="contact-aside"><SectionLabel>Studio</SectionLabel><h2>AMBARA Studio</h2><p>Jakarta, Indonesia</p><p>hello@ambara.studio</p><p>WhatsApp: +62 800 0000 0000</p><div className="mt-10 border-t border-charcoal/10 pt-8"><h3>Project Inquiry</h3><p>Untuk proyek bernilai personal, kami memulai dari percakapan singkat agar arah ruang, timeline, dan kebutuhan produksi bisa dibaca dengan tepat.</p></div><a className="btn-primary mt-8" href="https://wa.me/6280000000000">Mulai via WhatsApp</a></aside></Reveal></div></section>
    </PageShell>
  );
}
