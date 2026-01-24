import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
      >
        {children}
      </select>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function ProBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500"
          style={{ width: `${v}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-white/45">{v}%</div>
    </div>
  );
}

export default function AdminSkills() {
  const [items, setItems] = useState([]);

  // form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [proficiency, setProficiency] = useState(80);

  // ui state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // search/filter
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/skills");
      setItems(res.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat skills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const s = new Set(items.map((x) => x.category).filter(Boolean));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((x) => (catFilter === "All" ? true : x.category === catFilter))
      .filter((x) => (term ? (x.name || "").toLowerCase().includes(term) : true))
      .sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0));
  }, [items, q, catFilter]);

  const avg = useMemo(() => {
    if (!items.length) return 0;
    const sum = items.reduce((acc, x) => acc + (Number(x.proficiency) || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  async function create(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    const n = name.trim();
    if (!n) {
      setError("Nama skill wajib diisi.");
      return;
    }

    const p = Math.max(0, Math.min(100, Number(proficiency || 0)));

    setSaving(true);
    try {
      await api.post("/admin/skills", { name: n, category: category.trim(), proficiency: p });
      setName("");
      setProficiency(80);
      setMsg("Skill tersimpan ✅");
      setTimeout(() => setMsg(""), 2200);
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Gagal membuat skill");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Hapus skill ini?")) return;
    setError("");
    setMsg("");
    try {
      await api.delete(`/admin/skills/${id}`);
      setMsg("Skill dihapus ✅");
      setTimeout(() => setMsg(""), 2200);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal menghapus skill");
    }
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            Skills Manager
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Skills
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Kelola skill + kategori + proficiency (0–100).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill>
            Total: <span className="ml-2 text-white">{items.length}</span>
          </Pill>
          <Pill>
            Avg: <span className="ml-2 text-white">{avg}%</span>
          </Pill>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Toast */}
      {msg && (
        <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Tambah Skill</div>
              <div className="mt-1 text-xs text-white/45">
                Input cepat untuk portfolio.
              </div>
            </div>
            {saving && <div className="text-xs text-white/45">Saving...</div>}
          </div>

          <form onSubmit={create} className="mt-5 grid gap-4">
            <Input
              label="SKILL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Laravel / React / PostgreSQL..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="CATEGORY"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Frontend / Backend / Tools..."
              />

              <div className="grid gap-2">
                <label className="text-xs font-medium tracking-widest text-white/60">
                  PROFICIENCY ({Math.max(0, Math.min(100, Number(proficiency || 0)))}%)
                </label>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              disabled={saving}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">{saving ? "Saving..." : "Save Skill"}</span>
              <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
            </button>

            <div className="text-xs text-white/45">
              Tips: Category bisa “Frontend / Backend / Tools / Design / Other”.
            </div>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Daftar Skills</div>
              <div className="mt-1 text-xs text-white/45">
                Search + filter kategori, urut dari proficiency tertinggi.
              </div>
            </div>

            {loading && <div className="text-xs text-white/45">Loading...</div>}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-1">
              <Input
                label="SEARCH"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari skill..."
              />
            </div>

            <div className="md:col-span-1">
              <Select
                label="FILTER CATEGORY"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                Belum ada skill yang cocok.
              </div>
            )}

            {filtered.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-white">
                      {s.name}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      Category: <span className="text-white/75">{s.category || "-"}</span>
                    </div>

                    <ProBar value={s.proficiency} />
                  </div>

                  <button
                    onClick={() => remove(s.id)}
                    className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-white/45">
            Note: Proficiency hanya angka presentase untuk tampilan portfolio.
          </div>
        </div>
      </div>
    </div>
  );
}
