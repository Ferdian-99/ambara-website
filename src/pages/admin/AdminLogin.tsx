import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentAuthState, getProfileRole, signInWithEmail } from "../../lib/auth";
import { canAccessAdmin, dashboardPathForRole } from "../../lib/rbac";
import { isSupabaseConfigured } from "../../lib/supabase";

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/admin";

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

    if (!canAccessAdmin(role)) {
      setMessage("Akun ini bukan akun internal AMBARA.");
      return;
    }

    navigate(from || dashboardPathForRole(role), { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          AMBARA
        </Link>
        <p className="section-label">Admin Login</p>
        <h1>Masuk ke ruang kerja proyek.</h1>
        <p className="auth-copy">
          Untuk Super Admin, Project Manager, Sales, dan Content Manager. Login aktif setelah Supabase dikonfigurasi.
        </p>
        {!isSupabaseConfigured && <div className="auth-alert">Supabase env belum tersedia. Lihat BACKEND_SETUP.md untuk konfigurasi.</div>}
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
            {loading ? "Memeriksa..." : "Login Admin"}
          </button>
        </form>
        <Link className="text-link" to="/client/login">
          Login Client
        </Link>
      </section>
    </main>
  );
}
