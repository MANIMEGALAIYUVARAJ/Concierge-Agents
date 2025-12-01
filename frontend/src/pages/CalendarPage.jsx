import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>

      <div className="card">
        <Calendar onChange={setValue} value={value} />
      </div>
    </div>
  );
}
