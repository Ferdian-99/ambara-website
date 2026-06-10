import { NavLink, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { signOut, type AuthState } from "../../lib/auth";
import { hasPermission, roleLabels, type UserRole } from "../../lib/rbac";

type DashboardContext = {
  authState: AuthState;
  role: UserRole;
};

const adminNav = [
  { label: "Overview", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Documents", href: "/admin/documents" },
];

export function useDashboardContext() {
  return useOutletContext<DashboardContext>();
}

export function AdminLayout() {
  const { authState, role } = useDashboardContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/" className="dashboard-brand">
          AMBARA
        </NavLink>
        <nav>
          {adminNav.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.href === "/admin"} className={({ isActive }) => (isActive ? "is-active" : "")}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-note">
          <span>Role</span>
          <strong>{roleLabels[role]}</strong>
          {hasPermission(role, "cms:placeholder") && <p>CMS disiapkan untuk fase berikutnya.</p>}
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span>Dashboard Admin</span>
            <strong>{authState.profile?.full_name ?? authState.user?.email}</strong>
          </div>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <Outlet context={{ authState, role }} />
      </div>
    </div>
  );
}
