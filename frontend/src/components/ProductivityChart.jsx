import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function ProductivityChart() {
  const [prod, setProd] = useState({ days: [], bars: [], percent: 0 });

  useEffect(() => {
    (async () => {
      const res = await apiGet("/productivity/full");
      setProd(res || { days: [], bars: [], percent: 0 });
    })();
  }, []);

  return (
    <div className="card card-large">
      <h3>Weekly Productivity <span style={{float:'right', fontWeight:700}}>{prod.percent}%</span></h3>
      <div className="prod-bars" style={{marginTop:12}}>
        {prod.bars.map((b,i)=>(
          <div key={i} className="prod-bar-column">
            <div className="bar" style={{height: `${b}%`, width:28, borderRadius:8}}></div>
            <div className="prod-day-label">{prod.days[i]}</div>
          </div>
        ))}
        {prod.bars.length === 0 && <div style={{color:"#888"}}>No data</div>}
      </div>
    </div>
  );
}
