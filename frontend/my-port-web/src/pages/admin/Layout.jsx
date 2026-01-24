import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminLayout() {
  const nav = useNavigate();
  const [stats, setStats] = useState({ tags: null });

  async function logout() {
    try {
      await api.post("/logout");
    } catch {}
    localStorage.removeItem("admin_token");
    nav("/admin/login", { replace: true });
  }

  // optional: ambil total tags untuk badge (aman kalau error)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/admin/tags");
        const total = res?.data?.meta?.total ?? res?.data?.data?.length ?? null;
        if (!alive) return;
        setStats((s) => ({ ...s, tags: total }));
      } catch {
        if (!alive) return;
        setStats((s) => ({ ...s, tags: null }));
      }
    })();
    return () => (alive = false);
  }, []);

  const linkBase =
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition";
  const linkInactive = "text-white/70 hover:bg-white/8 hover:text-white";
  const linkActive = "bg-white/10 text-white border border-white/10";

  const navItems = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/profile", label: "Profile" },
    { to: "/admin/projects", label: "Projects" },
    { to: "/admin/skills", label: "Skills" },
    { to: "/admin/tags", label: "Tags", badge: stats.tags },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background neon + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/18 blur-[95px]" />
        <div className="absolute -bottom-44 right-[-140px] h-[560px] w-[560px] rounded-full bg-emerald-500/14 blur-[115px]" />
        <div className="absolute top-24 right-16 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[95px]" />

        <div className="absolute inset-0 opacity-30 [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/35 to-black" />
      </div>

      {/* Topbar */}
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-wide text-white/80">
            MY<span className="text-white">PORT</span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
            ADMIN v1
          </span>
        </div>

        <button
          onClick={logout}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
        >
          Logout
        </button>
      </header>

      {/* Layout */}
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-10 pt-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-2xl">
            <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-indigo-500/12 blur-[70px]" />
            <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-[85px]" />

            <div className="relative">
              <div className="px-2 pb-2">
                <div className="text-xs font-medium tracking-widest text-white/50">
                  ADMIN PANEL
                </div>
              </div>

              <nav className="grid gap-2">
                {navItems.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                  >
                    <span className="flex items-center gap-2">
                      {it.label}
                      {typeof it.badge === "number" && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                          {it.badge}
                        </span>
                      )}
                    </span>
                    <span className="text-white/30">⌁</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 px-2">
                <div className="text-xs font-medium tracking-widest text-white/40">
                  SOON
                </div>
              </div>

              <div className="mt-2 grid gap-2">
                {[
                  "Experiences",
                  "Educations",
                  "Testimonials",
                  "Social Links",
                  "Contact Messages",
                ].map((x) => (
                  <div
                    key={x}
                    className="rounded-xl border border-dashed border-white/15 bg-white/0 px-3 py-2 text-sm text-white/45"
                  >
                    {x}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">
                Tip: Pastikan backend berjalan di{" "}
                <span className="text-white/80">http://127.0.0.1:8000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="relative min-h-[70vh] rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[680px] -translate-x-1/2 rotate-12 bg-white/10 blur-3xl" />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
