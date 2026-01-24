import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${slug}`);
        if (!alive) return;
        setItem(res.data?.data ?? res.data ?? null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [slug]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/projects"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
        >
          Back
        </Link>

        {loading ? (
          <div className="mt-6 text-white/60">Loading...</div>
        ) : !item ? (
          <div className="mt-6 text-rose-200">Project tidak ditemukan.</div>
        ) : (
          <div className="mt-6">
            <h1 className="text-3xl font-semibold">{item.title}</h1>
            <p className="mt-2 text-white/70">{item.excerpt}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.demo_url && (
                <a
                  href={item.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                >
                  Demo
                </a>
              )}
              {item.repo_url && (
                <a
                  href={item.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                >
                  Repo
                </a>
              )}
            </div>

            <div className="mt-6 whitespace-pre-wrap text-sm text-white/60">
              {item.content}
            </div>

            {/* tags jika backend mengirim tags */}
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* project images jika backend mengirim images */}
            {Array.isArray(item.images) && item.images.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold">Gallery</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {item.images.map((img) => (
                    <div
                      key={img.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <img
                        src={img.url || img.image_url || img.image_path}
                        alt={img.caption || "project image"}
                        className="h-56 w-full rounded-xl object-cover"
                      />
                      {img.caption && (
                        <div className="mt-2 text-xs text-white/55">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
