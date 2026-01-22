import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";

import AdminLogin from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/Layout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProjects from "./pages/admin/Projects.jsx";
import AdminSkills from "./pages/admin/Skills.jsx";
import AdminProfile from "./pages/admin/Profile.jsx";

import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Navbar public */}
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link className="text-sm font-semibold hover:underline" to="/">Home</Link>
        <Link className="text-sm font-semibold hover:underline" to="/projects">Projects</Link>
        <Link className="text-sm font-semibold hover:underline" to="/admin">Admin</Link>
      </nav>

      {/* Content */}
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <div className="mx-auto max-w-6xl px-4 pb-10">
              <Home />
            </div>
          }
        />
        <Route
          path="/projects"
          element={
            <div className="mx-auto max-w-6xl px-4 pb-10">
              <Projects />
            </div>
          }
        />
        <Route
          path="/projects/:slug"
          element={
            <div className="mx-auto max-w-6xl px-4 pb-10">
              <ProjectDetail />
            </div>
          }
        />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </div>
  );
}
