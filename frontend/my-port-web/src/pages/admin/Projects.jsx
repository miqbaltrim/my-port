import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">{label}</label>
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

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
      />
    </div>
  );
}

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "published",
    thumbnail: "",
    demo_url: "",
    repo_url: "",
    seo_title: "",
    seo_description: "",
    is_featured: false,
    sort_order: 0,
  });

  const [selectedTags, setSelectedTags] = useState(new Set());
  const [images, setImages] = useState([{ image_path: "", caption: "", sort_order: 0 }]);

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function uploadProjectImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    // Pastikan route backend: POST /api/v1/admin/uploads/project-image
    const res = await api.post("/admin/uploads/project-image", fd);
    return res.data; // { path, url }
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [pRes, tRes] = await Promise.all([
        api.get("/admin/projects"),
        api.get("/admin/tags"),
      ]);
      setItems(pRes.data.data || []);
      setTags(tRes.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [items, query]);

  function resetAll() {
    setForm({
      title: "",
      excerpt: "",
      content: "",
      status: "published",
      thumbnail: "",
      demo_url: "",
      repo_url: "",
      seo_title: "",
      seo_description: "",
      is_featured: false,
      sort_order: 0,
    });
    setSelectedTags(new Set());
    setImages([{ image_path: "", caption: "", sort_order: 0 }]);
  }

  function toggleTag(id) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateImage(idx, k, v) {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [k]: v };
      return next;
    });
  }

  function addImage() {
    setImages((prev) => [...prev, { image_path: "", caption: "", sort_order: prev.length }]);
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function create(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        tags: Array.from(selectedTags),
        images: images
          .filter((x) => (x.image_path || "").trim().length > 0)
          .map((x, i) => ({
            image_path: x.image_path.trim(),
            caption: x.caption?.trim() || null,
            sort_order: Number.isFinite(+x.sort_order) ? +x.sort_order : i,
          })),
      };

      await api.post("/admin/projects", payload);

      setMsg("Project dibuat ✅");
      setTimeout(() => setMsg(""), 2200);

      resetAll();
      setOpen(false);
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Gagal membuat project");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Hapus project ini?")) return;
    setError("");
    setMsg("");
    try {
      await api.delete(`/admin/projects/${id}`);
      setMsg("Project dihapus ✅");
      setTimeout(() => setMsg(""), 2200);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal menghapus project");
    }
  }

  const publishedCount = useMemo(
    () => items.filter((x) => x.status === "published").length,
    [items]
  );

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            Projects Manager
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-sm text-white/55">
            Create project + upload images (JPG/PNG/WebP) + tags dalam satu form.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            Total: <span className="text-white">{items.length}</span>
            <span className="mx-2 text-white/30">|</span>
            Published: <span className="text-white">{publishedCount}</span>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:brightness-110"
          >
            + New Project
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

      {/* Search */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title..."
          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
        />
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Daftar Projects</div>
          {loading && <div className="text-xs text-white/45">Loading...</div>}
        </div>

        <div className="mt-4 grid gap-3">
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              Belum ada project.
            </div>
          )}

          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-white">{p.title}</div>
                  <div className="mt-1 text-xs text-white/45">
                    {p.status} • slug: {p.slug} • id: {p.id}
                  </div>
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Create (scrollable) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => !saving && setOpen(false)} />

          <div className="relative w-full max-w-5xl rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-white/0 p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
            <div className="rounded-3xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl">
              {/* SCROLL AREA */}
              <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Create Project</h2>
                    <p className="mt-1 text-sm text-white/55">
                      Sekali submit: projects + project_images + project_tag
                    </p>
                  </div>

                  <button
                    onClick={() => !saving && setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={create} className="mt-5 grid gap-5">
                  {/* Basic */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                      label="TITLE"
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Portfolio Website"
                    />

                    <div className="grid gap-2">
                      <label className="text-xs font-medium tracking-widest text-white/60">STATUS</label>
                      <select
                        value={form.status}
                        onChange={(e) => setField("status", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                      >
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="EXCERPT"
                    value={form.excerpt}
                    onChange={(e) => setField("excerpt", e.target.value)}
                    placeholder="Ringkasan singkat untuk card..."
                  />

                  <Textarea
                    label="CONTENT"
                    value={form.content}
                    onChange={(e) => setField("content", e.target.value)}
                    placeholder="Detail project..."
                  />

                  {/* Thumbnail upload + manual */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white">Thumbnail</div>
                    <div className="mt-1 text-xs text-white/45">
                      Upload JPG/PNG/WebP/GIF atau paste URL.
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2 lg:items-start">
                      <div className="grid gap-2">
                        <label className="text-xs font-medium tracking-widest text-white/60">
                          THUMBNAIL (upload)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setError("");
                            try {
                              setSaving(true);
                              const up = await uploadProjectImage(file);
                              setField("thumbnail", up.url);
                            } catch (err) {
                              setError(err?.response?.data?.message || "Gagal upload thumbnail");
                            } finally {
                              setSaving(false);
                              e.target.value = "";
                            }
                          }}
                          className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white/80 hover:file:bg-white/15"
                        />

                        <input
                          value={form.thumbnail}
                          onChange={(e) => setField("thumbnail", e.target.value)}
                          placeholder="atau paste URL /storage/..."
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-medium tracking-widest text-white/60">PREVIEW</label>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          {form.thumbnail ? (
                            <img
                              src={form.thumbnail}
                              alt="thumbnail"
                              className="h-40 w-full rounded-2xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 text-sm text-white/45">
                              No thumbnail
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                      label="DEMO URL"
                      value={form.demo_url}
                      onChange={(e) => setField("demo_url", e.target.value)}
                      placeholder="https://demo..."
                    />
                    <Input
                      label="REPO URL"
                      value={form.repo_url}
                      onChange={(e) => setField("repo_url", e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  {/* SEO */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                      label="SEO TITLE"
                      value={form.seo_title}
                      onChange={(e) => setField("seo_title", e.target.value)}
                      placeholder="SEO title..."
                    />
                    <Input
                      label="SEO DESCRIPTION"
                      value={form.seo_description}
                      onChange={(e) => setField("seo_description", e.target.value)}
                      placeholder="SEO description..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Tags</div>
                      <div className="text-xs text-white/45">Selected: {selectedTags.size}</div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {tags.map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.has(t.id)}
                            onChange={() => toggleTag(t.id)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">{t.name}</div>
                            <div className="text-xs text-white/45">{t.slug}</div>
                          </div>
                        </label>
                      ))}
                      {tags.length === 0 && (
                        <div className="text-sm text-white/60">
                          Belum ada tags. Buat tags dulu di admin tags.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Project Images</div>
                      <button
                        type="button"
                        onClick={addImage}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                      >
                        + Add Image
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_140px_auto] lg:items-end">
                            {/* Upload + path + preview */}
                            <div className="grid gap-2">
                              <label className="text-xs font-medium tracking-widest text-white/60">
                                IMAGE (upload)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setError("");
                                  try {
                                    setSaving(true);
                                    const up = await uploadProjectImage(file);
                                    updateImage(idx, "image_path", up.url);
                                  } catch (err) {
                                    setError(err?.response?.data?.message || "Gagal upload image");
                                  } finally {
                                    setSaving(false);
                                    e.target.value = "";
                                  }
                                }}
                                className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white/80 hover:file:bg-white/15"
                              />

                              <input
                                value={img.image_path}
                                onChange={(e) => updateImage(idx, "image_path", e.target.value)}
                                placeholder="atau paste URL /storage/..."
                                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                              />

                              {img.image_path ? (
                                <img
                                  src={img.image_path}
                                  alt="preview"
                                  className="mt-2 h-28 w-full rounded-2xl border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="mt-2 flex h-28 items-center justify-center rounded-2xl border border-white/10 text-xs text-white/45">
                                  No image
                                </div>
                              )}
                            </div>

                            <Input
                              label="CAPTION"
                              value={img.caption}
                              onChange={(e) => updateImage(idx, "caption", e.target.value)}
                              placeholder="Screenshot home..."
                            />

                            <Input
                              label="SORT"
                              value={img.sort_order}
                              onChange={(e) => updateImage(idx, "sort_order", e.target.value)}
                              placeholder="0"
                              type="number"
                            />

                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="h-[46px] rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-white/45">
                      Tip: isi minimal Title. Images optional. Tags optional.
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetAll();
                          setOpen(false);
                        }}
                        disabled={saving}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        disabled={saving}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="relative z-10">{saving ? "Saving..." : "Create Project"}</span>
                        <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
