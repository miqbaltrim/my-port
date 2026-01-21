import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.get("/me").then((res) => setMe(res.data.data || res.data));
  }, []);

  return (
    <div>
      <h1>Portfolio</h1>

      {!me ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>{me.full_name}</h2>
          <p>{me.headline}</p>
          <p>{me.location}</p>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{me.about}</p>
        </div>
      )}
    </div>
  );
}
