import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import AttendanceCalendar from "../components/AttendanceCalendar";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { supabase } from "../lib/supabaseClient";
import { ATTENDANCE_SLOTS } from "../config";
import {
  dateKey,
  getSlotStatus,
  getCurrentPosition,
  nextSalaryDate,
  formatDate,
} from "../lib/attendance";

function fmtINR(n) {
  if (n === null || n === undefined) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

// Supabase rows -> the { "YYYY-MM-DD": { morning: "10:02 AM", evening: "..." } }
// shape AttendanceCalendar expects.
function rowsToAttendanceMap(rows) {
  const map = {};
  for (const r of rows) {
    map[r.work_date] = {
      morning: r.morning_time
        ? new Date(r.morning_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : undefined,
      evening: r.evening_time
        ? new Date(r.evening_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : undefined,
    };
  }
  return map;
}

const SLOT_BUTTON_STYLES = {
  "too-early": "bg-gray-100 text-gray-400 cursor-not-allowed",
  open: "bg-brand text-white hover:bg-brand-dark",
  missed: "bg-red-50 text-red-400 cursor-not-allowed",
  done: "bg-emerald-50 text-emerald-600 cursor-not-allowed",
};

function PunchSlot({ slot, cfg, dayRecord, onPunch, busy, geoMessage }) {
  const st = getSlotStatus(slot, dayRecord);
  return (
    <div className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-ink">{cfg.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{st.message}</p>
      </div>
      <button
        disabled={st.status !== "open" || busy}
        onClick={() => onPunch(slot)}
        className={`w-full py-2.5 rounded-full text-sm font-semibold transition ${SLOT_BUTTON_STYLES[st.status]}`}
      >
        {st.status === "done" ? "✓ Marked" : busy ? "Checking location…" : "Mark Attendance"}
      </button>
      {geoMessage?.slot === slot && (
        <p className={`text-xs ${geoMessage.ok ? "text-emerald-600" : "text-red-500"}`}>
          {geoMessage.text}
        </p>
      )}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { employee, loading, logout } = useEmployeeAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [busySlot, setBusySlot] = useState(null);
  const [geoMessage, setGeoMessage] = useState(null);

  useEffect(() => {
    if (!loading && !employee) navigate("/employee-login");
  }, [employee, loading, navigate]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadAttendance = async () => {
    if (!employee) return;
    setLoadingAttendance(true);
    const y = now.getFullYear(), m = now.getMonth();
    const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const end = `${y}-${String(m + 1).padStart(2, "0")}-31`;
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employee.id)
      .gte("work_date", start)
      .lte("work_date", end);
    if (!error) setAttendance(rowsToAttendanceMap(data || []));
    setLoadingAttendance(false);
  };

  useEffect(() => {
    if (employee?.status === "active") loadAttendance();
    else setLoadingAttendance(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const todayRecord = useMemo(() => attendance[dateKey(now)], [attendance, now]);

  const thisMonthStats = useMemo(() => {
    const y = now.getFullYear(), m = now.getMonth();
    let full = 0, half = 0, counted = 0;
    Object.entries(attendance).forEach(([key, rec]) => {
      const [ky, km] = key.split("-").map(Number);
      if (ky === y && km === m + 1) {
        counted++;
        if (rec.morning && rec.evening) full++;
        else if (rec.morning || rec.evening) half++;
      }
    });
    const pct = counted ? Math.round(((full + half * 0.5) / counted) * 100) : 0;
    return { full, half, pct };
  }, [attendance, now]);

  if (loading) return null;
  if (!employee) return null;

  const handlePunch = async (slot) => {
    setGeoMessage(null);
    setBusySlot(slot);
    try {
      const { lat, lng } = await getCurrentPosition();
      const { data, error } = await supabase.rpc("mark_attendance", {
        p_slot: slot,
        p_lat: lat,
        p_lng: lng,
      });
      if (error) {
        setGeoMessage({ slot, ok: false, text: error.message });
      } else if (data?.ok) {
        setGeoMessage({ slot, ok: true, text: `Marked ✓ ${Math.round(data.distance || 0)}m from office.` });
        await loadAttendance();
      } else {
        setGeoMessage({ slot, ok: false, text: data?.message || "Could not mark attendance." });
      }
    } catch (err) {
      const msg =
        err.code === 1
          ? "Location permission denied. Please allow location access to mark attendance."
          : err.code === 3
          ? "Location request timed out. Please try again."
          : err.message || "Couldn't determine your location.";
      setGeoMessage({ slot, ok: false, text: msg });
    } finally {
      setBusySlot(null);
    }
  };

  // ---- Pending approval screen (no salary/attendance yet) ----
  if (employee.status === "pending") {
    return (
      <div className="bg-gray-50 font-sans min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-20 pb-16 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-ink mb-2">Awaiting HR approval</h1>
          <p className="text-gray-500 mb-6">
            Hi {employee.name}, your registration was received. HR still needs to set your
            salary, credit date and office location before you can sign in and mark attendance.
            Check back soon, or contact HR directly.
          </p>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-sm font-semibold px-6 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            Sign Out
          </button>
        </div>
        <Footer />
        <WhatsAppFAB />
      </div>
    );
  }

  const salaryDate = employee.salary_credit_day ? nextSalaryDate(employee.salary_credit_day, now) : null;

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              {employee.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink">{employee.name}</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark">
                  {employee.role}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{employee.designation || "—"} · {employee.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            Sign Out
          </button>
        </div>

        {employee.is_admin && (
          <div className="bg-brand-light border border-brand/20 rounded-xl px-4 py-3 mb-8 flex items-center justify-between">
            <p className="text-sm text-brand-dark">You're an HR/Admin — you have your own dashboard too.</p>
            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-brand text-white hover:bg-brand-dark transition flex-shrink-0"
            >
              Go to Admin Panel
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Monthly Salary</p>
            <p className="text-xl font-extrabold text-ink mt-1">{fmtINR(employee.monthly_salary)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Next Salary Credit</p>
            <p className="text-xl font-extrabold text-ink mt-1">{salaryDate ? formatDate(salaryDate) : "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">This Month Attendance</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{thisMonthStats.pct}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Full / Half Days</p>
            <p className="text-xl font-extrabold text-ink mt-1">{thisMonthStats.full} / {thisMonthStats.half}</p>
          </div>
        </div>

        {/* Punch card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-ink">Today's Attendance</h3>
            <p className="text-sm text-gray-500 font-mono">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {now.toLocaleTimeString("en-IN")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <PunchSlot
              slot="morning"
              cfg={ATTENDANCE_SLOTS.morning}
              dayRecord={todayRecord}
              onPunch={handlePunch}
              busy={busySlot === "morning"}
              geoMessage={geoMessage}
            />
            <PunchSlot
              slot="evening"
              cfg={ATTENDANCE_SLOTS.evening}
              dayRecord={todayRecord}
              onPunch={handlePunch}
              busy={busySlot === "evening"}
              geoMessage={geoMessage}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            Attendance is verified on the server: it checks your location against the office
            assigned by HR, and the time against the server clock — not your device's clock.
          </p>
        </div>

        {/* Calendar */}
        {loadingAttendance ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Loading attendance…
          </div>
        ) : (
          <AttendanceCalendar attendance={attendance} />
        )}
      </div>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
