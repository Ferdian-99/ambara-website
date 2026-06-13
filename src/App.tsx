import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminClients } from "./pages/admin/AdminClients";
import { AdminDocuments } from "./pages/admin/AdminDocuments";
import { AdminHome } from "./pages/admin/AdminHome";
import { AdminHomepage } from "./pages/admin/AdminHomepage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminPortfolio } from "./pages/admin/AdminPortfolio";
import { AdminProjectDetail } from "./pages/admin/AdminProjectDetail";
import { AdminProjectNew } from "./pages/admin/AdminProjectNew";
import { AdminProjects } from "./pages/admin/AdminProjects";
import { ClientHome } from "./pages/client/ClientHome";
import { ClientLayout } from "./pages/client/ClientLayout";
import { ClientLogin } from "./pages/client/ClientLogin";
import { ClientProjectDetail } from "./pages/client/ClientProjectDetail";
import { ClientProjects } from "./pages/client/ClientProjects";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Portfolio } from "./pages/Portfolio";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { Process } from "./pages/Process";
import { Services } from "./pages/Services";
import { Tracking } from "./pages/Tracking";
import { UpdatePassword } from "./pages/UpdatePassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tentang", element: <About /> },
      { path: "layanan", element: <Services /> },
      { path: "portofolio", element: <Portfolio /> },
      { path: "portofolio/:slug", element: <PortfolioDetail /> },
      { path: "proses", element: <Process /> },
      { path: "lacak-proyek", element: <Tracking /> },
      { path: "kontak", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "update-password", element: <UpdatePassword /> },
    ],
  },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["super_admin", "content_manager", "project_manager", "sales"]} loginPath="/login" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminHome /> },
          { path: "projects", element: <AdminProjects /> },
          { path: "projects/new", element: <AdminProjectNew /> },
          { path: "projects/:id", element: <AdminProjectDetail /> },
          { path: "clients", element: <AdminClients /> },
          { path: "documents", element: <AdminDocuments /> },
          { path: "homepage", element: <AdminHomepage /> },
          { path: "portfolio", element: <AdminPortfolio /> },
        ],
      },
    ],
  },
  { path: "/client/login", element: <ClientLogin /> },
  {
    path: "/client",
    element: <ProtectedRoute allowedRoles={["client"]} loginPath="/login" />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <ClientHome /> },
          { path: "projects", element: <ClientProjects /> },
          { path: "projects/:id", element: <ClientProjectDetail /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
