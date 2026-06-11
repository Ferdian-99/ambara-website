import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updatePassword } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

export function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError("Password belum dapat diperbarui. Buka kembali link reset terbaru dari email Anda.");
      return;
    }

    setMessage("Password berhasil diperbarui. Anda akan diarahkan ke halaman login.");
    window.setTimeout(() => navigate("/login", { replace: true }), 1300);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          AMBARA
        </Link>
        <p className="section-label">Password Baru</p>
        <h1>Buat password portal yang baru.</h1>
        <p className="auth-copy">
          Gunakan password yang hanya Anda ketahui. Setelah berhasil, silakan masuk kembali melalui portal AMBARA.
        </p>
        {!isSupabaseConfigured && <div className="auth-alert">Supabase env belum tersedia. Lihat BACKEND_SETUP.md untuk konfigurasi.</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Password Baru
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label>
            Konfirmasi Password
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
          {message && <p className="auth-alert">{message}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading || !isSupabaseConfigured}>
            {loading ? "Menyimpan..." : "Perbarui Password"}
          </button>
        </form>
        <Link className="text-link" to="/login">
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
