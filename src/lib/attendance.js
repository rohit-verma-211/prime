import { ATTENDANCE_SLOTS, PUNCH_WINDOW_MINUTES } from "../config";

// ---- date helpers ----
export function pad2(n) {
  return String(n).padStart(2, "0");
}
export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function daysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// ---- punch-window logic (CLIENT-SIDE HINT ONLY) ----
// This only decides whether to show the button as clickable so the UI
// feels responsive. It is NOT the security boundary — the real check
// (using the database's clock, not the device's) lives in the
// mark_attendance() Postgres function in supabase/schema.sql, which is
// the only thing that actually writes an attendance row. Keep the
// hour/minute values here in sync with that function if you change them.
export function getSlotStatus(slot, attendanceForDay, now = new Date()) {
  const cfg = ATTENDANCE_SLOTS[slot];
  if (!cfg) return { open: false, status: "unknown", message: "" };

  if (attendanceForDay?.[slot]) {
    return { open: false, status: "done", message: `Marked at ${attendanceForDay[slot]}` };
  }

  const slotTime = new Date(now);
  slotTime.setHours(cfg.hour, cfg.minute, 0, 0);
  const diffMinutes = (now - slotTime) / 60000;

  if (diffMinutes < -PUNCH_WINDOW_MINUTES) {
    return {
      open: false,
      status: "too-early",
      message: `Opens at ${formatSlotTime(cfg)} (window opens ${PUNCH_WINDOW_MINUTES} min before)`,
    };
  }
  if (diffMinutes > PUNCH_WINDOW_MINUTES) {
    return {
      open: false,
      status: "missed",
      message: `Window closed at ${formatSlotTime(cfg)} +${PUNCH_WINDOW_MINUTES}m`,
    };
  }
  return { open: true, status: "open", message: "You can mark attendance now" };
}

export function formatSlotTime(cfg) {
  const h = cfg.hour % 12 === 0 ? 12 : cfg.hour % 12;
  const ampm = cfg.hour >= 12 ? "PM" : "AM";
  return `${h}:${pad2(cfg.minute)} ${ampm}`;
}

// ---- geolocation reading (the actual geofence math now happens
// server-side inside mark_attendance(); the client only reads and
// forwards raw coordinates) ----
export function getCurrentPosition(options = { enableHighAccuracy: true, timeout: 10000 }) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device/browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(err),
      options
    );
  });
}

// ---- salary ----
export function nextSalaryDate(salaryCreditDay, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  let candidate = new Date(year, month, salaryCreditDay);
  if (candidate < now) candidate = new Date(year, month + 1, salaryCreditDay);
  return candidate;
}

export function formatDate(d) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
