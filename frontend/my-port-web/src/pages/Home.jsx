import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

/** Ambil origin backend dari axios baseURL: http://127.0.0.1:8000/api/v1 -> http://127.0.0.1:8000 */
function getApiOrigin() {
  const base = api?.defaults?.baseURL || "";
  if (!base) return "";
  // hapus trailing /api/v1 atau /api/vX
  return base.replace(/\/api\/v\d+\/?$/i, "");
}

/** Normalisasi url foto/storage agar tidak dobel */
function toPublicUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  const v = String(pathOrUrl).trim();
  if (!v) return "";

  // jika sudah full url
  if (/^https?:\/\//i.test(v)) return v;

  // buang prefix yang kadang nyasar
  let p = v.replace(/^\/+/, ""); // trim leading slash
  p = p.replace(/^storage\//i, ""); // kalau user simpan "storage/projects/.."
  p = p.replace(/^public\//i, ""); // just in case

  const origin = getApiOrigin();
  // fallback kalau origin kosong (misal baseURL belum diset)
  if (!origin) return `/storage/${p}`;

  return `${origin}/storage/${p}`;
}

/** Reveal on scroll (tanpa library) */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cls(
        "reveal",
        show && "reveal--show",
        className
      )}
      style={{ ["--d"]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Avatar 3D tilt */
function Avatar3D({ src, name = "Profile", subtitle = "Founder" }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  function onMove(e) {
    const el = cardRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1

    const ry = (px - 0.5) * 18; // rotateY
    const rx = (0.5 - py) * 16; // rotateX

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
  }

  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `40%`);
  }

  const initials = useMemo(() => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (parts[0]?.[0] || "M") + (parts[1]?.[0] || "P");
  }, [name]);

  return (
    <div className="relative">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="avatar3d rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="avatar3d__inner">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl">
            {/* glare */}
            <div className="pointer-events-none avatar3d__glare" />

            {/* photo */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              {src ? (
                <img
                  src={src}
                  alt={name}
                  className="h-full w-full object-cover opacity-95"
                  loading="lazy"
                  onError={(e) => {
                    // fallback jika url salah
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-b from-white/10 via-white/5 to-white/0">
                  <div className="grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/5 text-3xl font-semibold text-white/80">
                    {initials}
                  </div>
                </div>
              )}

              {/* overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
            </div>

            {/* label */}
            <div className="p-4">
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="mt-1 text-xs text-white/55">{subtitle}</div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Futuristic UI
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  API-ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* glow blobs */}
      <div className="pointer-events-none absolute -left-12 -top-10 h-44 w-44 rounded-full bg-indigo-500/18 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-10 -right-12 h-52 w-52 rounded-full bg-emerald-500/14 blur-[95px]" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
      {children}
    </span>
  );
}

function SectionTitle({ kicker, title, desc }) {
  return (
    <div className="mb-5">
      {kicker && (
        <div className="text-xs font-medium tracking-[0.22em] text-white/45">
          {kicker}
        </div>
      )}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {desc && <p className="mt-2 text-sm text-white/55">{desc}</p>}
    </div>
  );
}

function ProBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="mt-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-700"
          style={{ width: `${v}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-white/45">{v}%</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] hover:-translate-y-0.5">
      <div className="text-xs font-medium tracking-widest text-white/45">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06] hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition group-hover:scale-[1.02]">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-white/55">{desc}</div>
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mt-3 text-xs text-white/45">
        Quality-first · Maintainable · API-ready
      </div>
    </div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const [meRes, skillRes, projRes] = await Promise.all([
          api.get("/me"),
          api.get("/skills"),
          api.get("/projects"),
        ]);

        if (!alive) return;

        setProfile(meRes.data?.data ?? meRes.data ?? null);

        const sk = skillRes.data?.data ?? skillRes.data ?? [];
        setSkills(Array.isArray(sk) ? sk : []);

        const pr = projRes.data?.data ?? projRes.data ?? [];
        setProjects(Array.isArray(pr) ? pr : []);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => (alive = false);
  }, []);

  const featured = useMemo(
    () => projects.filter((p) => p.is_featured).slice(0, 3),
    [projects]
  );

  const topSkills = useMemo(() => {
    const arr = [...skills].sort(
      (a, b) => Number(b.proficiency || 0) - Number(a.proficiency || 0)
    );
    return arr.slice(0, 9);
  }, [skills]);

  const heroName = profile?.full_name || "Your Name";
  const heroHeadline =
    profile?.headline || "Fullstack Developer (Laravel + React)";
  const heroAbout =
    profile?.about || "Tambahkan about di Admin → Profile untuk tampil di sini.";

  const photoUrl = useMemo(() => toPublicUrl(profile?.photo), [profile?.photo]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* ===== Background (dark futuristic) ===== */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-[-140px] h-[560px] w-[560px] rounded-full bg-indigo-500/18 blur-[110px] animate-floatSlow" />
        <div className="absolute -bottom-52 right-[-160px] h-[640px] w-[640px] rounded-full bg-emerald-500/12 blur-[130px] animate-floatSlower" />
        <div className="absolute top-24 right-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[110px] animate-floatSlow" />

        <div className="absolute inset-0 opacity-25 [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black" />
      </div>

      {/* ===== Topbar ===== */}
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pt-7">
        <Reveal className="flex items-center gap-3" delay={0}>
          <div className="text-sm font-semibold tracking-wide text-white/80">
            MY<span className="text-white">PORT</span>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70 md:inline-flex">
            Portfolio Muhammad Iqbal TM
          </span>
        </Reveal>

        <Reveal className="flex items-center gap-2" delay={80}>
          <Link
            to="/projects"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
          >
            Projects
          </Link>
        </Reveal>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8">
        {/* ===== HERO ===== */}
        <Reveal delay={0}>
          <div className="rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-[1px] shadow-[0_22px_80px_rgba(0,0,0,0.6)]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl md:p-8">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[760px] -translate-x-1/2 rotate-12 bg-white/10 blur-3xl" />

              {loading ? (
                <div className="text-white/60">Loading...</div>
              ) : (
                <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
                  {/* Left */}
                  <Reveal delay={60}>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        Welcome to my portfolio
                      </div>

                      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                        {heroName}
                      </h1>

                      <p className="mt-3 max-w-2xl text-base text-white/70 md:text-lg">
                        {heroHeadline}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Pill>{profile?.location || "Indonesia"}</Pill>
                        {profile?.email && <Pill>{profile.email}</Pill>}
                        {profile?.phone && <Pill>{profile.phone}</Pill>}
                      </div>

                      <p className="mt-6 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                        {heroAbout}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2">
                        <Link
                          to="/projects"
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 hover:-translate-y-0.5"
                        >
                          <span className="relative z-10">See Case Studies</span>
                          <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                        </Link>

                        {profile?.cv_url ? (
                          <a
                            href={profile.cv_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
                          >
                            Company Deck / CV
                          </a>
                        ) : (
                          <Link
                            to="/admin/profile"
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
                          >
                            My LinkedIn
                          </Link>
                        )}
                      </div>

                      {/* Value props */}
                      <div className="mt-7 grid gap-3 md:grid-cols-3">
                        {[
                          {
                            k: "DELIVERY",
                            t: "Fast & Reliable",
                            d: "Clean architecture, predictable timelines.",
                          },
                          {
                            k: "QUALITY",
                            t: "Modern UI/UX",
                            d: "Futuristic dark theme, responsive, polished.",
                          },
                          {
                            k: "STACK",
                            t: "Laravel + React",
                            d: "API-first, scalable, PostgreSQL-ready.",
                          },
                        ].map((x, i) => (
                          <Reveal key={x.k} delay={120 + i * 80}>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] hover:-translate-y-0.5">
                              <div className="text-xs font-medium tracking-widest text-white/45">
                                {x.k}
                              </div>
                              <div className="mt-2 text-sm font-semibold text-white">
                                {x.t}
                              </div>
                              <div className="mt-1 text-xs text-white/50">
                                {x.d}
                              </div>
                            </div>
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  {/* Right: Avatar 3D + Stats */}
                  <Reveal delay={90}>
                    <div className="grid gap-3">
                      <Avatar3D
                        src={photoUrl}
                        name={heroName}
                        subtitle={profile?.headline || "Portfolio - Muhammad Iqbal TM"}
                      />

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-sm font-semibold text-white">
                          Snapshot
                        </div>
                        <div className="mt-4 grid gap-3">
                          <Stat label="PROJECTS" value={projects.length} />
                          <Stat label="SKILLS" value={skills.length} />
                          <Stat
                            label="FEATURED"
                            value={projects.filter((p) => p.is_featured).length}
                          />
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs text-white/45">
                            Data diambil dari Laravel API (PostgreSQL).
                          </div>
                          <div className="mt-2 text-xs text-white/45">
                            Cocok untuk presentasi “company profile” ke klien.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* ===== Services ===== */}
        <div className="mt-12">
          <Reveal delay={0}>
            <SectionTitle
              kicker="SERVICES"
              title="What I can build for your business"
              desc="Gaya company profile: jelaskan layanan yang siap kamu kerjakan untuk klien."
            />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Reveal delay={60}>
              <Card
                icon="⚡"
                title="Company Profile & Landing Page"
                desc="Website cepat, modern, SEO-friendly, cocok untuk promosi layanan bisnis."
              />
            </Reveal>
            <Reveal delay={120}>
              <Card
                icon="🧩"
                title="Web App / Dashboard"
                desc="Sistem admin, monitoring data, dan aplikasi internal berbasis role."
              />
            </Reveal>
            <Reveal delay={180}>
              <Card
                icon="🔌"
                title="API & Integrations"
                desc="Laravel REST API, auth, upload, integrasi payment / third-party."
              />
            </Reveal>
          </div>
        </div>

        {/* ===== Process ===== */}
        <div className="mt-12">
          <Reveal delay={0}>
            <SectionTitle
              kicker="PROCESS"
              title="Simple workflow for client projects"
              desc="Biar klien paham langkah kerja kamu."
            />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              { n: "01", t: "Brief", d: "Tujuan, fitur, referensi, deadline." },
              { n: "02", t: "Design", d: "Layout, UI direction, approval." },
              { n: "03", t: "Build", d: "Develop, integrate API, testing." },
              { n: "04", t: "Launch", d: "Deploy, handover, maintenance." },
            ].map((x, i) => (
              <Reveal key={x.n} delay={60 + i * 80}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06] hover:-translate-y-0.5">
                  <div className="text-xs font-medium tracking-widest text-white/45">
                    {x.n}
                  </div>
                  <div className="mt-2 text-base font-semibold text-white">
                    {x.t}
                  </div>
                  <div className="mt-1 text-sm text-white/55">{x.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ===== Skills ===== */}
        <div className="mt-12">
          <Reveal delay={0}>
            <SectionTitle
              kicker="TECH STACK"
              title="Skills & tools"
              desc="Top skill berdasarkan proficiency (diambil dari Admin)."
            />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topSkills.map((s, i) => (
              <Reveal key={s.id} delay={40 + (i % 6) * 40}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06] hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">
                        {s.name}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {s.category || "General"}
                      </div>
                    </div>
                    <Pill>{Number(s.proficiency || 0)}%</Pill>
                  </div>
                  <ProBar value={s.proficiency} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ===== Featured Projects ===== */}
        <div className="mt-12">
          <Reveal delay={0}>
            <SectionTitle
              kicker="PORTFOLIO"
              title="Featured case studies"
              desc="Tampilkan 3 project unggulan untuk klien."
            />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects.slice(0, 3)).map((p, i) => (
              <Reveal key={p.id} delay={60 + i * 90}>
                <Link
                  to={`/projects/${p.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06] hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">
                        {p.title}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {p.status} • {p.slug}
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      Open →
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-white/60 line-clamp-4">
                    {p.excerpt || p.content || "-"}
                  </p>

                  <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="mt-3 text-xs text-white/45">
                    Click to read details
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-5">
              <Link
                to="/projects"
                className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
              >
                View all projects →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ===== CTA ===== */}
        <div className="mt-12">
          <Reveal delay={0}>
            <div className="rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-emerald-500/15 p-[1px] shadow-[0_22px_80px_rgba(0,0,0,0.55)]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl md:p-8">
                <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                  <div>
                    <div className="text-xs font-medium tracking-[0.22em] text-white/45">
                      LET’S WORK TOGETHER
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      Need a modern web presence for your business?
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Saya bisa bantu dari company profile sampai web app + admin panel.
                      Kirim brief, lalu saya buat roadmap & estimasi.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      to="/projects"
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10">Request a Quote</span>
                      <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                    </Link>

                    {profile?.email ? (
                      <a
                        href={`mailto:${profile.email}`}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
                      >
                        Email me
                      </a>
                    ) : (
                      <Link
                        to="/admin/profile"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 transition hover:-translate-y-0.5"
                      >
                        Set Email (Admin)
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <footer className="mt-12 text-center text-xs text-white/45">
            Made Muhammad Iqbal TM. © 2025 MyPortfolio.
          </footer>
        </Reveal>
      </main>

      {/* CSS anim */}
      <style>{`
        /* floating blobs */
        @keyframes floatSlow {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-18px,0); }
        }
        @keyframes floatSlower {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-26px,0); }
        }
        .animate-floatSlow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-floatSlower { animation: floatSlower 10s ease-in-out infinite; }

        /* reveal */
        .reveal {
          opacity: 0;
          transform: translate3d(0,10px,0);
          filter: blur(2px);
          transition: opacity .7s ease, transform .7s ease, filter .7s ease;
          transition-delay: var(--d, 0ms);
          will-change: transform, opacity, filter;
        }
        .reveal--show {
          opacity: 1;
          transform: translate3d(0,0,0);
          filter: blur(0px);
        }

        /* avatar 3d */
        .avatar3d {
          perspective: 900px;
          --rx: 0deg;
          --ry: 0deg;
          --mx: 50%;
          --my: 40%;
        }
        .avatar3d__inner {
          transform: rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
          transition: transform 120ms ease;
          will-change: transform;
          animation: avatarFloat 6.5s ease-in-out infinite;
        }
        @keyframes avatarFloat {
          0%,100% { transform: rotateX(var(--rx)) rotateY(var(--ry)) translate3d(0,0,0); }
          50% { transform: rotateX(calc(var(--rx) * 1)) rotateY(calc(var(--ry) * 1)) translate3d(0,-10px,0); }
        }
        .avatar3d__glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.18), transparent 45%);
          mix-blend-mode: screen;
          opacity: .9;
          transform: translateZ(1px);
        }

        /* respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none; opacity: 1; transform: none; filter: none; }
          .avatar3d__inner { animation: none; transition: none; }
          .animate-floatSlow, .animate-floatSlower { animation: none; }
        }
      `}</style>
    </div>
  );
}
