import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from "../config";

// ── Job Data ─────────────────────────────────────────────────
const JOBS = [
  // Stock Market & Finance
  { id: "equity_dealer",       label: "Equity Dealer",               dept: "Trading",    type: "Full-Time",  desc: "Execute buy/sell orders for clients across NSE & BSE. Requires NISM Series-VII." },
  { id: "equity_analyst",      label: "Equity Research Analyst",     dept: "Research",   type: "Full-Time",  desc: "Produce detailed equity research reports, financial models and stock recommendations." },
  { id: "derivatives_trader",  label: "Derivatives Trader (F&O)",    dept: "Trading",    type: "Full-Time",  desc: "Manage futures & options positions. Strong understanding of Greeks and hedging strategies." },
  { id: "portfolio_manager",   label: "Portfolio Manager",           dept: "Investment", type: "Full-Time",  desc: "Manage client portfolios, asset allocation and performance monitoring." },
  { id: "relationship_mgr",    label: "Relationship Manager",        dept: "Sales",      type: "Full-Time",  desc: "Acquire and retain HNI/retail clients. Achieve revenue targets through cross-selling." },
  { id: "mutual_fund_advisor", label: "Mutual Fund Advisor",         dept: "Investment", type: "Full-Time",  desc: "Guide clients on SIP, lump-sum investments and goal-based financial planning." },
];

const QUALIFICATIONS = [
  "10th Pass","12th Pass","Pursuing Graduation",
  "B.Com","BBA","B.Tech / BE","BA","BSc",
  "MBA (Finance)","MBA (Marketing)","MBA (IT/Data)",
  "CA / CFA / CMA","M.Tech / ME","MCA","MSc",
  "NISM Certified","Other",
];

const EXPERIENCE = [
  "Fresher (0 years)","0–1 years","1–2 years",
  "2–4 years","4–6 years","6–10 years","10+ years",
];

// ── EmailJS loader ────────────────────────────────────────────
function useEmailJS() {
  useEffect(() => {
    if (window.emailjs) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    document.head.appendChild(s);
  }, []);
}

// ── Display font loader (serif for headlines) ─────────────────
function useDisplayFont() {
  useEffect(() => {
    if (document.getElementById("careers-display-font")) return;
    const link = document.createElement("link");
    link.id = "careers-display-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap";
    document.head.appendChild(link);
  }, []);
}
const serif = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };

