import { useMemo, useState } from "react";
import { pad2, daysInMonth, dateKey } from "../lib/attendance";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function cellStatus(record, isFuture, isToday, isWeekend) {
  if (isFuture) return "future";
  if (record?.morning && record?.evening) return "full";
  if (record?.morning || record?.evening) return "half";
  if (isWeekend) return "weekend";
  if (isToday) return "today-pending";
  return "absent";
}

const STYLES = {
  full:         "bg-emerald-500 text-white",
  half:         "bg-amber-400 text-white",
  absent:       "bg-red-100 text-red-500",
  weekend:      "bg-gray-100 text-gray-400",
  future:       "bg-gray-50 text-gray-300",
  "today-pending": "bg-white text-ink border-2 border-brand",
};

export default function AttendanceCalendar({ attendance }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const numDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(year, month, d);
      const key = dateKey(dateObj);
      const record = attendance[key];
      const isFuture = dateObj > new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = key === dateKey(today);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      arr.push({
        day: d,
        key,
        record,
        status: cellStatus(record, isFuture, isToday, isWeekend),
        isToday,
      });
    }
    return arr;
  }, [year, month, numDays, firstWeekday, attendance]);

  const stats = useMemo(() => {
    let full = 0, half = 0, absent = 0, workingDaysPassed = 0;
    cells.forEach((c) => {
      if (!c) return;
      if (c.status === "full") { full++; workingDaysPassed++; }
      else if (c.status === "half") { half++; workingDaysPassed++; }
      else if (c.status === "absent") { absent++; workingDaysPassed++; }
    });
    const pct = workingDaysPassed ? Math.round(((full + half * 0.5) / workingDaysPassed) * 100) : 0;
    return { full, half, absent, pct };
  }, [cells]);

  const goMonth = (delta) => setCursor(new Date(year, month + delta, 1));
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-ink">Attendance — {MONTH_NAMES[month]} {year}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.full} full days · {stats.half} half days · {stats.absent} absent · {stats.pct}% attendance
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => goMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* weekday header */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-gray-400">{w}</div>
        ))}
      </div>

      {/* day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) =>
          c ? (
            <button
              key={c.key}
              onClick={() => setSelected(c)}
              className={`aspect-square rounded-md text-xs font-semibold flex items-center justify-center transition hover:opacity-80 ${STYLES[c.status]}`}
              title={c.key}
            >
              {pad2(c.day)}
            </button>
          ) : (
            <div key={`blank-${i}`} />
          )
        )}
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Full day</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Half day</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-100" /> Absent</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gray-100" /> Weekend</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-white border-2 border-brand" /> Today</span>
      </div>

      {/* selected day detail */}
      {selected && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{selected.key}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selected.record?.morning ? `Morning: ${selected.record.morning}` : "Morning: —"}
              {"  ·  "}
              {selected.record?.evening ? `Evening: ${selected.record.evening}` : "Evening: —"}
            </p>
          </div>
          <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-ink">Close</button>
        </div>
      )}
    </div>
  );
}
