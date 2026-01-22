import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();

  const rememberedEmail = useMemo(() => localStorage.getItem("remember_admin_email") || "", []);
  const [email, setEmail] = useState(rememberedEmail || "admin@myport.com");
  const [password, setPassword] = useState("admin12345");
  const [remember, setRemember] = useState(!!rememberedEmail);

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) nav("/admin", { replace: true });
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("admin_token", res.data.token);

      if (remember) localStorage.setItem("remember_admin_email", email);
      else localStorage.removeItem("remember_admin_email");

      nav("/admin", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      {/* Background: neon blobs + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[90px]" />
        <div className="absolute -bottom-44 right-[-140px] h-[560px] w-[560px] rounded-full bg-emerald-500/16 blur-[110px]" />
        <div className="absolute top-24 right-16 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[90px]" />

        <div className="absolute inset-0 opacity-30 [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/35 to-black" />
      </div>

      {/* Top minimal brand */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pt-6">
        <div className="text-sm font-semibold tracking-wide text-white/80">
          MY<span className="text-white">PORT</span>
          <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
            ADMIN
          </span>
        </div>
        <div className="text-xs text-white/50">Secure Console</div>
      </div>

      {/* Card */}
      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          {/* Border gradient wrapper */}
          <div className="rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-white/0 p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl">
              {/* shine */}
              <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rotate-12 bg-white/10 blur-3xl" />
              {/* inner glow */}
              <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-indigo-500/15 blur-[80px]" />
              <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-emerald-500/12 blur-[90px]" />

              <div className="relative p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-white">
                      Admin Login
                    </h1>
                    <p className="mt-1 text-sm text-white/60">
                      Masuk untuk mengelola konten portfolio.
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    v1 Console
                  </span>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                )}

                <form onSubmit={submit} className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium tracking-wide text-white/70">
                      EMAIL
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                      placeholder="admin@myport.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium tracking-wide text-white/70">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-20 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/10"
                      >
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@myport.com");
                        setPassword("admin12345");
                        setError("");
                      }}
                      className="text-sm text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>

                  <button
                    disabled={loading}
                    className="group relative mt-1 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="relative z-10">{loading ? "Signing in..." : "Login"}</span>
                    {/* animated shine */}
                    <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-0" />
                  </button>

                  <div className="text-xs text-white/45">
                    API:{" "}
                    <code className="rounded bg-white/5 px-2 py-1 text-white/65">
                      http://127.0.0.1:8000
                    </code>
                  </div>
                </form>
              </div>

              {/* bottom border glow line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-white/35">
            © {new Date().getFullYear()} • Futuristic Admin Console
          </p>
        </div>
      </div>
    </div>
  );
}
