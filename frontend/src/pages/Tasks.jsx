import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPatch } from "../api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [runningTask, setRunningTask] = useState(null);

  // Load all tasks
  async function loadTasks() {
    const data = await apiGet("/tasks");
    setTasks(data.tasks);
  }

  // Add task
  async function addTask() {
    if (!title.trim()) return;
    await apiPost("/tasks", { title });
    setTitle("");
    loadTasks();
  }

  // Mark as done
  async function markDone(id) {
    await apiPatch(`/tasks/${id}/status`, { status: "done" });
    loadTasks();
  }

  // Start timer
  async function startTimer(id) {
    await apiPost("/timer/start", { task_id: id });
    setRunningTask(id);
    alert("⏱ Timer started for task " + id);
  }

  // Stop timer
  async function stopTimer(id) {
    const res = await apiPost("/timer/stop", { task_id: id });
    setRunningTask(null);
    alert("⏹ Timer stopped. Minutes logged: " + res.minutes);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {/* ADD TASK INPUT */}
      <div className="flex gap-3 mb-6">
        <input
          className="p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Task..."
        />
        <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      {/* TASK LIST */}
      <div>
        {tasks.map((t) => (
          <div key={t.id} className="card mb-3 p-4 flex justify-between items-center">
            
            <div>
              <b>{t.title}</b><br/>
              <span>Status: {t.status}</span>
            </div>

            <div className="flex gap-3">
              
              {/* TIMER BUTTONS */}
              {runningTask === t.id ? (
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => stopTimer(t.id)}
                >
                  ⏹ Stop
                </button>
              ) : (
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                  onClick={() => startTimer(t.id)}
                >
                  ▶ Start
                </button>
              )}

              {/* MARK DONE */}
              {t.status !== "done" && (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => markDone(t.id)}
                >
                  ✔ Done
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
