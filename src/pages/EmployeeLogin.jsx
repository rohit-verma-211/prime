import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";

export default function EmployeeLogin() {
  const { employee, login, authError, setAuthError } = useEmployeeAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (employee) navigate(employee.is_admin ? "/admin" : "/employee-dashboard");
  }, [employee, navigate]);

  useEffect(() => {
    setAuthError("");
  }, [setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Navigation happens in the effect above once the employee profile
    // loads (it needs to know is_admin before deciding where to send them).
    await login(email, password);
  };

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
            Employee<br />
            <span className="italic font-light text-white/80">& Intern </span>
            Portal
          </h1>
          <p className="mt-6 text-white/80 text-sm max-w-sm">
            Check your salary credit date and mark your attendance for the day.
            Attendance can only be marked from inside office premises, right at
            check-in and check-out time.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="lg:w-1/2 flex-1 flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-ink mb-1">Staff sign in</h2>
          <p className="text-gray-500 text-sm mb-8">
            Use the email &amp; password provided by HR.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Work email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />

            {authError && <p className="text-sm text-red-500">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-brand text-white font-bold py-3 rounded-full hover:bg-brand-dark transition"
            >
              Log In
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            New joinee?{" "}
            <Link to="/employee-signup" className="text-brand-dark font-semibold hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Not a staff member?{" "}
            <Link to="/login" className="text-brand-dark font-semibold hover:underline">
              Go to customer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
