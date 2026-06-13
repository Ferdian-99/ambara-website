import { PageShell, Reveal, SectionLabel } from "../components";
import { FormEvent, useState } from "react";
import { submitContactMessage } from "../lib/contactMessagesData";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  project_type: "",
  budget_range: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.message.trim()) {
      setError("Nama dan catatan proyek wajib diisi.");
      return;
    }

    if (form.email.trim() && !emailPattern.test(form.email.trim())) {
      setError("Format email belum sesuai.");
      return;
    }

    setLoading(true);
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        project_type: form.project_type || null,
        budget_range: form.budget_range || null,
        message: form.message.trim(),
      });
      setForm(initialForm);
      setSuccess("Pesan berhasil dikirim. Tim Ambara akan menghubungi Anda secepatnya.");
    } catch (submitError) {
      console.error("Contact form gagal dikirim:", submitError);
      setError("Pesan belum berhasil dikirim. Coba beberapa saat lagi atau hubungi kami lewat WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Kontak"
      title="Ceritakan ruang yang ingin Anda bangun dengan tenang."
      intro="Kirim ringkasan kebutuhan ruang Anda. Tim AMBARA akan membaca konteks proyek sebelum menghubungi Anda kembali."
    >
      <section className="section-wrap">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <form className="contact-form" onSubmit={handleSubmit}>
              {success && <p className="auth-alert">{success}</p>}
              {error && <p className="auth-error">{error}</p>}
              <div>
                <label>Nama</label>
                <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nama lengkap" required />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="nama@email.com" />
                </div>
                <div>
                  <label>WhatsApp</label>
                  <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+62..." />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label>Jenis proyek</label>
                  <select value={form.project_type} onChange={(event) => updateField("project_type", event.target.value)}>
                    <option value="">Pilih jenis proyek</option>
                    <option>Custom Furniture</option>
                    <option>Interior Design</option>
                    <option>Built-in Furniture</option>
                    <option>Residential Project</option>
                    <option>Commercial Project</option>
                  </select>
                </div>
                <div>
                  <label>Estimasi budget</label>
                  <select value={form.budget_range} onChange={(event) => updateField("budget_range", event.target.value)}>
                    <option value="">Pilih estimasi budget</option>
                    <option>Di bawah IDR 25 juta</option>
                    <option>IDR 25-50 juta</option>
                    <option>IDR 50-100 juta</option>
                    <option>Di atas IDR 100 juta</option>
                    <option>Belum ditentukan</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Catatan proyek</label>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Ceritakan ruang, lokasi, kebutuhan, timeline, atau referensi yang sudah Anda miliki."
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </form>
          </Reveal>
          <Reveal delay={0.08}>
            <aside className="contact-aside">
              <SectionLabel>Studio</SectionLabel>
              <h2>AMBARA Studio</h2>
              <p>Jakarta, Indonesia</p>
              <p>hello@ambara.studio</p>
              <p>WhatsApp: +62 800 0000 0000</p>
              <div className="mt-10 border-t border-charcoal/10 pt-8">
                <h3>Project Inquiry</h3>
                <p>Form akan masuk ke inbox AMBARA. Jika ingin percakapan langsung, gunakan WhatsApp manual di bawah ini.</p>
              </div>
              <a className="btn-primary mt-8" href="https://wa.me/6280000000000">Mulai via WhatsApp</a>
            </aside>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
