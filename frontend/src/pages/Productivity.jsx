import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function ProductivityFull() {
  const [data, setData] = useState({ days: [], bars: [], raw: [] });

  useEffect(() => {
    async function load() {
      const res = await apiGet("/productivity/full");
      setData(res);
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weekly Productivity (Advanced)</h1>

      <div className="card" style={{ padding: 20 }}>
        <h3 className="mb-3">Minutes Studied per Day</h3>

        {data.raw.map((d, i) => (
          <div key={i} className="mb-2">
            <b>{data.days[i]}:</b> {d.minutes} min
          </div>
        ))}
      </div>
    </div>
  );
}
