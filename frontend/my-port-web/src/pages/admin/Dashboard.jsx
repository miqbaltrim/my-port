import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: null,
    skills: null,
    profileName: null,
    apiOk: null,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [projectsRes, skillsRes, profileRes] = await Promise.all([
          api.get("/admin/projects"),
          api.get("/admin/skills"),
          api.get("/admin/profile"),
        ]);

        if (!alive) return;

        const projects = (projectsRes.data?.data || []).length;
        const skills = (skillsRes.data?.data || []).length;
        const profileName = profileRes.data?.data?.full_name || profileRes.data?.full_name || null;

        setStats({ projects, skills, profileName, apiOk: true });
      } catch {
        if (!alive) return;
        setStats((s) => ({ ...s, apiOk: false }));
      }
    }

    load();
    return () => (alive = false);
  }, []);

  const StatCard = ({ title, value, subtitle, to }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-indigo-500/14 blur-[80px]" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-[90px]" />

      <div className="relative">
        <div className="text-xs font-medium tracking-widest text-white/55">{title}</div>
        <div className="mt-2 text-3xl font-semibold text-white">
          {value === null ? "—" : value}
        </div>
        <div className="mt-1 text-sm text-white/55">{subtitle}</div>

        {to && (
          <div className="mt-4">
            <Link
              to={to}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Open <span className="text-white/40">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stats.apiOk === null ? "bg-white/30" : stats.apiOk ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            System
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Ringkasan cepat & akses ke modul admin.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/projects"
            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:brightness-110"
          >
            + New Project
          </Link>

          <Link
            to="/admin/profile"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="PROJECTS"
          value={stats.projects}
          subtitle="Total project di portfolio"
          to="/admin/projects"
        />
        <StatCard
          title="SKILLS"
          value={stats.skills}
          subtitle="Skill stack yang ditampilkan"
          to="/admin/skills"
        />
        <StatCard
          title="PROFILE"
          value={stats.profileName ? "Ready" : "Missing"}
          subtitle={stats.profileName ? `Nama: ${stats.profileName}` : "Lengkapi profile dulu"}
          to="/admin/profile"
        />
      </div>

      {/* Panels */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-semibold text-white">System Status</div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                stats.apiOk === null ? "bg-white/30" : stats.apiOk ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span className="text-white/70">
              API Connection:{" "}
              <span className="text-white">
                {stats.apiOk === null ? "Checking..." : stats.apiOk ? "OK" : "Failed"}
              </span>
            </span>
          </div>
          <p className="mt-3 text-xs text-white/45">
            Jika “Failed”, pastikan Laravel berjalan dan token tersimpan di LocalStorage.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-semibold text-white">Quick Tips</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/60">
            <li>Gunakan <span className="text-white">published</span> agar project tampil.</li>
            <li>Isi <span className="text-white">excerpt</span> singkat untuk card yang rapi.</li>
            <li>Tambahkan <span className="text-white">demo_url</span> & <span className="text-white">repo_url</span>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
