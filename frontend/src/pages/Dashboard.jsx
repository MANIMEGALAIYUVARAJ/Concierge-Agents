import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

function Stat({ title, value }) {
  return (
    <div className="card stat-card">
      <div style={{ color: "#6b7280" }}>{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [prod, setProd] = useState({ percent: 0, bars: [] });
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentMood, setRecentMood] = useState("—");

  // ---- CURRENT DATE ----
  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "long" });
  const year = today.getFullYear();
  const date = today.getDate();
  const calendarDisplay = `${month} ${year} — ${date}`;

  // ---- LOAD DASHBOARD DATA ----
  async function loadDashboard() {
    try {
      // Productivity
      const p = await apiGet("/productivity");
      setProd(p);

      // Tasks
      const t = await apiGet("/tasks");
      setTasks(t.tasks);

      // Goals
      const g = await apiGet("/goals");
      setGoals(g.goals);

      // Notifications
      const n = await apiGet("/notifications");
      setNotifications(n.notifications);

      // Mood
      const m = await apiGet("/mood");
      if (m.mood.length > 0) {
        setRecentMood(m.mood[m.mood.length - 1].mood);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="content-inner">
      {/* -------- HEADER -------- */}
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back — here's an overview of your day</p>
      </header>

      {/* -------- TOP STATS -------- */}
      <div className="row">
        <Stat title="Tasks" value={tasks.length} />
        <Stat title="Recent Mood" value={recentMood} />
        <Stat title="Motivation" value="Keep going" />
        <Stat title="Calendar" value={calendarDisplay} />
      </div>

      {/* -------- PRODUCTIVITY + UPCOMING TASKS -------- */}
      <div className="row">
        {/* Productivity */}
        <div className="card card-large">
          <h3>
            Weekly Productivity
            <span style={{ float: "right", fontWeight: 700 }}>
              {prod.percent}%
            </span>
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 120,
              marginTop: 12,
            }}
          >
            {prod.bars.map((b, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: `${b}%`,
                  background: "#4f6ef7",
                  borderRadius: 8,
                }}
              ></div>
            ))}

            {prod.bars.length === 0 && (
              <div style={{ color: "#888" }}>No data yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks + Goals */}
        <div className="card card-large">
          <h3>Upcoming Tasks</h3>

          <div style={{ marginTop: 10 }}>
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map((t, i) => <div key={i}>• {t.title}</div>)
            ) : (
              <div>No tasks found</div>
            )}
          </div>

          <h4 style={{ marginTop: 16 }}>Goals</h4>

          {goals.length > 0 ? (
            goals.map((g) => (
              <div key={g.id}>
                {g.title} —{" "}
                <b>
                  {Math.round(
                    (g.progress_minutes / g.target_minutes) * 100
                  )}
                  %
                </b>
              </div>
            ))
          ) : (
            <div>No goals added</div>
          )}
        </div>
      </div>

      {/* -------- MOOD + NOTIFICATIONS -------- */}
      <div className="row">
        {/* Mood */}
        <div className="card" style={{ width: "22%" }}>
          <h3>Mood</h3>
          <div style={{ fontSize: 24 }}>{recentMood}</div>
        </div>

        {/* Notifications */}
        <div className="chat-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Notifications
          </div>

          <div className="chat-messages" style={{ height: 250 }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="message">
                  {n.text}
                </div>
              ))
            ) : (
              <div className="message">No notifications available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
