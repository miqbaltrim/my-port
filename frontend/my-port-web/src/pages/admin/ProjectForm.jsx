import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

function getApiOrigin() {
  const base = api?.defaults?.baseURL || "";
  try {
    const u = new URL(base, window.location.origin);
    return u.origin;
  } catch {
    return window.location.origin;
  }
}

function normalizeStoragePath(value) {
  if (!value) return "";
  let s = String(value).trim();

  const idx = s.indexOf("/storage/");
  if (idx !== -1) {
    s = s.slice(idx + "/storage/".length);
    return s.replace(/^\/+/, "");
  }
  if (s.startsWith("storage/")) return s.replace(/^storage\//, "");
  if (s.startsWith("/storage/")) return s.replace(/^\/storage\//, "");
  return s.replace(/^\/+/, "");
}

function storageUrlFromPath(path) {
  const p = normalizeStoragePath(path);
  if (!p) return "";
  return `${getApiOrigin()}/storage/${p}`;
}

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

function Textarea({ label, value, onChange, placeholder, minH = 120 }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
        style={{ minHeight: minH }}
      />
    </div>
  );
}

async function uploadProjectImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/admin/uploads/project-image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const path = normalizeStoragePath(res.data?.path || "");
  const url = res.data?.url || storageUrlFromPath(path);
  return { path, url };
}

