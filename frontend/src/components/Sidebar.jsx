import React from 'react'
import { NavLink } from 'react-router-dom'
export default function Sidebar(){
  return (
    <aside className="sidebar">
      <h1>UNIV-ASSIST</h1>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/mood">Mood</NavLink>
        <NavLink to="/planner">Planner</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/motivation">Motivation</NavLink>
      </nav>
    </aside>
  )
}
