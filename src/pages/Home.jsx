import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { useAuth } from "../context/AuthContext";

// ── TradingView Ticker — sits directly under the fixed navbar ──
function TradingViewTicker() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BSE:SENSEX",      title: "" },
        { proName: "VANTAGE:SP500",   title: "" },
        { proName: "BITSTAMP:BTCUSD", title: "" },
        { proName: "TVC:GOLD",        title: "" },
        { proName: "TVC:SILVER",      title: "" },
        { proName: "CFI:WTI",         title: "" },
        { proName: "IG:NASDAQ",       title: "" },
        { proName: "FX_IDC:USDINR",   title: "" },
      ],
      colorTheme: "light",
      locale: "en",
      isTransparent: false,
      showSymbolLogo: true,
      displayMode: "adaptive",
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tradingview-widget-container border-b border-gray-100">
      <div ref={ref} className="tradingview-widget-container__widget" />
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────
const HERO_CARDS = [
  {
    heading: "Trending Stocks",
    align: "left",
    items: [
      { name: "HDFC Bank", meta: "Live price • NSE", icon: "🏦", color: "bg-blue-100" },
      { name: "Reliance Industries", meta: "Live price • NSE", icon: "🛢️", color: "bg-emerald-100" },
    ],
  },
  {
    heading: "Top Gainers",
    align: "center",
    featured: true,
    items: [
      { name: "Tata Motors", meta: "Momentum pick", icon: "🚗", color: "bg-amber-100" },
      { name: "Infosys", meta: "Momentum pick", icon: "💻", color: "bg-indigo-100" },
    ],
  },
  {
    heading: "IPO Watch",
    align: "right",
    items: [
      { name: "Next Listing", meta: "Opens soon", icon: "🆕", color: "bg-rose-100" },
      { name: "Recently Listed", meta: "Track performance", icon: "📊", color: "bg-purple-100" },
    ],
  },
];

