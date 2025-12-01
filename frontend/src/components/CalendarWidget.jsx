import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  return (
    <div className="card">
      <h4>Calendar</h4>
      <Calendar value={date} onChange={setDate} />
    </div>
  );
}
