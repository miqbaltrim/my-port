import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

/** Komponen dipindah ke luar supaya tidak re-mount tiap render */
function Field({ label, children }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium tracking-widest text-white/60">{label}</label>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
      />
    </Field>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[150px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
      />
    </Field>
  );
}

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // ✅ preview + completeness pakai deferred biar typing tetap lancar
  const deferredForm = useDeferredValue(form);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/profile");
        const data = res.data.data || res.data || {};
        if (!alive) return;
        setForm((prev) => ({ ...prev, ...data }));
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "Gagal mengambil data profile");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => (alive = false);
  }, []);

  // ✅ ganti nama jadi setField (jangan pakai nama set)
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);
    try {
      await api.put("/admin/profile", form);
      setMsg("Tersimpan ✅");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal menyimpan profile");
    } finally {
      setSaving(false);
    }
  }

  // ✅ completeness pakai deferredForm (bukan form)
  const completeness = useMemo(() => {
    const fields = ["full_name", "headline", "location", "about", "email"];
    const filled = fields.filter((k) => String(deferredForm[k] || "").trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [deferredForm]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            Profile Manager
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Profile</h1>
          <p className="mt-1 text-sm text-white/55">
            Atur identitas, headline, bio, dan kontak yang tampil di portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            Completeness: <span className="text-white">{completeness}%</span>
          </div>
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

      {/* Body */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Edit Profile</div>
              <div className="mt-1 text-xs text-white/45">Perubahan disimpan ke database (Laravel API).</div>
            </div>

            {loading && <div className="text-xs text-white/45">Loading...</div>}
          </div>

          <form onSubmit={save} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="FULL NAME"
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder="Nama Lengkap"
              />
              <Input
                label="LOCATION"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Indonesia"
              />
            </div>

            <Input
              label="HEADLINE"
              value={form.headline}
              onChange={(e) => setField("headline", e.target.value)}
              placeholder="Fullstack Developer (Laravel + React)"
            />

            <Textarea
              label="ABOUT"
              value={form.about}
              onChange={(e) => setField("about", e.target.value)}
              placeholder="Ceritakan singkat tentang kamu..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="EMAIL"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@email.com"
                type="email"
              />
              <Input
                label="PHONE"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+62..."
              />
            </div>

            <Input
              label="CV URL"
              value={form.cv_url}
              onChange={(e) => setField("cv_url", e.target.value)}
              placeholder="https://..."
            />

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/45">
                Tip: Isi CV URL agar tombol “Download CV” bisa muncul di halaman public.
              </div>

              <button
                disabled={saving || loading}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">{saving ? "Saving..." : "Save Changes"}</span>
                <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
              </button>
            </div>
          </form>
        </div>

        {/* Preview card (pakai deferredForm) */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-semibold text-white">Preview</div>
          <p className="mt-1 text-xs text-white/45">Gambaran data profile yang tampil di halaman Home.</p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-lg font-semibold text-white">{deferredForm.full_name || "—"}</div>
            <div className="mt-1 text-sm text-white/70">{deferredForm.headline || "—"}</div>
            <div className="mt-2 text-sm text-white/55">{deferredForm.location || "—"}</div>

            <div className="my-4 h-px w-full bg-white/10" />

            <div className="whitespace-pre-wrap text-sm text-white/70">{deferredForm.about || "—"}</div>

            <div className="my-4 h-px w-full bg-white/10" />

            <div className="grid gap-2 text-sm text-white/60">
              <div>
                <span className="text-white/40">Email:</span>{" "}
                <span className="text-white/80">{deferredForm.email || "—"}</span>
              </div>
              <div>
                <span className="text-white/40">Phone:</span>{" "}
                <span className="text-white/80">{deferredForm.phone || "—"}</span>
              </div>
              <div className="break-all">
                <span className="text-white/40">CV:</span>{" "}
                <span className="text-white/80">{deferredForm.cv_url || "—"}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-medium tracking-widest text-white/50">SUGGESTED</div>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/60">
              <li>Gunakan headline maksimal 1–2 baris.</li>
              <li>About 3–6 kalimat biar nyaman dibaca.</li>
              <li>Pastikan email aktif untuk Contact.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
