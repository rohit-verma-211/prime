import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { supabase } from "../lib/supabaseClient";

function fmtINR(n) {
  if (n === null || n === undefined) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function ApproveRow({ emp, offices, onSaved }) {
  const [salary, setSalary] = useState(emp.monthly_salary || "");
  const [creditDay, setCreditDay] = useState(emp.salary_credit_day || 1);
  const [officeId, setOfficeId] = useState(emp.office_location_id || (offices[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async (nextStatus) => {
    setSaving(true);
    setErr("");
    const { error } = await supabase
      .from("employees")
      .update({
        status: nextStatus,
        monthly_salary: nextStatus === "active" ? Number(salary) : emp.monthly_salary,
        salary_credit_day: nextStatus === "active" ? Number(creditDay) : emp.salary_credit_day,
        office_location_id: nextStatus === "active" ? officeId : emp.office_location_id,
      })
      .eq("id", emp.id);
    setSaving(false);
    if (error) setErr(error.message);
    else onSaved();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-ink">{emp.name}</p>
          <p className="text-xs text-gray-500">{emp.email} · {emp.role} · {emp.designation || "—"}</p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          Pending
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Monthly Salary (₹)</label>
          <input
            type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Salary Credit Day</label>
          <input
            type="number" min="1" max="28" value={creditDay} onChange={(e) => setCreditDay(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Office</label>
          <select
            value={officeId} onChange={(e) => setOfficeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
          >
            {offices.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {err && <p className="text-xs text-red-500 mb-2">{err}</p>}

      <div className="flex gap-2">
        <button
          disabled={saving || !officeId}
          onClick={() => save("active")}
          className="px-4 py-2 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={saving}
          onClick={() => save("rejected")}
          className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { employee, loading, logout } = useEmployeeAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [offices, setOffices] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!employee || !employee.is_admin)) navigate("/employee-login");
  }, [employee, loading, navigate]);

  const loadAll = async () => {
    setFetching(true);
    const [{ data: emps }, { data: offs }] = await Promise.all([
      supabase.from("employees").select("*").order("created_at", { ascending: false }),
      supabase.from("office_locations").select("*"),
    ]);
    setPending((emps || []).filter((e) => e.status === "pending"));
    setActive((emps || []).filter((e) => e.status === "active"));
    setOffices(offs || []);
    setFetching(false);
  };

  useEffect(() => {
    if (employee?.is_admin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  if (loading || !employee || !employee.is_admin) return null;

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">HR / Admin</h1>
            <p className="text-gray-500 text-sm">Approve joinees and manage salary &amp; office assignment.</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            Sign Out
          </button>
        </div>

        {offices.length === 0 && !fetching && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-8">
            No office locations exist yet. Add a row to the <code>office_locations</code> table
            in Supabase (label, lat, lng, radius_meters) before approving anyone, so you have
            somewhere to assign them to.
          </div>
        )}

        <h2 className="font-bold text-ink mb-3">Pending approval ({pending.length})</h2>
        <div className="space-y-4 mb-10">
          {fetching && <p className="text-gray-400 text-sm">Loading…</p>}
          {!fetching && pending.length === 0 && (
            <p className="text-gray-400 text-sm">No pending registrations.</p>
          )}
          {pending.map((emp) => (
            <ApproveRow key={emp.id} emp={emp} offices={offices} onSaved={loadAll} />
          ))}
        </div>

        <h2 className="font-bold text-ink mb-3">Active staff ({active.length})</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Role</th>
                <th className="text-left px-4 py-2.5">Salary</th>
                <th className="text-left px-4 py-2.5">Credit Day</th>
                <th className="text-left px-4 py-2.5">Office</th>
              </tr>
            </thead>
            <tbody>
              {active.map((emp) => (
                <tr key={emp.id} className="border-t border-gray-100">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.email}</p>
                  </td>
                  <td className="px-4 py-2.5">{emp.role}</td>
                  <td className="px-4 py-2.5">{fmtINR(emp.monthly_salary)}</td>
                  <td className="px-4 py-2.5">{emp.salary_credit_day}</td>
                  <td className="px-4 py-2.5">
                    {offices.find((o) => o.id === emp.office_location_id)?.label || "—"}
                  </td>
                </tr>
              ))}
              {!fetching && active.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No active staff yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