// ── Application Modal ────────────────────────────────────────
function ApplyModal({ job, onClose }) {
  const INIT = { name:"", email:"", phone:"", linkedin:"", portfolio:"", qualification:"", experience:"", cover:"", resumeName:"", resumeB64:"" };
  const [form, setForm]   = useState(INIT);
  const [status, setStatus] = useState(null);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setStatus({ type:"error", msg:"Resume must be under 5 MB." }); return; }
    const reader = new FileReader();
    reader.onload = () => set("resumeB64", reader.result);
    reader.readAsDataURL(f);
    set("resumeName", f.name);
    setStatus(null);
  };

  const validate = () => {
    if (!form.name.trim())         return "Full name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone))     return "Enter a valid 10-digit phone number.";
    if (!form.qualification)       return "Please select your qualification.";
    if (!form.experience)          return "Please select your experience level.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setStatus({ type:"error", msg: err }); return; }
    setStatus({ type:"sending", msg:"Sending your application…" });

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        position_title:  job.label,
        position_type:   job.type,
        department:      job.dept,
        applicant_name:  form.name,
        applicant_email: form.email,
        applicant_phone: form.phone,
        linkedin:        form.linkedin  || "Not provided",
        portfolio:       form.portfolio || "Not provided",
        qualification:   form.qualification,
        experience:      form.experience,
        cover_letter:    form.cover     || "Not provided",
        resume_name:     form.resumeName|| "Not attached",
        applied_on:      new Date().toLocaleString("en-IN", { timeZone:"Asia/Kolkata" }),
      });
      setStatus({ type:"success" });
    } catch (err) {
      console.error(err);
      setStatus({ type:"error", msg:"Failed to send. Please try again or email us directly at primebulls@gmail.com" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-ink text-white px-8 py-6 rounded-t-lg flex items-start justify-between sticky top-0 z-10 border-b-2 border-[#B08D57]">
          <div>
            <p className="text-white/50 text-xs font-medium mb-1.5">{job.dept} — {job.type}</p>
            <h2 style={serif} className="text-2xl font-medium">{job.label}</h2>
            <p className="text-white/60 text-sm mt-1">Primebulls Financial Services, Delhi</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white text-2xl leading-none ml-4 mt-1">×</button>
        </div>

        <div className="p-8">
          {status?.type === "success" ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full border-2 border-brand flex items-center justify-center mx-auto mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand">
                  <path d="M4 12l6 6L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={serif} className="text-2xl font-medium text-gray-900 mb-2">Application received</h3>
              <p className="text-gray-500 mb-1">Thank you for applying for <strong className="text-gray-700">{job.label}</strong>.</p>
              <p className="text-gray-500 mb-8">Our hiring team will review your profile and respond within <strong className="text-gray-700">3–5 business days</strong>.</p>
              <button onClick={onClose} className="px-7 py-2.5 bg-ink text-white rounded-md font-medium text-sm hover:bg-black transition">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-xs text-gray-400 pb-4 border-b border-gray-100">
                Fields marked <span className="text-red-500">*</span> are required.
              </p>

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone number <span className="text-red-500">*</span></label>
                  <input type="tel" value={form.phone}
                    onChange={e => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">LinkedIn profile</label>
                  <input type="url" value={form.linkedin} onChange={e => set("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Portfolio, GitHub or website <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="url" value={form.portfolio} onChange={e => set("portfolio", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              </div>

              {/* Qualification + Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Highest qualification <span className="text-red-500">*</span></label>
                  <select value={form.qualification} onChange={e => set("qualification", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none bg-white">
                    <option value="">Select qualification</option>
                    {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work experience <span className="text-red-500">*</span></label>
                  <select value={form.experience} onChange={e => set("experience", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none bg-white">
                    <option value="">Select experience</option>
                    {EXPERIENCE.map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Resume <span className="text-gray-400 font-normal">(PDF or DOC, max 5 MB)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-brand transition"
                >
                  {form.resumeName ? (
                    <p className="text-brand-dark font-medium text-sm">{form.resumeName}</p>
                  ) : (
                    <>
                      <p className="text-gray-500 text-sm">Click to upload your resume</p>
                      <p className="text-gray-400 text-xs mt-0.5">PDF, DOC or DOCX</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
              </div>

              {/* Cover letter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Why do you want to join Primebulls? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.cover} onChange={e => set("cover", e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself, your motivation, and what makes you a strong fit."
                  className="w-full border border-gray-300 rounded-md px-3.5 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none resize-none"
                />
              </div>

              {/* Error / sending */}
              {(status?.type === "error" || status?.type === "sending") && (
                <p className={`text-sm text-center font-medium ${status.type === "error" ? "text-red-500" : "text-brand-dark"}`}>
                  {status.msg}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={status?.type === "sending"}
                className="w-full bg-ink text-white font-medium py-3 rounded-md hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {status?.type === "sending" ? "Sending application…" : "Submit application"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to share your details with Primebulls Financial Services for hiring purposes only.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Careers Page ─────────────────────────────────────────────
export default function Careers() {
  useEmailJS();
  useDisplayFont();
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected,   setSelected]   = useState(null);

  const DEPTS = ["All","Trading","Research","Investment","Sales","Tech","Analytics","Marketing","Operations","Compliance"];
  const TYPES = ["All","Full-Time","Internship"];

  const visible = JOBS.filter(j =>
    (deptFilter === "All" || j.dept === deptFilter) &&
    (typeFilter === "All" || j.type === typeFilter)
  );

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const stats = [
    { n: `${JOBS.filter(j=>j.type==="Full-Time").length}`, l: "Full-time roles" },
    { n: `${JOBS.filter(j=>j.type==="Internship").length}`, l: "Internships" },
    { n: "9", l: "Departments" },
    { n: "Delhi", l: "Headquarters" },
  ];

  const perks = [
    { t:"Competitive compensation",   d:"Market-linked salaries with performance bonuses." },
    { t:"NISM certification support", d:"We fund your SEBI/NISM certification exams." },
    { t:"Real market exposure",       d:"Work with live trades, real portfolios and real clients." },
    { t:"Fast career growth",         d:"Meritocracy-driven appraisals and fast-track promotions." },
    { t:"Flexible work options",      d:"Hybrid and remote-friendly culture across most roles." },
    { t:"Expert mentorship",          d:"Learn directly from SEBI-registered traders and analysts." },
  ];

  return (
    <div className="bg-white font-sans min-h-screen">
      <Navbar />

      {/* Page hero */}
      <div className="bg-ink text-white pt-16 pb-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 style={serif} className="text-4xl md:text-[3.25rem] leading-[1.1] font-medium mb-5 max-w-2xl">
            Build your career in India's financial markets
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
            We're hiring across trading, research, investment and client relationships.
            Freshers and experienced professionals are both welcome.
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-11 pt-8 border-t border-white/15">
            {stats.map(s => (
              <div key={s.l}>
                <div style={serif} className="text-3xl font-medium">{s.n}</div>
                <div className="text-white/50 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + job listing */}
      <div className="max-w-5xl mx-auto px-4 py-14">

        {/* Type filter — underline tabs */}
        <div className="flex gap-7 border-b border-gray-200 mb-6">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition ${
                typeFilter === t
                  ? "border-ink text-ink"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "All" ? "All openings" : t}
            </button>
          ))}
        </div>

        {/* Dept filter pills — subdued */}
        <div className="flex flex-wrap gap-2 mb-10">
          {DEPTS.map(d => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                deptFilter === d
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-2">
          {visible.length} position{visible.length !== 1 ? "s" : ""} open
        </p>

        {/* Listing */}
        {visible.length > 0 ? (
          <div className="border-t border-gray-200">
            {visible.map(job => (
              <div
                key={job.id}
                className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-8 items-start md:items-center py-6 border-b border-gray-200"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 style={serif} className="text-xl font-medium text-gray-900">
                      {job.label}
                    </h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark bg-brand-light px-2 py-0.5 rounded">
                      {job.dept}
                    </span>
                    {job.type === "Internship" && (
                      <span className="text-[11px] font-semibold text-gray-500 border border-gray-300 px-2 py-0.5 rounded">
                        Internship
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 max-w-xl leading-relaxed">{job.desc}</p>
                </div>
                <button
                  onClick={() => setSelected(job)}
                  className="justify-self-start md:justify-self-end shrink-0 px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-ink group-hover:bg-ink group-hover:text-white group-hover:border-ink transition"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 border-t border-gray-200">
            <p>No positions match your filters. Try a different department or type.</p>
          </div>
        )}

        {/* Perks section */}
        <div className="mt-20 bg-ink rounded-lg p-8 md:p-14 text-white">
          <h2 style={serif} className="text-2xl md:text-3xl font-medium mb-10 max-w-md">
            Why people join Primebulls
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {perks.map(p => (
              <div key={p.t} className="pt-5 border-t border-white/15">
                <div className="font-medium text-sm mb-1.5">{p.t}</div>
                <div className="text-white/55 text-sm leading-relaxed">{p.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-12">
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-ink transition">
            ← Back to home
          </Link>
        </div>
      </div>

      <Footer />
      <WhatsAppFAB />

      {/* Application modal */}
      {selected && <ApplyModal job={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}