import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data.data || []));
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      {projects.length === 0 ? (
        <p>Belum ada project.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {projects.map((p) => (
            <li key={p.id} style={{ marginBottom: 12 }}>
              <Link to={`/projects/${p.slug}`}>
                <strong>{p.title}</strong>
              </Link>
              <div>{p.excerpt}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
