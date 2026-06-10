import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentAuthState, getProfileRole, signInWithEmail } from "../../lib/auth";
import { canAccessClient } from "../../lib/rbac";
import { isSupabaseConfigured } from "../../lib/supabase";

export function ClientLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/client";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signInWithEmail(email, password);
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const authState = await getCurrentAuthState();
    const role = getProfileRole(authState.profile);
    setLoading(false);

    if (!canAccessClient(role)) {
      setMessage("Akun ini bukan akun client.");
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          AMBARA
        </Link>
        <p className="section-label">Client Login</p>
        <h1>Masuk untuk melihat progres proyek.</h1>
        <p className="auth-copy">Area client akan menampilkan timeline, progress photo, dokumen, dan estimasi penyelesaian.</p>
        {!isSupabaseConfigured && <div className="auth-alert">Supabase env belum tersedia. Login aktif setelah backend dikonfigurasi.</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {message && <p className="auth-error">{message}</p>}
          <button type="submit" disabled={loading || !isSupabaseConfigured}>
            {loading ? "Memeriksa..." : "Login Client"}
          </button>
        </form>
        <Link className="text-link" to="/admin/login">
          Login Admin
        </Link>
      </section>
    </main>
  );
}
