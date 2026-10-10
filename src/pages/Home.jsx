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
  { label: "Stocks",       img: "/monitor.png",       desc: "Buy and sell shares in companies to grow wealth.",          href: "/stocks" },
  { label: "IPO",          img: "/ipo.png",          desc: "Participate in Initial Public Offerings and invest early.", href: "#" },
  { label: "F&O",          img: "/paisa.png",          desc: "Trade in futures and options to manage risk or speculate.", href: "#" },
  { label: "Mutual Funds", img: "/groeth.png", desc: "Invest in diversified portfolios managed by professionals.", href: "#" },
  { label: "US Stocks",    img: "/us.png",    desc: "Invest in top US companies from India.",                    href: "#" },
  { label: "Bonds",        img: "/bond.png",        desc: "Fixed income securities for stable returns.",               href: "#" },
];

function InvestmentsSection() {
  return (
    <section id="markets" className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <span className="inline-block border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-4">
            Investment Options
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink max-w-xl">
            Pick your <span className="italic font-light text-gray-400">preferred</span> investments
          </h2>
        </div>
        <Link
          to="/stocks"
          className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 border-2 border-brand text-brand rounded-full text-base font-semibold hover:bg-brand-light transition self-start"
        >
          Explore Markets
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {INVESTMENTS.map((inv) => {
          const cardClass =
            "border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition block";
          const cardContent = (
            <>
              {/* overflow-hidden clips the image to the rounded box;
                  object-cover makes it fill the whole box */}
              <div className="h-20 w-20 rounded-xl bg-white overflow-hidden mb-4">
                <img
                  src={inv.img}
                  alt={inv.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-bold text-ink text-lg mb-2">{inv.label}</h3>
              <p className="text-gray-500 text-base">{inv.desc}</p>
            </>
          );

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
  { img: "/family.png", icon: "❤️", sub: "Lowest Price Guarantee", label: "Term Life Insurance", badge: "Covers Covid-19" },
  { img: "/health-insurance.png", icon: "🏥", sub: "FREE Home Visit", label: "Health Insurance", badge: "Covers Covid-19" },
  { img: "/report.png", icon: "📈", sub: "In-Built Life Cover", label: "Investment Plans", badge: "Save Tax" },
  { img: "/insurance.png", icon: "🚗", sub: "Upto 91% Discount", label: "Car Insurance", badge: "Instant Policy" },
  { img: "/bike.png", icon: "🏍️", sub: "Upto 85% Discount", label: "2 Wheeler Insurance", badge: "Instant Policy" },
  { img: "gr (3).png", icon: "📄", sub: "Upto 85% Discount", label: "Term Plans with Return of Premium", badge: null },
  { img: "/gr (2).png", icon: "🎯", sub: "Upto 85% Discount", label: "Guaranteed Return Plans", badge: null },
  { img: "/women.png", icon: "👩", sub: "Upto 20% Cheaper", label: "Term Insurance (Women)", badge: null },
];

function InsuranceSection() {
  return (
    <section className="bg-surface-soft py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* ...header unchanged... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {INSURANCE.map(c => (
            <div
              key={c.label}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-sm transition flex flex-col items-center text-center"
            >
              {c.img ? (
                <div className="h-20 w-20 rounded-xl overflow-hidden mb-4">
                  <img
                    src={c.img}
                    alt={c.label}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-xl bg-brand-light flex items-center justify-center text-4xl mb-4">
                  {c.icon}
                </div>
              )}
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
  { icon: "/icon1.svg", title: "Transparency & Trust", desc: "Clear, open communication in every investment and every service — the foundation of a lasting relationship." },
  { icon: "/icon2.svg", title: "Right Investments", desc: "Expert guidance from experienced relationship managers, at every step of your financial journey." },
  { icon: "/icon3.svg", title: "Flexible Investment Approach", desc: "Personalized solutions built around your goals, preferences, and risk appetite — every investor is unique." },
  { icon: "/icon4.svg", title: "Technology", desc: "Algo-driven tools for a secure, efficient experience, keeping your assets protected and your data safe." },
];

function AboutSection() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 py-20">
      {/* ...header unchanged... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {WHY_CARDS.map(card => (
          <div key={card.title} className="border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition">
            <div className="h-14 w-14 rounded-xl overflow-hidden mb-4">
              <img
                src={card.icon}
                alt={card.title}
                className="h-full w-full object-cover"
              />
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
// ── Trading Platform ─────────────────────────────────────────

function TradingSection() {
  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: "$237.49", change: "+1.24%", up: true },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$142.87", change: "+2.86%", up: true },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$321.45", change: "-0.84%", up: false },
  ];

  const chart = [
    72, 65, 77, 57, 62, 45, 53, 40, 49, 32, 39,
    24, 34, 18, 28, 15, 24, 10, 18, 6, 14, 4,
  ];

  const points = chart
    .map((y, i) => `${(i / (chart.length - 1)) * 100},${y}`)
    .join(" ");

  return (
    <section
      id="trading"
      className="bg-surface-soft py-14 md:py-20 lg:py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-center">

        {/* Dashboard: compact and balanced */}
        <div className="order-first lg:order-last min-w-0 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[460px] xl:max-w-[490px]">

            <div className="absolute inset-5 rounded-full bg-purple-300/30 blur-3xl" />

            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_20px_60px_-25px_rgba(100,60,160,0.24)] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <path
                        d="M3 17l6-7 4 4 8-9M15 5h6v6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-ink text-sm">Market Overview</p>
                    <p className="text-[11px] text-gray-400">Trading workspace</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1.5 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  DEMO DATA
                </span>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3">
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500">Portfolio value</p>
                  <p className="text-lg font-extrabold text-ink mt-1.5">$84,250</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                    +4.82% this month
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500">Today's return</p>
                  <p className="text-lg font-extrabold text-emerald-600 mt-1.5">
                    +$1,284
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">+1.54% today</p>
                </div>

                <div className="col-span-2 sm:col-span-1 border border-gray-100 rounded-xl p-3 flex sm:block justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500">Active positions</p>
                    <p className="text-lg font-extrabold text-ink mt-1.5">12</p>
                  </div>
                  <div className="flex -space-x-1.5 sm:mt-2">
                    {["A", "N", "T", "M"].map((letter, i) => (
                      <span
                        key={letter}
                        className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white ${
                          [
                            "bg-violet-500",
                            "bg-blue-500",
                            "bg-rose-500",
                            "bg-emerald-500",
                          ][i]
                        }`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market chart */}
              <div className="mx-3 p-3 border border-gray-100 rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Market performance
                    </p>
                    <p className="text-xl font-extrabold text-ink mt-1">
                      $4,286.72
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                      +2.41% illustrative change
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {["1D", "1W", "1M"].map((period, i) => (
                      <span
                        key={period}
                        className={`px-2 py-1 rounded-md text-[9px] font-semibold ${
                          i === 1
                            ? "bg-brand text-white"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {period}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-28 sm:h-32 mt-4">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                    role="img"
                    aria-label="Illustrative stock market trend"
                  >
                    <defs>
                      <linearGradient
                        id="tradingAreaFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#813cf5" stopOpacity=".22" />
                        <stop offset="100%" stopColor="#813cf5" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {[20, 40, 60, 80].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        stroke="#eeeaf5"
                        strokeWidth=".5"
                        strokeDasharray="1.5 1.5"
                      />
                    ))}

                    <polygon
                      points={`0,100 ${points} 100,100`}
                      fill="url(#tradingAreaFill)"
                    />

                    <polyline
                      points={points}
                      fill="none"
                      stroke="#813cf5"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[9px] text-gray-400 mt-2">
                  <span>09:00</span>
                  <span>11:00</span>
                  <span>13:00</span>
                  <span>15:00</span>
                  <span>16:00</span>
                </div>
              </div>

              {/* Watchlist */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-ink text-xs">
                    Market watchlist
                  </h3>
                  <span className="text-[10px] text-brand font-semibold">
                    Market snapshot
                  </span>
                </div>

                <div className="space-y-0.5">
                  {stocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center rounded-lg px-2 py-2 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-50 text-brand flex items-center justify-center font-bold text-[10px]">
                          {stock.symbol[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink">
                            {stock.symbol}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {stock.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-ink">{stock.price}</p>
                        <p
                          className={`text-[10px] font-semibold ${
                            stock.up ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {stock.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Workspace preview
                </span>
                <span className="text-[9px] text-gray-400">
                  Illustrative data
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="hidden sm:flex absolute -right-3 top-[28%] items-center gap-2 rounded-xl border border-white bg-white/95 shadow-lg shadow-purple-900/10 p-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                ✓
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink">Smart execution</p>
                <p className="text-[9px] text-gray-400">Interface preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center lg:text-left">
          <span className="inline-block border border-gray-200 bg-white rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 mb-5">
            Trading Platform
          </span>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-[1.12] text-ink mb-5">
            Execute with{" "}
            <span className="text-brand">precision and speed</span>
          </h2>

          <p className="text-gray-600 mb-7 max-w-lg mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed">
            A professional-grade platform built for active traders — fast
            execution, insightful market analytics, and a workspace that
            adapts to your strategy.
          </p>

          <ul className="space-y-3.5 mb-8 text-left max-w-lg mx-auto lg:mx-0">
            {[
              "Level II market depth and streaming news feeds",
              "Smart order routing with algorithmic execution",
              "100+ technical indicators and custom scripting",
              "Multi-monitor layouts synced across devices",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-gray-600 text-sm sm:text-base"
              >
                <span className="text-brand font-bold text-lg leading-5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="w-full sm:w-auto px-7 py-3.5 bg-brand text-white rounded-full text-base font-semibold hover:bg-brand-dark transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Launch Platform
          </button>
        </div>
      </div>
    </section>
  );
}



// ── Key Benefits ─────────────────────────────────────────────
const BENEFITS = [
  { img: "/phone.png", title: "Instant account opening", desc: "Get onboarded digitally in minutes — no branch visits, no waiting." },
  { img: "/monitor.png",     title: "Real-time market data",   desc: "Live prices and charts across NSE & BSE to help you act fast." },
  { img: "/zerofees.png",        title: "Zero platform fee",       desc: "Trade delivery equity without paying a recurring platform charge." },
  { img: "/shield.png",          title: "Secure & regulated",      desc: "SEBI-registered, with your holdings safely tracked in your demat." },
  { img: "/sip.png",       title: "Built-in SIP tools",      desc: "Plan and project your mutual fund SIPs with our calculator." },
  { img: "/callgirl.png",         title: "Dedicated support",       desc: "Reach a real person over chat, call, or WhatsApp when you need help." },
];

function KeyBenefits() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-ink max-w-xl">
          The smartest way <span className="italic font-light text-gray-400">to</span> trade &amp; grow wealth
        </h2>
        <Link
          to="/stocks"
          className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 border-2 border-brand text-brand rounded-full text-base font-semibold hover:bg-brand-light transition self-start"
        >
          Explore Markets
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="border border-gray-200 rounded-2xl p-7 hover:border-brand hover:shadow-sm transition"
          >
            {/* Image container: overflow-hidden clips the image to the rounded box */}
            <div className="h-20 w-20 rounded-xl bg-white overflow-hidden mb-4">
              <img
                src={b.img}
                alt={b.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
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