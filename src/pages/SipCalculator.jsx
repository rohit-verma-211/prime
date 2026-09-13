import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";

function fmtINR(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// Future value of a monthly SIP with monthly compounding
function sipFutureValue(monthly, annualRatePct, years) {
  const n = years * 12;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return monthly * n;
  return monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

function GrowthChart({ monthly, rate, years }) {
  const points = useMemo(() => {
    const arr = [];
    for (let y = 1; y <= years; y++) {
      arr.push({ year: y, value: sipFutureValue(monthly, rate, y) });
    }
    return arr;
  }, [monthly, rate, years]);

  const max = Math.max(...points.map(p => p.value), 1);
  const w = 700, h = 220, pad = 30;
  const barW = (w - pad * 2) / points.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
      {points.map((p, idx) => {
        const barH = (p.value / max) * (h - pad * 2);
        const x = pad + idx * ((w - pad * 2) / points.length) + 4;
        const y = h - pad - barH;
        return (
          <g key={p.year}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill="#7c3aed" opacity={0.5 + 0.5 * (idx / points.length)} />
            {(points.length <= 15 || idx % Math.ceil(points.length / 15) === 0) && (
              <text x={x + barW / 2} y={h - pad + 14} fontSize="9" textAnchor="middle" fill="#8b8694">
                {p.year}
              </text>
            )}
          </g>
        );
      })}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

function Slider({ label, value, display, onChange, min, max, step, minLabel, maxLabel }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <span className="text-sm font-bold text-ink">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={onChange}
        className="w-full accent-brand"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const invested = monthly * years * 12;
  const futureValue = sipFutureValue(monthly, rate, years);
  const returns = futureValue - invested;

  return (
    <div className="bg-white font-sans min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-1">SIP Calculator</h1>
        <p className="text-gray-500 mb-10">
          See how a Systematic Investment Plan can grow your wealth over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Purchase-style details panel */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <h3 className="text-xs font-bold tracking-wide text-gray-400 uppercase mb-6">Investment Details</h3>

            <div className="space-y-7">
              <Slider
                label="Monthly Investment"
                value={monthly}
                display={fmtINR(monthly)}
                onChange={e => setMonthly(Number(e.target.value))}
                min={500} max={200000} step={500}
                minLabel="₹500" maxLabel="₹2,00,000"
              />
              <Slider
                label="Expected Return Rate (p.a.)"
                value={rate}
                display={`${rate}%`}
                onChange={e => setRate(Number(e.target.value))}
                min={1} max={30} step={0.5}
                minLabel="1%" maxLabel="30%"
              />
              <Slider
                label="Time Period"
                value={years}
                display={`${years} ${years === 1 ? "year" : "years"}`}
                onChange={e => setYears(Number(e.target.value))}
                min={1} max={40} step={1}
                minLabel="1 yr" maxLabel="40 yrs"
              />
            </div>
          </div>

          {/* Right — Financial summary panel */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold tracking-wide text-gray-400 uppercase">Financial Summary</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  ✓ On track
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[11px] tracking-wide text-gray-400 uppercase">Total Invested</p>
                  <p className="text-2xl font-bold text-ink mt-1">{fmtINR(invested)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[11px] tracking-wide text-gray-400 uppercase">Wealth Gained</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">+{fmtINR(returns)}</p>
                </div>
              </div>

              <div className="bg-brand rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] tracking-wide text-white/70 uppercase">Maturity Value</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{fmtINR(futureValue)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center text-white text-xl">↗</div>
              </div>

              <button
                onClick={() => setShowBreakdown(s => !s)}
                className="w-full flex items-center justify-between mt-4 text-sm font-semibold text-ink py-2"
              >
                Breakdown
                <svg className={`h-4 w-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {showBreakdown && (
                <div className="text-sm text-gray-600 space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex justify-between"><span>Monthly SIP</span><span className="font-semibold text-ink">{fmtINR(monthly)}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="font-semibold text-ink">{years * 12} months</span></div>
                  <div className="flex justify-between"><span>Expected return (p.a.)</span><span className="font-semibold text-ink">{rate}%</span></div>
                  <div className="flex justify-between"><span>Total invested</span><span className="font-semibold text-ink">{fmtINR(invested)}</span></div>
                  <div className="flex justify-between"><span>Wealth gained</span><span className="font-semibold text-emerald-600">+{fmtINR(returns)}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calculation logic — 3 cards, mirrors the reference layout */}
        <div className="mt-8 border border-gray-200 rounded-2xl p-6">
          <h3 className="text-xs font-bold tracking-wide text-gray-400 uppercase mb-5">Calculation Logic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-6 w-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="font-semibold text-ink text-sm">Contributions</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500"><span>Monthly</span><span className="text-ink font-medium">{fmtINR(monthly)}</span></div>
              <div className="flex justify-between text-sm text-gray-500 mt-1"><span>Months</span><span className="text-ink font-medium">{years * 12}</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-6 w-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="font-semibold text-ink text-sm">Growth</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500"><span>Return (p.a.)</span><span className="text-ink font-medium">{rate}%</span></div>
              <div className="flex justify-between text-sm text-gray-500 mt-1"><span>Compounding</span><span className="text-ink font-medium">Monthly</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-6 w-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="font-semibold text-ink text-sm">Net Result</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500"><span>Invested</span><span className="text-ink font-medium">{fmtINR(invested)}</span></div>
              <div className="flex justify-between text-sm text-gray-500 mt-1"><span>Maturity value</span><span className="text-emerald-600 font-medium">{fmtINR(futureValue)}</span></div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * Assumes annual compounding of returns and consistent monthly contributions for the full duration.
          </p>
        </div>

        {/* Growth chart */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-6">
          <h2 className="font-bold text-ink mb-4">Projected Growth Year-on-Year</h2>
          <GrowthChart monthly={monthly} rate={rate} years={years} />
        </div>

        {/* CTA banner */}
        <div className="mt-8 bg-brand-light rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-ink">Ready to start investing?</h3>
          <p className="text-gray-600 mt-1 mb-5">Open a free Primebulls account and start your SIP in minutes.</p>
          <Link to="/login" className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition">
            Trade Now
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13L13 7M13 7H8M13 7V12" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          This calculator provides indicative estimates only, assuming a constant rate of return
          and monthly compounding. Actual mutual fund and market returns vary and are not guaranteed.
        </p>
      </div>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
