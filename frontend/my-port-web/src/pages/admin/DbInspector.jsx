import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

export default function AdminDbInspector() {
  const [objects, setObjects] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [mode, setMode] = useState("describe"); // describe | create
  const [q, setQ] = useState("");
  const [showViews, setShowViews] = useState(true);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/db/objects", {
        params: { include_views: showViews ? 1 : 0 },
      });
      setObjects(res.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat daftar tabel/view");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showViews]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return objects;
    return objects.filter((o) => (o.name || "").toLowerCase().includes(term));
  }, [objects, q]);

  function toggle(name) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAllFiltered(on) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const o of filtered) {
        if (on) next.add(o.name);
        else next.delete(o.name);
      }
      return next;
    });
  }

  async function run() {
    setError("");
    setOutput("");
    setRunning(true);
    try {
      const res = await api.post("/admin/db/inspect", {
        mode,
        objects: Array.from(selected),
      });
      setOutput(res.data.output || "");
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal generate output");
    } finally {
      setRunning(false);
    }
  }

  async function copyOut() {
    try {
      await navigator.clipboard.writeText(output || "");
      alert("Output disalin ke clipboard.");
    } catch {
      alert("Gagal copy. Coba manual select & copy.");
    }
  }

  function downloadOut() {
    const blob = new Blob([output || ""], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `db_inspect_${mode}_${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
            DB Inspector
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Schema Explorer
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Pilih tabel/view → generate <span className="text-white">DESCRIBE</span> atau{" "}
            <span className="text-white">CREATE</span> (best-effort untuk table).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            Selected: <span className="text-white">{selected.size}</span>
          </div>

          <button
            onClick={run}
            disabled={running || selected.size === 0}
            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tabel…"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/20"
          />

          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={showViews}
              onChange={(e) => setShowViews(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
            />
            Tampilkan VIEW
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectAllFiltered(true)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
            >
              Select All
            </button>
            <button
              onClick={() => selectAllFiltered(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="radio"
              name="mode"
              value="describe"
              checked={mode === "describe"}
              onChange={() => setMode("describe")}
            />
            DESCRIBE
          </label>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="radio"
              name="mode"
              value="create"
              checked={mode === "create"}
              onChange={() => setMode("create")}
            />
            SHOW CREATE
          </label>

          <div className="text-xs text-white/45">
            {loading ? "Loading objects..." : `Objects: ${objects.length} • Filtered: ${filtered.length}`}
          </div>
        </div>
      </div>

      {/* List + Output */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* List */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-semibold text-white">Objects</div>
          <div className="mt-1 text-xs text-white/45">
            Centang untuk memilih.
          </div>

          <div className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/10 p-3">
            <div className="grid gap-2">
              {filtered.map((o) => (
                <label
                  key={o.name}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(o.name)}
                    onChange={() => toggle(o.name)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {o.name}
                    </div>
                    <div className="text-xs text-white/45">{o.type}</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                    {o.kind.toUpperCase()}
                  </span>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                  Tidak ada yang cocok dengan filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">Output</div>
              <div className="mt-1 text-xs text-white/45">Read-only • bisa copy / download</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyOut}
                disabled={!output}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 disabled:opacity-60"
              >
                Copy
              </button>
              <button
                onClick={downloadOut}
                disabled={!output}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 disabled:opacity-60"
              >
                Download
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={output}
            className="mt-4 min-h-[420px] w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80 outline-none"
            placeholder="Output akan muncul di sini..."
          />
        </div>
      </div>
    </div>
  );
}
