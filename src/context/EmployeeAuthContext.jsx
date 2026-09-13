import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const EmployeeAuthContext = createContext(null);

export function EmployeeAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [employee, setEmployee] = useState(null); // row from `employees` table
  const [loading, setLoading] = useState(true);    // true while resolving session + profile
  const [authError, setAuthError] = useState("");

  // Restore/observe the Supabase auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Whenever the session changes, (re)load the employee profile row
  useEffect(() => {
    let cancelled = false;
    if (!session?.user) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("employees")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setAuthError(error.message);
        setEmployee(data ?? null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session]);

  const login = async (email, password) => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    return true;
  };

  // Self-registration: captures profile info ONLY. Salary, salary credit
  // day, office assignment and account activation are deliberately left
  // out here — those are set later by an admin from /admin, never by the
  // employee themself (see employees_admin_update_all policy in schema.sql).
  const signup = async ({ email, password, name, phone, designation, role }) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return { ok: false };
    }

    const userId = data.user?.id;
    // If your Supabase project has "confirm email" turned on, there's no
    // active session yet at this point — the profile row gets created the
    // first time they log in after confirming, via ensureProfileExists below.
    if (!userId) {
      return { ok: true, needsEmailConfirm: true };
    }

    const { error: insertError } = await supabase.from("employees").insert({
      id: userId,
      name,
      email,
      phone,
      designation,
      role,
      status: "pending",
      joined_on: new Date().toISOString().slice(0, 10),
    });
    if (insertError) {
      setAuthError(insertError.message);
      return { ok: false };
    }
    return { ok: true, needsEmailConfirm: false };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <EmployeeAuthContext.Provider
      value={{ session, employee, loading, login, signup, logout, authError, setAuthError }}
    >
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error("useEmployeeAuth must be used within EmployeeAuthProvider");
  return ctx;
}
