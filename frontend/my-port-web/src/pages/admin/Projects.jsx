import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await api.get("/admin/projects");
    setItems(res.data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/projects", {
        title,
        excerpt,
        content,
        status,
        is_featured: false,
      });
      setTitle(""); setExcerpt(""); setContent(""); setStatus("published");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal membuat project");
    }
  }

  async function remove(id) {
    if (!confirm("Hapus project?")) return;
    await api.delete(`/admin/projects/${id}`);
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2>Projects</h2>
        <p>Buat & kelola project portfolio.</p>
      </div>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3>Tambah Project</h3>
        {error && <p style={{ color: "salmon" }}>{error}</p>}
        <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
          <input placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
          <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444", minHeight: 120 }} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>

          <button style={{ padding: 10, borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
            Simpan
          </button>
        </form>
      </div>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3>Daftar Projects</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, border: "1px solid #2a2a2a", padding: 10, borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ opacity: 0.8, fontSize: 13 }}>{p.status} • {p.slug}</div>
                </div>
                <button onClick={() => remove(p.id)}
                  style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
