import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import { findStock } from "../data/stocksList";
import { fetchQuote, fetchDailySeries, sliceRange, fiftyTwoWeek } from "../lib/yahooFinance";

const RANGES = ["1W", "1M", "3M", "1Y", "ALL"];

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
function fmtVol(n) {
  if (!n) return "—";
  if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + "L";
  return n.toLocaleString("en-IN");
}

// ── Buy / Sell modal ─────────────────────────────────────────
function TradeModal({ mode, stock, price, holding, cash, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const isBuy = mode === "buy";
  const total = qty * price;
  const maxSellQty = holding?.qty || 0;

  const handleConfirm = () => {
    setError("");
    if (!qty || qty <= 0) { setError("Enter a valid quantity."); return; }
    if (isBuy && total > cash) { setError("Insufficient virtual cash balance."); return; }
    if (!isBuy && qty > maxSellQty) { setError(`You only hold ${maxSellQty} share(s).`); return; }
    onConfirm(qty);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {isBuy ? "Buy" : "Sell"} {stock.symbol}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Market Price</span>
          <span className="font-semibold text-gray-900">₹{price?.toFixed(2)}</span>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-1">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 text-lg"
          >−</button>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-center outline-none py-2.5"
          />
          <button
            onClick={() => setQty(q => q + 1)}
            className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 text-lg"
          >+</button>
        </div>
        {!isBuy && <p className="text-xs text-gray-400 mb-3">You hold {maxSellQty} share(s)</p>}
        {isBuy && <p className="text-xs text-gray-400 mb-3">Available cash: ₹{cash.toLocaleString("en-IN")}</p>}

        <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm text-gray-600">Estimated {isBuy ? "cost" : "proceeds"}</span>
          <span className="font-bold text-gray-900">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleConfirm}
          className={`w-full py-3 rounded-xl font-bold text-white transition ${
            isBuy ? "bg-brand hover:bg-brand-dark" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Confirm {isBuy ? "Buy" : "Sell"} (Demo — no real money)
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-3">
          This is simulated paper trading for demo purposes only. No real trade is placed.
        </p>
      </div>
    </div>
  );
}

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { holdings, cash, buy, sell } = usePortfolio();
  const stock = findStock(symbol || "");
  const [tradeMode, setTradeMode] = useState(null); // "buy" | "sell" | null
  const [toast, setToast] = useState(null);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [quote, setQuote] = useState(null);
  const [dailySeries, setDailySeries] = useState(null);
  const [range, setRange] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(null); // rate-limit / no-key notice
  const [tabView, setTabView] = useState("Overview");
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_starred_stocks") || "[]").includes(symbol); } catch { return false; }
  });

  // ── Load quote + daily history ──────────────────────────────
  useEffect(() => {
    if (!stock) return;
    let cancelled = false;
    setLoading(true);
    setNote(null);

    (async () => {
      const [q, d] = await Promise.all([
        fetchQuote(stock.yahooSymbol, { priority: true }),
        fetchDailySeries(stock.yahooSymbol, { priority: true }),
      ]);
      if (cancelled) return;
      setQuote(q.data);
      setDailySeries(d.data);
      if ((q.source === "error" || d.source === "error")) {
        setNote(
          (q.data || d.data)
            ? "Yahoo Finance is briefly unreachable — showing the most recent cached data."
            : "Yahoo Finance is briefly unreachable and there's no cached data yet for this stock. Try refreshing in a moment."
        );
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [stock]);

  // ── Chart setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { textColor: "#334155", background: { type: ColorType.Solid, color: "#ffffff" } },
      grid: { vertLines: { color: "#f1f5f9" }, horzLines: { color: "#f1f5f9" } },
      height: 400,
      timeScale: { borderColor: "#e2e8f0" },
      rightPriceScale: { borderColor: "#e2e8f0" },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00d09c",
      downColor: "#ef4444",
      borderUpColor: "#00d09c",
      borderDownColor: "#ef4444",
      wickUpColor: "#00d09c",
      wickDownColor: "#ef4444",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // ── Push data into the chart whenever it changes ─────────────
  useEffect(() => {
    if (!seriesRef.current || !dailySeries) return;
    const sliced = range === "ALL" ? dailySeries : sliceRange(dailySeries, range);
    seriesRef.current.setData(sliced.map(d => ({
      time: d.time, open: d.open, high: d.high, low: d.low, close: d.close,
    })));
    chartRef.current?.timeScale().fitContent();
  }, [dailySeries, range]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleStar = useCallback(() => {
    setStarred(prev => {
      const next = !prev;
      try {
        const list = JSON.parse(localStorage.getItem("pb_starred_stocks") || "[]");
        const updated = next ? [...new Set([...list, symbol])] : list.filter(s => s !== symbol);
        localStorage.setItem("pb_starred_stocks", JSON.stringify(updated));
      } catch {}
      return next;
    });
  }, [symbol]);

  if (!stock) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Stock not found</h1>
          <p className="text-gray-500 mt-2">We don't track "{symbol}" yet.</p>
          <Link to="/stocks" className="inline-block mt-6 text-brand-dark font-semibold hover:underline">
            ← Back to Stocks
          </Link>
        </div>
        <Footer />
        <WhatsAppFAB />
      </div>
    );
  }

  const up = (quote?.changePercent ?? 0) >= 0;
  const week52 = fiftyTwoWeek(dailySeries);
  const holding = holdings[stock.symbol];

  const openTrade = (mode) => {
    if (!user) { navigate("/login"); return; }
    setTradeMode(mode);
  };

  const handleConfirmTrade = (qty) => {
    const result = tradeMode === "buy"
      ? buy(stock.symbol, stock.name, qty, quote?.price || 0)
      : sell(stock.symbol, qty, quote?.price || 0);
    setToast(result);
    if (result.ok) setTradeMode(null);
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <button
          onClick={() => navigate("/stocks")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
        >
          ← Back to Stocks
        </button>

        {note && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
            {note}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{stock.symbol}</h1>
              <p className="text-gray-500">{stock.name}</p>
            </div>
            <button
              onClick={toggleStar}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                starred ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "border-ink text-ink hover:bg-gray-50"
              }`}
            >
              {starred ? "★ In Watchlist" : "☆ Add to Watchlist"}
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-x-10 gap-y-4 mt-6">
            <div>
              <p className="text-xs text-gray-400">Current Price</p>
              {loading && !quote ? (
                <div className="h-9 w-32 bg-gray-100 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-3xl font-extrabold text-gray-900">{fmtINR(quote?.price)}</p>
                  <p className={`text-sm font-semibold mt-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
                    {up ? "▲" : "▼"} {fmtChange(quote?.change)} ({fmtPct(quote?.changePercent)})
                  </p>
                </>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Open</p>
              <p className="font-semibold text-gray-800">{fmtINR(quote?.open)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">High</p>
              <p className="font-semibold text-emerald-600">{fmtINR(quote?.high)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Low</p>
              <p className="font-semibold text-red-500">{fmtINR(quote?.low)}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-gray-900">Price Chart</h2>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    range === r ? "bg-ink text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {!dailySeries && !loading ? (
            <p className="text-gray-400 text-sm py-16 text-center">No chart data available yet.</p>
          ) : (
            <div ref={chartContainerRef} />
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="flex border-b border-gray-100">
            {["Overview", "Fundamentals", "Financials"].map(t => (
              <button
                key={t}
                onClick={() => setTabView(t)}
                className={`px-5 py-3 text-sm font-semibold transition ${
                  tabView === t ? "text-gray-900 border-b-2 border-brand" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tabView === "Overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Market Data</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Prev. Close</dt><dd className="font-semibold">{fmtINR(quote?.prevClose)}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Volume</dt><dd className="font-semibold">{fmtVol(quote?.volume)}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">52W High</dt><dd className="font-semibold text-emerald-600">{fmtINR(week52.high)}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">52W Low</dt><dd className="font-semibold text-red-500">{fmtINR(week52.low)}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">About</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Sector</dt><dd className="font-semibold">{stock.sector}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Symbol</dt><dd className="font-semibold">{stock.symbol}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Exchange</dt><dd className="font-semibold">NSE</dd></div>
                    {quote?.tradingDay && (
                      <div className="flex justify-between"><dt className="text-gray-500">Last Trading Day</dt><dd className="font-semibold">{quote.tradingDay}</dd></div>
                    )}
                  </dl>
                </div>
              </div>
            )}
            {(tabView === "Fundamentals" || tabView === "Financials") && (
              <p className="text-gray-400 text-sm text-center py-8">
                {tabView} data isn't available for this stock yet.
                Talk to an advisor for a detailed report.
              </p>
            )}
          </div>
        </div>

        {/* Holding summary */}
        {holding && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Your Holding</p>
              <p className="font-bold text-gray-900">{holding.qty} shares · avg ₹{holding.avgPrice.toFixed(2)}</p>
            </div>
            {quote && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Current Value</p>
                <p className={`font-bold ${quote.price >= holding.avgPrice ? "text-emerald-600" : "text-red-500"}`}>
                  ₹{(holding.qty * quote.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => openTrade("buy")}
            disabled={!quote}
            className="flex-1 text-center bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            Buy
          </button>
          {holding && (
            <button
              onClick={() => openTrade("sell")}
              disabled={!quote}
              className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              Sell
            </button>
          )}
          <button
            onClick={toggleStar}
            className="flex-1 text-center border border-ink text-ink hover:bg-gray-50 font-bold py-3 rounded-xl transition"
          >
            {starred ? "In Watchlist" : "Add to Watchlist"}
          </button>
        </div>
        {!user && (
          <p className="text-sm text-gray-400 mt-3 text-center">
            <Link to="/login" className="text-brand-dark font-semibold hover:underline">Sign in</Link> to buy or sell with your demo portfolio.
          </p>
        )}
      </div>

      {tradeMode && (
        <TradeModal
          mode={tradeMode}
          stock={stock}
          price={quote?.price || 0}
          holding={holding}
          cash={cash}
          onClose={() => setTradeMode(null)}
          onConfirm={handleConfirmTrade}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}
             onAnimationEnd={() => {}}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-3 opacity-80 hover:opacity-100">×</button>
        </div>
      )}

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
