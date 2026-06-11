import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentAuthState, getProfileRole, signInWithEmail } from "../lib/auth";
import { getDashboardPathForRole } from "../lib/rbac";
import { isSupabaseConfigured } from "../lib/supabase";

const missingProfileMessage = "Akun berhasil masuk, tetapi profil belum dikonfigurasi. Hubungi tim Ambara.";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (!isSupabaseConfigured) {
        setCheckingSession(false);
        return;
      }

      const authState = await getCurrentAuthState();
      if (!mounted) return;

      if (authState.session) {
        const role = getProfileRole(authState.profile);
        if (role) {
          navigate(getDashboardPathForRole(role), { replace: true });
          return;
        }
        setMessage(missingProfileMessage);
      }

      setCheckingSession(false);
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signInWithEmail(email, password);
    if (error) {
      setMessage("Email atau password tidak sesuai.");
      setLoading(false);
      return;
    }

    const authState = await getCurrentAuthState();
    const role = getProfileRole(authState.profile);
    setLoading(false);

    if (!role) {
      setMessage(missingProfileMessage);
      return;
    }

    navigate(getDashboardPathForRole(role), { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          AMBARA
        </Link>
        <p className="section-label">Portal</p>
        <h1>Masuk ke portal proyek AMBARA.</h1>
        <p className="auth-copy">
          Satu akses untuk tim internal dan client. Setelah masuk, sistem akan membuka dashboard sesuai role akun.
        </p>
        {!isSupabaseConfigured && <div className="auth-alert">Supabase env belum tersedia. Lihat BACKEND_SETUP.md untuk konfigurasi.</div>}
        {checkingSession ? (
          <p className="auth-alert">Memeriksa sesi AMBARA...</p>
        ) : (
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
              {loading ? "Memeriksa..." : "Masuk Portal"}
            </button>
          </form>
        )}
        <Link className="text-link" to="/">
          Kembali ke website
        </Link>
      </section>
    </main>
  );
}
