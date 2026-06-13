import { NavLink, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { signOut, type AuthState } from "../../lib/auth";
import type { UserRole } from "../../lib/rbac";

type ClientContext = {
  authState: AuthState;
  role: UserRole;
};

export function useClientContext() {
  return useOutletContext<ClientContext>();
}

export function ClientLayout() {
  const { authState } = useClientContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-shell client-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/" className="dashboard-brand">
          AMBARA
        </NavLink>
        <nav>
          <NavLink to="/client" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            Ringkasan
          </NavLink>
          <NavLink to="/client/projects" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Proyek
          </NavLink>
        </nav>
        <div className="dashboard-note">
          <span>Area Client</span>
          <strong>Monitoring Proyek</strong>
          <p>Klien hanya dapat melihat proyek yang terhubung dengan akunnya.</p>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span>Dashboard Client</span>
            <strong>{authState.profile?.full_name ?? authState.user?.email}</strong>
          </div>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <Outlet context={{ authState, role: "client" }} />
      </div>
    </div>
  );
}
