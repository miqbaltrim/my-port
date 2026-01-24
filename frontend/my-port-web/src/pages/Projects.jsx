import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {desc && <p className="mt-1 text-sm text-white/55">{desc}</p>}
    </div>
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

        // projects biasanya paginated
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/18 blur-[95px]" />
        <div className="absolute -bottom-44 right-[-140px] h-[560px] w-[560px] rounded-full bg-emerald-500/14 blur-[115px]" />
        <div className="absolute top-24 right-16 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[95px]" />

        <div className="absolute inset-0 opacity-30 [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/35 to-black" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pt-7">
        <div className="text-sm font-semibold tracking-wide text-white/80">
          MY<span className="text-white">PORT</span>
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
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-[1px] shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-[620px] -translate-x-1/2 rotate-12 bg-white/10 blur-3xl" />

            {loading ? (
              <div className="text-white/60">Loading...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
                    Available for projects
                  </div>

                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    {profile?.full_name || "Your Name"}
                  </h1>

                  <p className="mt-2 text-white/70">
                    {profile?.headline || "Fullstack Developer (Laravel + React)"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill>{profile?.location || "Indonesia"}</Pill>
                    {profile?.email && <Pill>{profile.email}</Pill>}
                    {profile?.phone && <Pill>{profile.phone}</Pill>}
                  </div>

                  <p className="mt-5 whitespace-pre-wrap text-sm text-white/60">
                    {profile?.about || "Tambahkan about di Admin → Profile."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      to="/projects"
                      className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:brightness-110"
                    >
                      Explore Projects
                    </Link>

                    {profile?.cv_url && (
                      <a
                        href={profile.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                      >
                        Download CV
                      </a>
                    )}
                  </div>
                </div>

                {/* quick panel */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-sm font-semibold text-white">
                    Highlights
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/60">
                    <div className="flex items-center justify-between">
                      <span>Projects</span>
                      <span className="text-white/80">{projects.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Skills</span>
                      <span className="text-white/80">{skills.length}</span>
                    </div>
                    <div className="my-2 h-px w-full bg-white/10" />
                    <div className="text-xs text-white/45">
                      Semua data diambil dari Laravel API (PostgreSQL).
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-10">
          <SectionTitle
            title="Skills"
            desc="Skill utama yang kamu input dari Admin."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {skills.slice(0, 9).map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="text-base font-semibold text-white">{s.name}</div>
                <div className="mt-1 text-xs text-white/45">
                  {s.category || "General"}
                </div>
                <ProBar value={s.proficiency} />
              </div>
            ))}
          </div>

          {skills.length > 9 && (
            <div className="mt-4 text-sm text-white/55">
              dan lainnya… (buat halaman skills khusus kalau mau).
            </div>
          )}
        </div>

        {/* Featured Projects */}
        <div className="mt-10">
          <SectionTitle
            title="Featured Projects"
            desc="Project unggulan yang kamu tandai sebagai featured."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects.slice(0, 3)).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
              >
                <div className="text-base font-semibold text-white group-hover:text-white">
                  {p.title}
                </div>
                <p className="mt-2 text-sm text-white/60 line-clamp-3">
                  {p.excerpt || p.content || "-"}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                  <span>{p.status}</span>
                  <span className="text-white/60">Open →</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link
              to="/projects"
              className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
            >
              View all projects
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-white/45">
          Built with Laravel API + React + PostgreSQL
        </footer>
      </main>
    </div>
  );
}
