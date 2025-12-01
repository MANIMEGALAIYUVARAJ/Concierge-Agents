import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function Planner() {
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    apiGet("/planner").then(d => setPlan(d.plan));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Study Planner</h1>

      {plan.map((p, i) => (
        <div key={i} className="card mb-3">
          {p.start} – {p.end}: <b>{p.title}</b>
        </div>
      ))}
    </div>
  );
}
