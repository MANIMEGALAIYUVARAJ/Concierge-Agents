import React, { useState } from "react";
import { apiPost } from "../api";

export default function StudyPlanAI() {
  const [subjects, setSubjects] = useState("");
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(3);
  const [plan, setPlan] = useState([]);

  async function generatePlan() {
    const res = await apiPost("/studyplan", {
      subjects: subjects.split(",").map((s) => s.trim()),
      days,
      hours_per_day: hours,
      start_hour: 9
    });

    setPlan(res.plan || []);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Study Plan Generator</h1>

      <div className="card mb-4" style={{ maxWidth: 500 }}>
        <label>Subjects (comma separated)</label>
        <input
          className="p-2 border rounded w-full mb-3"
          placeholder="Maths, Science, English"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />

        <label>Days</label>
        <input
          type="number"
          className="p-2 border rounded w-full mb-3"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />

        <label>Hours per day</label>
        <input
          type="number"
          className="p-2 border rounded w-full mb-3"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generatePlan}>
          Generate Plan
        </button>
      </div>

      {/* SHOW RESULT */}
      <div>
        {plan.map((day, index) => (
          <div key={index} className="card mb-3">
            <h3>{day.date}</h3>
            {day.blocks.map((b, i) => (
              <div key={i}>
                • {b.title} → {b.start} to {b.end}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
