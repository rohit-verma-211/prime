import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import useWatchlistQuotes from "../hooks/useWatchlistQuotes";
import { STOCKS, SECTORS } from "../data/stocksList";

const TABS = ["All Stocks", "Top Gainers", "Top Losers", "Sectors"];

function fmtINR(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtChange(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return (n >= 0 ? "+₹" : "-₹") + Math.abs(n).toFixed(2);
}
function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function StockCard({ stock, quote, loading, starred, onToggleStar }) {
  const up = (quote?.changePercent ?? 0) >= 0;
  return (
    <Link
      to={`/stocks/${stock.symbol}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-500">{stock.name}</p>
        </div>
        <button
          onClick={e => { e.preventDefault(); onToggleStar(stock.symbol); }}
          aria-label="Toggle watchlist"
          className={`text-lg leading-none ${starred ? "text-yellow-400" : "text-gray-300 hover:text-gray-400"}`}
        >
          ★
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          {loading && !quote ? (
            <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="text-xl font-extrabold text-gray-900">{fmtINR(quote?.price)}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">{stock.sector}</div>
        </div>
        {quote && (
          <div className={`text-right text-sm font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
            <div>{fmtPct(quote.changePercent)}</div>
            <div className="text-xs font-medium">{fmtChange(quote.change)}</div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Stocks() {
  const [searchParams] = useSearchParams();
  const { quotes, loading, lastUpdated, hasError, refresh } = useWatchlistQuotes();
  const [tab, setTab] = useState("All Stocks");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_starred_stocks") || "[]"); } catch { return []; }
  });

  const toggleStar = (symbol) => {
    setStarred(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try { localStorage.setItem("pb_starred_stocks", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = STOCKS;
    if (sectorFilter !== "All") list = list.filter(s => s.sector === sectorFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (tab === "Top Gainers") list = list.filter(s => (quotes[s.symbol]?.changePercent ?? -1) > 0);
    if (tab === "Top Losers") list = list.filter(s => (quotes[s.symbol]?.changePercent ?? 1) < 0);
    return list;
  }, [sectorFilter, search, tab, quotes]);

  const sectorSummary = useMemo(() => {
    return SECTORS.map(sector => {
      const stocksInSector = STOCKS.filter(s => s.sector === sector);
      const changes = stocksInSector.map(s => quotes[s.symbol]?.changePercent).filter(v => v !== undefined);
      const avgChange = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : null;
      return { sector, count: stocksInSector.length, avgChange };
    });
  }, [quotes]);

  const anyLoading = Object.values(loading).some(Boolean);
  const newestUpdate = Math.max(0, ...Object.values(lastUpdated));

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Stocks</h1>
            <p className="text-gray-500 mt-1">Explore top Indian stocks — live prices via Yahoo Finance</p>
          </div>
          <div className="text-right">
            <button
              onClick={refresh}
              disabled={anyLoading}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
            >
              {anyLoading ? "Refreshing…" : "Refresh"}
            </button>
            {newestUpdate > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Updated {new Date(newestUpdate).toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {hasError && (
          <div className="mb-6 bg-brand-light border border-emerald-200 text-brand-dark text-sm rounded-lg px-4 py-3">
            Yahoo Finance is briefly unreachable for some stocks — showing the most recent cached prices where available.
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks by name or symbol..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                tab === t
                  ? "bg-white border-ink text-ink"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sector chips (only relevant outside the Sectors tab) */}
        {tab !== "Sectors" && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSectorFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                sectorFilter === "All" ? "bg-ink text-white" : "bg-white border border-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  sectorFilter === s ? "bg-ink text-white" : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {tab === "Sectors" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectorSummary.map(s => (
              <button
                key={s.sector}
                onClick={() => { setTab("All Stocks"); setSectorFilter(s.sector); }}
                className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
              >
                <h3 className="font-bold text-gray-900">{s.sector}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.count} stocks</p>
                <p className={`mt-3 font-semibold ${s.avgChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {fmtPct(s.avgChange)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(stock => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                quote={quotes[stock.symbol]}
                loading={loading[stock.symbol]}
                starred={starred.includes(stock.symbol)}
                onToggleStar={toggleStar}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-12">No stocks match your filters.</p>
            )}
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