export default function AdminProjectForm({ mode }) {
  const nav = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit";

  const emptyForm = {
    title: "",
    excerpt: "",
    content: "",
    status: "published",
    is_featured: false,
    demo_url: "",
    repo_url: "",
    thumbnail: "", // PATH
    seo_title: "",
    seo_description: "",
    tags: [], // ids
    images: [], // {id?, image_path(PATH), url?, caption, sort_order}
  };

  const [form, setForm] = useState(emptyForm);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleTag(tagId) {
    setForm((prev) => {
      const has = prev.tags.includes(tagId);
      return { ...prev, tags: has ? prev.tags.filter((x) => x !== tagId) : [...prev.tags, tagId] };
    });
  }

  function updateImage(idx, patch) {
    setForm((prev) => {
      const arr = [...prev.images];
      arr[idx] = { ...arr[idx], ...patch };
      if (patch.image_path !== undefined) {
        arr[idx].image_path = normalizeStoragePath(arr[idx].image_path);
        arr[idx].url = storageUrlFromPath(arr[idx].image_path);
      }
      return { ...prev, images: arr };
    });
  }

  function removeImage(idx) {
    setForm((prev) => {
      const arr = [...prev.images];
      arr.splice(idx, 1);
      return { ...prev, images: arr.map((x, i) => ({ ...x, sort_order: i })) };
    });
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const tagRes = await api.get("/admin/tags");
      const tagPayload = tagRes.data?.data ?? tagRes.data ?? [];
      setTags(Array.isArray(tagPayload) ? tagPayload : []);

      if (isEdit) {
        const res = await api.get(`/admin/projects/${id}`);
        const data = res.data?.data ?? res.data ?? {};

        setForm({
          ...emptyForm,
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          status: data.status || "draft",
          is_featured: !!data.is_featured,
          demo_url: data.demo_url || "",
          repo_url: data.repo_url || "",
          thumbnail: normalizeStoragePath(data.thumbnail || ""),
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          tags: (data.tags || []).map((t) => t.id).filter(Boolean),
          images: (data.images || []).map((x, idx) => ({
            id: x.id,
            image_path: normalizeStoragePath(x.image_path || x.path || ""),
            url: x.url || storageUrlFromPath(x.image_path || x.path),
            caption: x.caption || "",
            sort_order: x.sort_order ?? idx,
          })),
        });
      } else {
        setForm(emptyForm);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const thumbPreview = useMemo(() => storageUrlFromPath(form.thumbnail), [form.thumbnail]);

  async function onUploadThumb(file) {
    setBusy(true);
    setError("");
    try {
      const up = await uploadProjectImage(file);
      setField("thumbnail", up.path);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal upload thumbnail");
    } finally {
      setBusy(false);
    }
  }

  async function onAddGallery(files) {
    const list = Array.from(files || []);
    if (!list.length) return;

    setBusy(true);
    setError("");
    try {
      const uploaded = [];
      for (const f of list) {
        const up = await uploadProjectImage(f);
        uploaded.push({
          image_path: up.path,
          url: up.url,
          caption: "",
          sort_order: 0,
        });
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded].map((x, idx) => ({
          ...x,
          image_path: normalizeStoragePath(x.image_path),
          url: x.url || storageUrlFromPath(x.image_path),
          sort_order: x.sort_order ?? idx,
        })),
      }));
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal upload gallery");
    } finally {
      setBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");

    try {
      const cleanImages = (form.images || [])
        .map((x, idx) => ({
          id: x.id,
          image_path: normalizeStoragePath(x.image_path || ""),
          caption: x.caption || null,
          sort_order: Number(x.sort_order ?? idx) || 0,
        }))
        .filter((x) => String(x.image_path || "").trim().length > 0);

      const payload = {
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content || null,
        status: form.status,
        is_featured: !!form.is_featured,
        demo_url: form.demo_url || null,
        repo_url: form.repo_url || null,
        thumbnail: form.thumbnail ? normalizeStoragePath(form.thumbnail) : null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,

        // sesuai controller kamu
        tags: form.tags || [],
        images: cleanImages,
      };

      if (isEdit) {
        await api.put(`/admin/projects/${id}`, payload);
        setMsg("Project diupdate ✅");
      } else {
        await api.post("/admin/projects", payload);
        setMsg("Project dibuat ✅");
      }

      setTimeout(() => setMsg(""), 2000);
      nav("/admin/projects");
    } catch (e2) {
      setError(e2?.response?.data?.message || "Gagal menyimpan project");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            {isEdit ? "Edit Project" : "Create Project"}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {isEdit ? "Edit" : "New"} Project
          </h1>
          <p className="mt-1 text-sm text-white/55">Halaman khusus untuk update thumbnail & gallery.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => nav("/admin/projects")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
          >
            Back
          </button>
          <button
            onClick={save}
            disabled={busy || !form.title.trim()}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-10">{busy ? "Saving..." : "Save Changes"}</span>
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

      <form onSubmit={save} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="TITLE" value={form.title} onChange={(e) => setField("title", e.target.value)} />
          <Input label="STATUS" value={form.status} onChange={(e) => setField("status", e.target.value)} />
        </div>

        <Textarea label="EXCERPT" value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} minH={90} />
        <Textarea label="CONTENT" value={form.content} onChange={(e) => setField("content", e.target.value)} minH={180} />

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="DEMO URL" value={form.demo_url} onChange={(e) => setField("demo_url", e.target.value)} />
          <Input label="REPO URL" value={form.repo_url} onChange={(e) => setField("repo_url", e.target.value)} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm font-semibold text-white">Thumbnail</div>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              label="THUMB PATH"
              value={form.thumbnail}
              onChange={(e) => setField("thumbnail", normalizeStoragePath(e.target.value))}
              placeholder="projects/xxx.jpg"
            />
            <div className="grid gap-2">
              <label className="text-xs font-medium tracking-widest text-white/60">UPLOAD</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadThumb(f);
                  e.target.value = "";
                }}
                className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white file:hover:bg-white/15"
              />
            </div>
          </div>

          {thumbPreview ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <img src={thumbPreview} alt="thumbnail" className="h-44 w-full object-cover" />
              <div className="px-3 py-2 text-xs text-white/40 break-all">{thumbPreview}</div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/50">Preview akan muncul setelah ada path.</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Tags</div>
              <div className="mt-1 text-xs text-white/45">Klik untuk toggle.</div>
            </div>
            <div className="text-xs text-white/50">Selected: {form.tags.length}</div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = form.tags.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={cls(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    active
                      ? "border-indigo-400/30 bg-indigo-500/15 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Project Images (Gallery)</div>
              <div className="mt-1 text-xs text-white/45">Upload, edit caption & urutan.</div>
            </div>
            <div className="text-xs text-white/50">Images: {form.images.length}</div>
          </div>

          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) onAddGallery(files);
                e.target.value = "";
              }}
              className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white file:hover:bg-white/15"
            />
          </div>

          <div className="mt-4 grid gap-3">
            {form.images.length === 0 ? (
              <div className="text-sm text-white/50">Belum ada images.</div>
            ) : (
              form.images.map((img, idx) => {
                const preview = img.url || storageUrlFromPath(img.image_path);
                return (
                  <div key={img.id ?? `${img.image_path}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                      <div className="grid gap-3">
                        <Input
                          label="IMAGE PATH"
                          value={img.image_path || ""}
                          onChange={(e) => updateImage(idx, { image_path: e.target.value })}
                          placeholder="projects/xxx.jpg"
                        />
                        <Input
                          label="CAPTION"
                          value={img.caption || ""}
                          onChange={(e) => updateImage(idx, { caption: e.target.value })}
                          placeholder="Caption..."
                        />
                      </div>

                      <div className="grid gap-3">
                        <Input
                          label="SORT ORDER"
                          type="number"
                          value={img.sort_order ?? idx}
                          onChange={(e) => updateImage(idx, { sort_order: Number(e.target.value) })}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {preview ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <img src={preview} alt="preview" className="h-48 w-full object-cover" />
                        <div className="px-3 py-2 text-xs text-white/40 break-all">{preview}</div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-white/50">Preview akan muncul jika path valid.</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
