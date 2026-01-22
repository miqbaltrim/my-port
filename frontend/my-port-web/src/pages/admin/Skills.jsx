import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminSkills() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [proficiency, setProficiency] = useState(80);

  async function load() {
    const res = await api.get("/admin/skills");
    setItems(res.data.data || []);
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/admin/skills", { name, category, proficiency });
    setName("");
    await load();
  }

  async function remove(id) {
    if (!confirm("Hapus skill?")) return;
    await api.delete(`/admin/skills/${id}`);
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Skills</h2>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3>Tambah Skill</h3>
        <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
          <input placeholder="Skill name" value={name} onChange={(e) => setName(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
          <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
          <input type="number" min="0" max="100" value={proficiency} onChange={(e) => setProficiency(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />

          <button style={{ padding: 10, borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
            Simpan
          </button>
        </form>
      </div>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3>Daftar Skills</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #2a2a2a", padding: 10, borderRadius: 10 }}>
              <div>
                <strong>{s.name}</strong> <span style={{ opacity: 0.8 }}>({s.category})</span>
                <div style={{ opacity: 0.8, fontSize: 13 }}>Proficiency: {s.proficiency}</div>
              </div>
              <button onClick={() => remove(s.id)}
                style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
