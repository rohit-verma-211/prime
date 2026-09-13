import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const profileRef = useRef(null);
  const loginRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { to: "/", label: "Home", match: p => p === "/" },
    { to: "/stocks", label: "Markets", match: p => p.startsWith("/stocks") },
    { to: "/sip-calculator", label: "SIP Calculator", match: p => p === "/sip-calculator" },
    { to: "/portfolio", label: "Portfolio", match: p => p === "/portfolio" },
    { to: "/careers", label: "Careers", match: p => p === "/careers" },
    { to: "/partner-with-us", label: "Partner With Us", match: p => p === "/partner-with-us" },
    { to: "/contact-us", label: "Contact Us", match: p => p === "/contact-us" },
  ];

  const loginLinks = [
    { to: "/login", label: "Client Login" },
    { to: "/employee-login", label: "Employee Login" },
    { to: "/angel-one-nxt-login", label: "Angel One Nxt Login" },
  ];

  const handleTradeNow = () => {
    setMenuOpen(false);
    navigate(user ? "/stocks" : "/login");
  };

  // Hover handling with a small close delay so moving the mouse from the
  // button to the panel doesn't close it.
  const openLoginMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setLoginOpen(true);
  };
  const scheduleCloseLoginMenu = () => {
    closeTimer.current = setTimeout(() => setLoginOpen(false), 150);
  };

  return (
    <nav className="bg-white sticky w-full top-0 left-0 text-ink z-50 border-b border-gray-100">
      <div className="w-full flex justify-between items-center gap-4 px-5 py-3.5 max-w-[1400px] mx-auto">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-brand flex-shrink-0">
            <span className="text-white font-bold text-xs">PB</span>
          </div>
          <span className="text-xl font-bold text-ink">Primebulls</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center gap-6 flex-shrink-0">
          {links.map(l => {
            const active = l.match(location.pathname);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[15px] font-medium transition ${active ? "text-brand" : "text-ink hover:text-brand"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Logged-out: pill Login button with hover dropdown */}
          {!user && (
            <div
              className="hidden md:block relative"
              ref={loginRef}
              onMouseEnter={openLoginMenu}
              onMouseLeave={scheduleCloseLoginMenu}
            >
              <button
                onClick={() => setLoginOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition shadow-sm"
                aria-haspopup="true"
                aria-expanded={loginOpen}
              >
                Login
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${loginOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5L10 12.5L15 7.5" />
                </svg>
              </button>

              {loginOpen && (
                <div className="absolute right-0 top-full pt-2 w-52 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    {loginLinks.map(l => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setLoginOpen(false)}
                        className="block px-4 py-2 text-sm text-ink hover:bg-brand-light hover:text-brand transition"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth area (logged-in profile menu) */}
          {user && (
            <div className="hidden md:block relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                {user.picture
                  ? <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full" />
                  : <div className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                }
                <span className="text-sm font-medium text-ink max-w-[100px] truncate">{user.name}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link to="/portfolio" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-ink hover:bg-brand-light hover:text-brand transition">
                    My Portfolio
                  </Link>
                  <button
                    onClick={() => { signOut(); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary CTA */}
          
          {/* Hamburger */}
          <button
            className="xl:hidden p-2 rounded text-ink flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 text-ink px-5 py-3 space-y-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="block py-2 hover:text-brand transition text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {!user && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <p className="py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Login</p>
              {loginLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block py-2 text-ink hover:text-brand transition text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={handleTradeNow}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition"
          >
            Trade Now
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13L13 7M13 7H8M13 7V12" />
            </svg>
          </button>
          {user && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left py-2 text-red-600 text-sm font-medium">
                Sign Out ({user.name})
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}