import React from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

// MAIN PAGES
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Mood from "./pages/Mood";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";
import Motivation from "./pages/Motivation";

// NEW FEATURE PAGES (optional, if you will add)
import StudyPlanAI from "./pages/StudyPlanAI";       // AI Study Plan Generator
import ProductivityFull from "./pages/Productivity"; // Weekly Line Graph
import CalendarPage from "./pages/CalendarPage";     // Calendar Widget
import ChatModes from "./pages/ChatModes";           // Chat mode interface

export default function App() {
  return (
    <div className="app-root">
      <Sidebar />
      <div className="content">
        <Routes>

          {/* Default */}
          <Route path="/" element={<Dashboard />} />

          {/* Existing Pages */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/motivation" element={<Motivation />} />

          {/* New Feature Pages */}
          <Route path="/study-plan" element={<StudyPlanAI />} />
          <Route path="/productivity" element={<ProductivityFull />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/chat-modes" element={<ChatModes />} />

        </Routes>
      </div>
    </div>
  );
}
