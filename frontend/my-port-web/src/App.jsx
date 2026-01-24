import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";

import AdminLayout from "./pages/admin/Layout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProjects from "./pages/admin/Projects.jsx";
import AdminProjectForm from "./pages/admin/ProjectForm.jsx";
import AdminSkills from "./pages/admin/Skills.jsx";
import AdminTags from "./pages/admin/Tags.jsx";
import AdminProfile from "./pages/admin/Profile.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDbInspector from "./pages/admin/DbInspector.jsx";

import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />

      {/* admin */}
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

        {/* projects admin */}
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<AdminProjectForm mode="create" />} />
        <Route path="projects/:id/edit" element={<AdminProjectForm mode="edit" />} />

        <Route path="tags" element={<AdminTags />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="db" element={<AdminDbInspector />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<div className="p-6 text-white">404</div>} />
    </Routes>
  );
}
