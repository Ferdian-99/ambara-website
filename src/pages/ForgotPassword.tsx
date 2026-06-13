import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const redirectTo = `${window.location.origin}/update-password`;
    const { error: resetError } = await requestPasswordReset(email.trim(), redirectTo);

    setLoading(false);

    if (resetError) {
      setError("Link reset password belum dapat dikirim. Periksa email atau coba lagi beberapa saat lagi.");
      return;
    }

    setMessage("Jika email terdaftar, link reset password akan dikirim ke inbox Anda.");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          AMBARA
        </Link>
        <p className="section-label">Reset Password</p>
        <h1>Atur ulang akses portal Anda.</h1>
        <p className="auth-copy">
          Masukkan email yang digunakan untuk akun portal. AMBARA akan mengirimkan tautan aman untuk membuat password baru.
        </p>
        {!isSupabaseConfigured && <div className="auth-alert">Portal belum siap digunakan. Hubungi pengelola sistem AMBARA.</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {message && <p className="auth-alert">{message}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading || !isSupabaseConfigured}>
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
        <Link className="text-link" to="/login">
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
