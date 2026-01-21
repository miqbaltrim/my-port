import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get(`/projects/${slug}`).then((res) => setProject(res.data.data || res.data));
  }, [slug]);

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/projects">← Back</Link>
      <h1 style={{ marginTop: 10 }}>{project.title}</h1>
      <p>{project.excerpt}</p>
      <div style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{project.content}</div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        {project.demo_url && <a href={project.demo_url} target="_blank" rel="noreferrer">Demo</a>}
        {project.repo_url && <a href={project.repo_url} target="_blank" rel="noreferrer">Repo</a>}
      </div>
    </div>
  );
}
