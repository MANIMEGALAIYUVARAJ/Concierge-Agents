import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function MoodChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await apiGet("/mood/last7");
      // res.last7: [{day, mood, intensity, timestamp}, ...]
      setData(res.last7 || []);
    })();
  }, []);

  if (!data.length) return <div className="card">No mood data yet</div>;

  // normalize intensities 0-10
  const values = data.map(d => d.intensity || 5);
  const maxV = Math.max(...values, 10);
  const minV = Math.min(...values, 0);
  const w = 300, h = 80;
  const stepX = w / Math.max(1, values.length - 1);
  const points = values.map((v,i) => `${i*stepX},${h - ((v - minV)/(maxV-minV||1))*h}`).join(" ");

  return (
    <div className="card">
      <h4>Mood (Last 7)</h4>
      <svg width={w} height={h} style={{display:"block"}}>
        <polyline fill="none" stroke="#4f6ef7" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {data.map((d,i)=> <div key={i} style={{fontSize:12,color:"#666"}}>{d.day || i}</div>)}
      </div>
    </div>
  );
}
