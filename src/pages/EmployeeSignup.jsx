import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";

export default function EmployeeSignup() {
  const { signup, authError, setAuthError } = useEmployeeAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", designation: "", role: "Employee",
    password: "", confirm: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (form.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setAuthError("Passwords don't match.");
      return;
    }
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      designation: form.designation,
      role: form.role,
    });
    if (result.ok) {
      setNeedsConfirm(!!result.needsEmailConfirm);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-ink mb-2">Registration received</h1>
          <p className="text-gray-500 text-sm mb-6">
            {needsConfirm
              ? "Check your inbox to confirm your email address, then log in. "
              : ""}
            Your account is now <strong>pending HR approval</strong> — once HR
            sets your salary, credit date and office location, you'll be able
            to sign in and mark attendance.
          </p>
          <Link to="/employee-login" className="inline-block px-6 py-3 bg-brand text-white rounded-full font-bold hover:bg-brand-dark transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — brand panel */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-brand-dark via-brand to-violet-400 text-white flex flex-col justify-center px-10 sm:px-16 py-16 overflow-hidden">
        <div className="absolute inset-0 grid-backdrop opacity-60" />
        <div className="relative z-10 max-w-md">
          <Link to="/" className="inline-flex h-14 w-14 rounded-2xl bg-white/15 backdrop-blur items-center justify-center font-bold text-lg mb-10">
            PB
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Join the<br />
            <span className="italic font-light text-white/80">team </span>
            portal
          </h1>
          <p className="mt-6 text-white/80 text-sm max-w-sm">
            Register your details below. HR reviews every new account and sets
            your salary, credit date and assigned office before you can sign in
            — you won't need to enter any of that yourself.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="lg:w-1/2 flex-1 flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-ink mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-8">Employees &amp; interns only.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text" placeholder="Full name" required
              value={form.name} onChange={set("name")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <input
              type="email" placeholder="Work email address" required
              value={form.email} onChange={set("email")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <input
              type="tel" placeholder="Phone number"
              value={form.phone} onChange={set("phone")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <input
              type="text" placeholder="Designation (e.g. Equity Research Analyst)"
              value={form.designation} onChange={set("designation")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <select
              value={form.role} onChange={set("role")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition bg-white"
            >
              <option value="Employee">Employee</option>
              <option value="Intern">Intern</option>
            </select>
            <input
              type="password" placeholder="Password" required
              value={form.password} onChange={set("password")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <input
              type="password" placeholder="Confirm password" required
              value={form.confirm} onChange={set("confirm")}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />

            {authError && <p className="text-sm text-red-500">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-brand text-white font-bold py-3 rounded-full hover:bg-brand-dark transition"
            >
              Register
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/employee-login" className="text-brand-dark font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
