import React, { useState } from "react";
import { apiPost } from "../api";

export default function StudyPlanner() {
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(3);
  const [subjects, setSubjects] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const body = {
      days: Number(days),
      hours_per_day: Number(hours),
      subjects: subjects ? subjects.split(",").map(s => s.trim()) : null
    };
    const res = await apiPost("/studyplan", body);
    setPlan(res.plan);
    setLoading(false);
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3>AI Study Plan Generator</h3>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={days} onChange={(e)=>setDays(e.target.value)} style={{width:80}} />
        <input value={hours} onChange={(e)=>setHours(e.target.value)} style={{width:120}} />
        <input placeholder="subjects comma separated (optional)" value={subjects} onChange={(e)=>setSubjects(e.target.value)} style={{flex:1}} />
        <button onClick={generate} disabled={loading} style={{background:"#2563eb", color:"#fff", padding:"8px 12px", borderRadius:6}}>Generate</button>
      </div>

      {plan && (
        <div style={{ marginTop: 12 }}>
          {plan.map(p => (
            <div key={p.date} className="card" style={{ marginBottom: 8 }}>
              <b>{p.date}</b>
              <div>
                {p.blocks.length === 0 ? <div style={{color:"#666"}}>No blocks</div> :
                  p.blocks.map((b, i)=> (
                    <div key={i} style={{padding:"6px 0"}}>{b.start.slice(11,16)} - {b.end.slice(11,16)}: {b.title} ({b.minutes}m)</div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