function Hero({ onPrimary }) {
  return (
    <section className="bg-surface-soft pt-16 pb-14">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
          <span className="bg-brand-light text-brand rounded-full px-2.5 py-1 font-semibold">New</span>
          Live prices, research &amp; SIP tools in one account
        </div>

        <h1 className="mt-6 text-8xl md:text-7xl font-extrabold tracking-tight text-ink">
          Trade today.
          <br />
          <span className="italic font-semibold text-gray-400">Grow </span>
          in the <span className="text-brand">future.</span>
        </h1>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/stocks"
            className="px-9 py-4 rounded-full font-semibold text-lg text-brand border-2 border-brand hover:bg-brand-light transition flex items-center gap-2"
          >
            Explore Markets
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13L13 7M13 7H8M13 7V12" />
            </svg>
          </Link>
          <button
            onClick={onPrimary}
            className="px-9 py-4 rounded-full font-semibold text-lg text-white bg-brand hover:bg-brand-dark transition shadow-sm flex items-center gap-2"
          >
            Start Trading
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </button>
        </div>
        <p className="mt-5 text-base text-gray-500">
          No demat account hassle. Zero platform fee. Backed by real-time research.
        </p>
      </div>

      {/* Card row echoing Featured Products / Best Sellers / Best Deals — the middle
          column sits in a raised frame with a floating pill label, side columns are
          plain left/right-aligned headings, exactly like the reference layout */}
      <div className="max-w-5xl mx-auto px-4 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        {HERO_CARDS.map(col => {
          const headingAlign =
            col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right";

          const cardList = (
            <div className="space-y-4">
              {col.items.map(item => (
                <Link
                  key={item.name}
                  to="/stocks"
                  className="flex items-center justify-between gap-4 bg-brand-100 hover:bg-brand-200/70 transition rounded-2xl px-5 py-4"
                >
                  <span className="text-left">
                    <span className="block font-bold text-ink text-base leading-snug">{item.name}</span>
                    <span className="block text-sm text-gray-500 mt-1">{item.meta}</span>
                  </span>
                  <span
                    className={`h-20 w-20 rounded-full ${item.color} flex items-center justify-center text-4xl flex-shrink-0 shadow-sm ring-4 ring-white`}
                  >
                    {item.icon}
                  </span>
                </Link>
              ))}
            </div>
          );

          if (col.featured) {
            return (
              <div key={col.heading} className="relative pt-6">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-5 py-2 text-base font-semibold text-ink shadow-sm z-10 whitespace-nowrap">
                  {col.heading}
                </span>
                <div className="bg-gray-100/80 rounded-3xl pt-12 pb-6 px-4 sm:-mt-4">
                  {cardList}
                </div>
              </div>
            );
          }

          return (
            <div key={col.heading} className="pt-6 sm:pt-9">
              <p className={`text-base font-semibold text-gray-500 mb-4 ${headingAlign}`}>{col.heading}</p>
              {cardList}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── How it Works ─────────────────────────────────────────────
const STEPS = [
  { n: "01.", title: "Create your free account", desc: "Sign up with your email in under a minute — no paperwork to mail in." },
  { n: "02.", title: "Complete instant KYC", desc: "Verify your identity digitally and get approved to trade the same day." },
  { n: "03.", title: "Add funds securely", desc: "Transfer money via UPI or net banking straight into your trading account." },
  { n: "04.", title: "Start trading & investing", desc: "Buy stocks, track your portfolio, and run SIPs — all from one dashboard." },
];

function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <span className="inline-block border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">How it Works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink">
            Start trading <span className="italic font-light text-gray-400">in</span> 4 easy steps
          </h2>
        </div>
        <Link to="/login" className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-brand text-white rounded-full text-base font-semibold hover:bg-brand-dark transition self-start">
          Get Started
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 13L13 7M13 7H8M13 7V12" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`p-9 ${i % 2 === 0 ? "md:border-r" : ""} ${i < 2 ? "border-b" : ""} border-gray-200`}
          >
            <p className="text-4xl font-extrabold text-brand mb-3">{s.n}</p>
            <h3 className="font-semibold text-ink text-xl mb-2">{s.title}</h3>
            <p className="text-gray-500 text-base">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pick Your Investments ─────────────────────────────────────
const INVESTMENTS = [
  { label: "Stocks", icon: "📈", desc: "Buy and sell shares in companies to grow wealth.", href: "/stocks" },
  { label: "IPO", icon: "🏢", desc: "Participate in Initial Public Offerings and invest early.", href: "#" },
  { label: "F&O", icon: "⚖️", desc: "Trade in futures and options to manage risk or speculate.", href: "#" },
  { label: "Mutual Funds", icon: "🧺", desc: "Invest in diversified portfolios managed by professionals.", href: "#" },
  { label: "US Stocks", icon: "🌎", desc: "Invest in top US companies from India.", href: "#" },
  { label: "Bonds", icon: "📜", desc: "Fixed income securities for stable returns.", href: "#" },
];

function InvestmentsSection() {
  return (
    <section id="markets" className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <span className="inline-block border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">Investment Options</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink max-w-xl">
            Pick your <span className="italic font-light text-gray-400">preferred</span> investments
          </h2>
        </div>
        <Link to="/stocks" className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 border-2 border-brand text-brand rounded-full text-base font-semibold hover:bg-brand-light transition self-start">
          Explore Markets
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {INVESTMENTS.map(inv => {
          const cardClass =
            "border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition block";
          const cardContent = (
            <>
              <div className="h-14 w-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl mb-4">
                {inv.icon}
              </div>
              <h3 className="font-bold text-ink text-lg mb-2">{inv.label}</h3>
              <p className="text-gray-500 text-base">{inv.desc}</p>
            </>
          );

          // Internal routes (e.g. "/stocks") use React Router's Link for
          // client-side navigation; anything else (still "#" for now)
          // falls back to a plain anchor.
          return inv.href.startsWith("/") ? (
            <Link key={inv.label} to={inv.href} className={cardClass}>
              {cardContent}
            </Link>
          ) : (
            <a key={inv.label} href={inv.href} className={cardClass}>
              {cardContent}
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ── Best Insurance ───────────────────────────────────────────
const INSURANCE = [
  { icon: "❤️", sub: "Lowest Price Guarantee", label: "Term Life Insurance", badge: "Covers Covid-19" },
  { icon: "🏥", sub: "FREE Home Visit", label: "Health Insurance", badge: "Covers Covid-19" },
  { icon: "📈", sub: "In-Built Life Cover", label: "Investment Plans", badge: "Save Tax" },
  { icon: "🚗", sub: "Upto 91% Discount", label: "Car Insurance", badge: "Instant Policy" },
  { icon: "🏍️", sub: "Upto 85% Discount", label: "2 Wheeler Insurance", badge: "Instant Policy" },
  { icon: "📄", sub: "Upto 85% Discount", label: "Term Plans with Return of Premium", badge: null },
  { icon: "🎯", sub: "Upto 85% Discount", label: "Guaranteed Return Plans", badge: null },
  { icon: "👩", sub: "Upto 20% Cheaper", label: "Term Insurance (Women)", badge: null },
];

function InsuranceSection() {
  return (
    <section className="bg-surface-soft py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block border border-gray-200 bg-white rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">Insurance</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink">
            Protection <span className="italic font-light text-gray-400">for</span> every stage of life
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {INSURANCE.map(c => (
            <div
              key={c.label}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-sm transition flex flex-col items-center text-center"
            >
              <div className="h-14 w-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl mb-4">
                {c.icon}
              </div>
              <p className="text-sm font-semibold text-brand-dark mb-2">{c.sub}</p>
              <h3 className="font-bold text-ink text-base leading-snug">{c.label}</h3>
              {c.badge && (
                <span className="mt-3 bg-brand-light text-brand text-xs font-semibold rounded-full px-3 py-1">
                  {c.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Primebulls ───────────────────────────────────────────
const WHY_CARDS = [
  { icon: "🤝", title: "Transparency & Trust", desc: "Clear, open communication in every investment and every service — the foundation of a lasting relationship." },
  { icon: "🎯", title: "Right Investments", desc: "Expert guidance from experienced relationship managers, at every step of your financial journey." },
  { icon: "🧩", title: "Flexible Investment Approach", desc: "Personalized solutions built around your goals, preferences, and risk appetite — every investor is unique." },
  { icon: "💻", title: "Technology", desc: "Algo-driven tools for a secure, efficient experience, keeping your assets protected and your data safe." },
];

function AboutSection() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <span className="inline-block border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">Our Edge</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink max-w-xl">
            Why <span className="text-brand">Primebulls?</span>
          </h2>
        </div>
        <p className="text-gray-500 text-base max-w-sm">
          A trusted name in Indian financial services, offering everything you need for wealth creation under one roof.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {WHY_CARDS.map(card => (
          <div key={card.title} className="border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition">
            <div className="h-14 w-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl mb-4">
              {card.icon}
            </div>
            <h3 className="font-bold text-ink text-lg mb-2">{card.title}</h3>
            <p className="text-gray-500 text-base">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Trading Platform ─────────────────────────────────────────
function TradingSection() {
  return (
    <section id="trading" className="bg-surface-soft py-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="bg-white rounded-3xl border border-gray-100 h-80 overflow-hidden order-first lg:order-last">
          <img
            src="/mid.png"
            alt="Trading platform dashboard with charts and market data"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="inline-block border border-gray-200 bg-white rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">Trading Platform</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink mb-4">
            Execute with <span className="text-brand">precision and speed</span>
          </h2>
          <p className="text-gray-600 mb-6 max-w-md text-lg">
            A professional-grade platform built for active traders — sub-millisecond order routing,
            institutional-quality data, and a workspace that adapts to your strategy.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Level II market depth and streaming news feeds",
              "Smart order routing with algorithmic execution",
              "100+ technical indicators and custom scripting",
              "Multi-monitor layouts synced across devices",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-gray-600">
                <span className="text-brand font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="px-6 py-3.5 bg-brand text-white rounded-full text-base font-semibold hover:bg-brand-dark transition">
            Launch Platform
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Key Benefits ─────────────────────────────────────────────
const BENEFITS = [
  { icon: "⚡", title: "Instant account opening", desc: "Get onboarded digitally in minutes — no branch visits, no waiting." },
  { icon: "📈", title: "Real-time market data", desc: "Live prices and charts across NSE & BSE to help you act fast." },
  { icon: "💸", title: "Zero platform fee", desc: "Trade delivery equity without paying a recurring platform charge." },
  { icon: "🛡️", title: "Secure & regulated", desc: "SEBI-registered, with your holdings safely tracked in your demat." },
  { icon: "🧮", title: "Built-in SIP tools", desc: "Plan and project your mutual fund SIPs with our calculator." },
  { icon: "🎧", title: "Dedicated support", desc: "Reach a real person over chat, call, or WhatsApp when you need help." },
];

function KeyBenefits() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-ink max-w-xl">
          The smartest way <span className="italic font-light text-gray-400">to</span> trade &amp; grow wealth
        </h2>
        <Link to="/stocks" className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 border-2 border-brand text-brand rounded-full text-base font-semibold hover:bg-brand-light transition self-start">
          Explore Markets
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {BENEFITS.map(b => (
          <div key={b.title} className="border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition">
            <div className="h-14 w-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl mb-4">{b.icon}</div>
            <h3 className="font-bold text-ink text-lg mb-2">{b.title}</h3>
            <p className="text-gray-500 text-base">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Journey Banner ──────────────────────────────────────────
function JourneyBanner({ onGetStarted }) {
  return (
    <section className="bg-surface-soft py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block border border-gray-200 bg-white rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">
            Six steps, one clear path
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink">
            See where <span className="text-brand">Primebulls</span> can take you
          </h2>
        </div>

        {/* image card, framed to match the rest of the page's card style */}
        <div className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <img
            src="/home.png"
            alt="Six steps from financial struggles to financial freedom with Primebulls"
            className="w-full h-auto block"
          />
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={onGetStarted}
            className="px-9 py-4 rounded-full font-semibold text-lg text-white bg-brand hover:bg-brand-dark transition shadow-sm"
          >
            Start your journey today
          </button>
        </div>
      </div>
    </section>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────
const FAQS = [
  { q: "Is Primebulls SEBI-registered?", a: "Yes — Primebulls is a SEBI-registered stockbroker and depository participant, and a member of NSE, BSE and MCX." },
  { q: "How long does account opening take?", a: "Most accounts are approved the same day once your KYC documents are verified digitally." },
  { q: "Are there any hidden charges?", a: "No. Brokerage and any applicable statutory charges are shown upfront before you place a trade." },
  { q: "Can I run a SIP through Primebulls?", a: "Yes — use the SIP Calculator to plan your investment, then set up your SIP from your dashboard." },
  { q: "Is my money and data safe?", a: "Your holdings sit in your own demat account, and all data is encrypted in line with SEBI's guidelines." },
];

function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faqs" className="max-w-3xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-extrabold text-center text-ink mb-10">Frequently asked questions</h2>
      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`border border-gray-200 rounded-xl px-6 ${isOpen ? "accordion-open" : ""}`}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between py-5 text-left font-semibold text-lg text-ink"
              >
                {f.q}
                <svg className="h-6 w-6 text-gray-400 accordion-chevron flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {isOpen && <p className="text-gray-600 text-base pb-5 -mt-1">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Home Page ────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrimary = () => navigate(user ? "/stocks" : "/login");

  return (
    <div className="bg-white font-sans">
      <Navbar />
      <TradingViewTicker />
      <Hero onPrimary={handlePrimary} />
      <HowItWorks />
      <InvestmentsSection />
      <InsuranceSection />
      <AboutSection />
      <TradingSection />
      <KeyBenefits />
      <JourneyBanner onGetStarted={handlePrimary} />
      <FAQSection />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}