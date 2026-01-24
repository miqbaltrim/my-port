import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export default function AdminTags() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [q, setQ] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/tags");
      // Laravel resource pagination: {data, meta, links}
      const payload = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(payload) ? payload : []);
      setMeta(res.data?.meta ?? null);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat tags");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((t) => {
      const a = (t.name || "").toLowerCase();
      const b = (t.slug || "").toLowerCase();
      return a.includes(term) || b.includes(term);
    });
  }, [items, q]);

  const total = meta?.total ?? items.length;

  async function create(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    const n = name.trim();
    if (!n) return setError("Nama tag wajib diisi.");

    const s = (slug.trim() || slugify(n)).trim();
    if (!s) return setError("Slug tidak valid.");

    setSaving(true);
    try {
      await api.post("/admin/tags", { name: n, slug: s });
      setName("");
      setSlug("");
      setMsg("Tag tersimpan ✅");
      setTimeout(() => setMsg(""), 2200);
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Gagal membuat tag");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Hapus tag ini?")) return;
    setError("");
    setMsg("");
    try {
      await api.delete(`/admin/tags/${id}`);
      setMsg("Tag dihapus ✅");
      setTimeout(() => setMsg(""), 2200);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal menghapus tag");
    }
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            Tags Manager
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Tags
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Tag digunakan untuk relasi many-to-many project_tag.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill>
            Total: <span className="ml-2 text-white">{total}</span>
          </Pill>
          <Pill>
            Showing:{" "}
            <span className="ml-2 text-white">{filtered.length}</span>
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

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Tambah Tag</div>
              <div className="mt-1 text-xs text-white/45">
                Slug otomatis jika kosong, disesuaikan dan dibuat unik di backend.
              </div>
            </div>
            {saving && <div className="text-xs text-white/45">Saving...</div>}
          </div>

          <form onSubmit={create} className="mt-5 grid gap-4">
            <Input
              label="NAME"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                if (!slug) setSlug(slugify(v));
              }}
              placeholder="Laravel"
            />

            <Input
              label="SLUG (optional)"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="laravel"
            />

            <button
              disabled={saving}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">
                {saving ? "Saving..." : "Save Tag"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
            </button>

            <div className="text-xs text-white/45">
              Contoh: <span className="text-white/70">react</span>,{" "}
              <span className="text-white/70">postgresql</span>,{" "}
              <span className="text-white/70">tailwind</span>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Daftar Tags</div>
              <div className="mt-1 text-xs text-white/45">
                Cari berdasarkan name/slug. Menampilkan jumlah project yang pakai tag.
              </div>
            </div>
            {loading && <div className="text-xs text-white/45">Loading...</div>}
          </div>

          <div className="mt-4">
            <Input
              label="SEARCH"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari tag..."
            />
          </div>

          <div className="mt-4 grid gap-3">
            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                Belum ada tag.
              </div>
            )}

            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-white">
                      {t.name}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                      <span>
                        slug: <span className="text-white/75">{t.slug}</span>
                      </span>
                      <span className="text-white/25">•</span>
                      <span>
                        used in{" "}
                        <span className="text-white/75">
                          {typeof t.projects_count === "number"
                            ? t.projects_count
                            : 0}
                        </span>{" "}
                        projects
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-white/45">
            Note: Delete tag akan detach dari project_tag terlebih dahulu (backend).
          </div>
        </div>
      </div>
    </div>
  );
}
