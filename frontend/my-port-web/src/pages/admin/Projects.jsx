import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export default function AdminProjects() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/projects");
      const payload = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
      .filter((p) => (term ? (p.title || "").toLowerCase().includes(term) : true));
  }, [items, q, statusFilter]);

  async function remove(id) {
    if (!confirm("Hapus project ini?")) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await api.delete(`/admin/projects/${id}`);
      setMsg("Project dihapus ✅");
      setTimeout(() => setMsg(""), 2000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal hapus project");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            Projects Manager
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-sm text-white/55">List project. Edit pindah halaman (lebih ringan).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill>
            Total: <span className="ml-2 text-white">{items.length}</span>
          </Pill>

          <button
            onClick={() => nav("/admin/projects/new")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110"
          >
            <span className="relative z-10">+ New Project</span>
            <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
          </button>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

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

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
        >
          <option value="all">All status</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </div>

      <div className="mt-4 grid gap-3">
        {loading ? (
          <div className="text-white/60">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
            Belum ada project.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-white">{p.title}</div>
                  <div className="mt-1 text-xs text-white/45">
                    {p.status} • {p.slug}
                    {p.is_featured ? " • featured" : ""}
                  </div>
                  {p.excerpt && <div className="mt-2 line-clamp-2 text-sm text-white/60">{p.excerpt}</div>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => nav(`/admin/projects/${p.id}/edit`)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busy}
                    className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/15 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
