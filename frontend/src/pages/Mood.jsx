import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";

const moods = ["😀","🙂","😐","😟","😢"];

export default function Mood() {
  const [history, setHistory] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);

  async function loadMood() {
    const data = await apiGet("/mood");
    setHistory(data.mood);
  }

  async function saveMood() {
    if (!selectedMood) return;
    await apiPost("/mood", { mood: selectedMood });
    loadMood();
  }

  useEffect(() => {
    loadMood();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mood Tracker</h1>

      <div className="flex gap-3 text-3xl mb-4">
        {moods.map((m, i) => (
          <span
            key={i}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedMood(m)}
          >
            {m}
          </span>
        ))}
      </div>

      <button onClick={saveMood} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Mood
      </button>

      <h2 className="text-xl font-semibold mt-6">History</h2>
      {history.map((h, i) => (
        <div key={i} className="mt-2">
          {h.mood} — {h.timestamp}
        </div>
      ))}
    </div>
  );
}
