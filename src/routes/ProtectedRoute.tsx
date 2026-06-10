import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentAuthState, getProfileRole, type AuthState } from "../lib/auth";
import { dashboardPathForRole, type UserRole } from "../lib/rbac";
import { isSupabaseConfigured } from "../lib/supabase";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  loginPath: string;
};

export function ProtectedRoute({ allowedRoles, loginPath }: ProtectedRouteProps) {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentAuthState()
      .then((state) => {
        if (mounted) setAuthState(state);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const role = useMemo(() => getProfileRole(authState?.profile ?? null), [authState]);

  if (!isSupabaseConfigured) {
    return <BackendSetupGate />;
  }

  if (loading) {
    return <div className="dashboard-loading">Memeriksa sesi AMBARA...</div>;
  }

  if (!authState?.session) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <Outlet context={{ authState, role }} />;
}

function BackendSetupGate() {
  return (
    <main className="dashboard-gate">
      <div>
        <p className="section-label">Phase 2A Setup</p>
        <h1>Supabase belum dikonfigurasi.</h1>
        <p>
          Dashboard sudah disiapkan, tetapi route terlindungi membutuhkan environment variable Supabase.
          Ikuti panduan setup sebelum mencoba login admin atau client.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary" to="/">
            Kembali ke Website
          </Link>
          <a className="btn-secondary" href="https://github.com/Ferdian-99/ambara-website/blob/main/BACKEND_SETUP.md">
            Baca Setup
          </a>
        </div>
      </div>
    </main>
  );
}
