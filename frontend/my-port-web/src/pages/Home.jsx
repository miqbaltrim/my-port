import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function cls(...a) {
  return a.filter(Boolean).join(" ");
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs font-medium tracking-widest text-white/45">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
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
    // urutkan berdasarkan proficiency desc, ambil 9
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
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-wide text-white/80">
            MY<span className="text-white">PORT</span>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70 md:inline-flex">
            Company Profile
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/projects"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
          >
            Projects
          </Link>
          <Link
            to="/admin/login"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8">
        {/* ===== HERO (company profile style) ===== */}
        <div className="rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-[1px] shadow-[0_22px_80px_rgba(0,0,0,0.6)]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl md:p-8">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[760px] -translate-x-1/2 rotate-12 bg-white/10 blur-3xl" />

            {loading ? (
              <div className="text-white/60">Loading...</div>
            ) : (
              <div className="grid gap-8 md:grid-cols-[1.25fr_0.75fr]">
                {/* Left */}
                <div className="animate-inUp">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                    Ready for client projects
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

                  {/* CTA */}
                  <div className="mt-7 flex flex-wrap gap-2">
                    <Link
                      to="/projects"
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110"
                    >
                      <span className="relative z-10">See Case Studies</span>
                      <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                    </Link>

                    {profile?.cv_url ? (
                      <a
                        href={profile.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                      >
                        Company Deck / CV
                      </a>
                    ) : (
                      <Link
                        to="/admin/profile"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                      >
                        Add CV URL (Admin)
                      </Link>
                    )}
                  </div>

                  {/* Value props */}
                  <div className="mt-7 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-medium tracking-widest text-white/45">
                        DELIVERY
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        Fast & Reliable
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Clean architecture, predictable timelines.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-medium tracking-widest text-white/45">
                        QUALITY
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        Modern UI/UX
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Futuristic dark theme, responsive, polished.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-medium tracking-widest text-white/45">
                        STACK
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        Laravel + React
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        API-first, scalable, PostgreSQL-ready.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Stats / quick panel */}
                <div className="animate-inUpDelay">
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
                        Untuk presentasi klien, tampilkan “featured projects”.
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-sm font-semibold text-white">
                      Contact / Inquiry
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Siap bantu pembuatan website company profile, landing page,
                      dashboard, dan API.
                    </div>

                    <div className="mt-4 grid gap-2">
                      {profile?.email ? (
                        <a
                          href={`mailto:${profile.email}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                          Email: {profile.email}
                        </a>
                      ) : null}

                      <Link
                        to="/projects"
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                      >
                        View Work → Case studies
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Services ===== */}
        <div className="mt-12">
          <SectionTitle
            kicker="SERVICES"
            title="What I can build for your business"
            desc="Gaya company profile: jelaskan layanan yang siap kamu kerjakan untuk klien."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Card
              icon="⚡"
              title="Company Profile & Landing Page"
              desc="Website cepat, modern, SEO-friendly, cocok untuk promosi layanan bisnis."
            />
            <Card
              icon="🧩"
              title="Web App / Dashboard"
              desc="Sistem admin, monitoring data, dan aplikasi internal berbasis role."
            />
            <Card
              icon="🔌"
              title="API & Integrations"
              desc="Laravel REST API, auth, upload, integrasi payment / third-party."
            />
          </div>
        </div>

        {/* ===== Process ===== */}
        <div className="mt-12">
          <SectionTitle
            kicker="PROCESS"
            title="Simple workflow for client projects"
            desc="Biar klien paham langkah kerja kamu."
          />
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { n: "01", t: "Brief", d: "Tujuan, fitur, referensi, deadline." },
              { n: "02", t: "Design", d: "Layout, UI direction, approval." },
              { n: "03", t: "Build", d: "Develop, integrate API, testing." },
              { n: "04", t: "Launch", d: "Deploy, handover, maintenance." },
            ].map((x) => (
              <div
                key={x.n}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="text-xs font-medium tracking-widest text-white/45">
                  {x.n}
                </div>
                <div className="mt-2 text-base font-semibold text-white">
                  {x.t}
                </div>
                <div className="mt-1 text-sm text-white/55">{x.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Tech / Skills ===== */}
        <div className="mt-12">
          <SectionTitle
            kicker="TECH STACK"
            title="Skills & tools"
            desc="Top skill berdasarkan proficiency (diambil dari Admin)."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topSkills.map((s) => (
              <div
                key={s.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
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
            ))}
          </div>
        </div>

        {/* ===== Featured Projects ===== */}
        <div className="mt-12">
          <SectionTitle
            kicker="PORTFOLIO"
            title="Featured case studies"
            desc="Tampilkan 3 project unggulan untuk klien. (Atau 3 teratas jika belum ada featured.)"
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects.slice(0, 3)).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
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
            ))}
          </div>

          <div className="mt-5">
            <Link
              to="/projects"
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
            >
              View all projects →
            </Link>
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-emerald-500/15 p-[1px] shadow-[0_22px_80px_rgba(0,0,0,0.55)]">
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
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110"
                >
                  <span className="relative z-10">Request a Quote</span>
                  <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                </Link>

                {profile?.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                  >
                    Email me
                  </a>
                ) : (
                  <Link
                    to="/admin/profile"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                  >
                    Set Email (Admin)
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-white/45">
          Made Muhammad Iqbal TM. © 2025 MyPortfolio.
        </footer>
      </main>

      {/* Minimal CSS for animation (no library) */}
      <style>{`
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

        @keyframes inUp {
          from { opacity: 0; transform: translate3d(0,10px,0); }
          to { opacity: 1; transform: translate3d(0,0,0); }
        }
        .animate-inUp { animation: inUp .6s ease-out both; }
        .animate-inUpDelay { animation: inUp .75s ease-out both; animation-delay: .08s; }
      `}</style>
    </div>
  );
}
