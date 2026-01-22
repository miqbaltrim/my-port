import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminProfile() {
  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    location: "",
    about: "",
    email: "",
    phone: "",
    cv_url: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/admin/profile").then((res) => {
      const data = res.data.data || res.data || {};
      setForm((f) => ({ ...f, ...data }));
    });
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setMsg("");
    await api.put("/admin/profile", form);
    setMsg("Tersimpan ✅");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Profile</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={save} style={{ display: "grid", gap: 10 }}>
        <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Full name"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
        <input value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Headline"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
        <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Location"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
        <textarea value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="About"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444", minHeight: 140 }} />
        <input value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="Email"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
        <input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="Phone"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />
        <input value={form.cv_url || ""} onChange={(e) => set("cv_url", e.target.value)} placeholder="CV URL"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444" }} />

        <button style={{ padding: 10, borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}>
          Save
        </button>
      </form>
    </div>
  );
}
