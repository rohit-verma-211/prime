// ============================================================
// UPDATE THESE BEFORE DEPLOYING
// ============================================================

export const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // country code + number, no + (update with Primebulls' real number)

export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Get free at https://emailjs.com
// Services → Add Gmail → copy ID
// Email Templates → Create → copy ID
// Account → copy Public Key
export const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
export const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
export const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";

// The Stocks section gets live prices from Yahoo Finance — no API key
// needed. It goes through a free public CORS proxy (allorigins.win) so
// it can be called directly from the browser; see the comment at the
// top of src/lib/yahooFinance.js if you want to swap that proxy out
// for your own server-side one before shipping this to real users.

// ============================================================
// EMPLOYEE / INTERN ATTENDANCE PORTAL
// ============================================================
// Office coordinates now live in Supabase (see the `office_locations`
// table in supabase/schema.sql) — an admin assigns one to each employee
// from /admin, since that's the value that actually gets enforced
// server-side. Nothing here decides pass/fail anymore.

// Punch times (24-hour clock). These are for the UI hint only — the
// button becomes clickable based on the DEVICE clock so it feels
// responsive — but the actual accept/reject decision is made by the
// mark_attendance() Postgres function using the DATABASE clock (IST).
// If you change these, update the matching hour values in
// supabase/schema.sql too so the two stay in sync.
export const ATTENDANCE_SLOTS = {
  morning: { label: "Morning Check-in", hour: 10, minute: 0 },
  evening: { label: "Evening Check-out", hour: 18, minute: 0 },
};

// A punch is only allowed within +/- this many minutes of the sharp
// slot time above (exact-second matching isn't realistic for a human).
export const PUNCH_WINDOW_MINUTES = 15;