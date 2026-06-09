import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Portfolio } from "./pages/Portfolio";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { Process } from "./pages/Process";
import { Services } from "./pages/Services";
import { Tracking } from "./pages/Tracking";

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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
