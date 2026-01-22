import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminLayout() {
  const nav = useNavigate();

  async function logout() {
    try { await api.post("/logout"); } catch {}
    localStorage.removeItem("admin_token");
    nav("/admin/login", { replace: true });
  }

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid #333",
    background: isActive ? "#222" : "transparent",
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
      <aside style={{ border: "1px solid #333", borderRadius: 14, padding: 12, height: "calc(100vh - 110px)", position: "sticky", top: 16 }}>
        <h3 style={{ marginTop: 6 }}>Admin Panel</h3>

        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <NavLink to="/admin" end style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/admin/profile" style={linkStyle}>Profile</NavLink>
          <NavLink to="/admin/projects" style={linkStyle}>Projects</NavLink>
          <NavLink to="/admin/skills" style={linkStyle}>Skills</NavLink>

          {/* Menu placeholder untuk tabel lain */}
          <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>Soon:</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Tags</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Experiences</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Educations</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Testimonials</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Social Links</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px dashed #333" }}>Contact Messages</div>
        </div>

        <button onClick={logout}
          style={{ marginTop: 16, width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
          Logout
        </button>
      </aside>

      <main style={{ border: "1px solid #333", borderRadius: 14, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
