import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import { findStock } from "../data/stocksList";
import { fetchQuote } from "../lib/yahooFinance";

function fmtINR(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export default function Portfolio() {
  const { user } = useAuth();
  const { cash, holdings, orders, resetPortfolio, startingCash } = usePortfolio();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  const symbols = useMemo(() => Object.keys(holdings), [holdings]);

  useEffect(() => {
    if (!user) return;
    if (symbols.length === 0) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      symbols.map(async (sym) => {
        const stock = findStock(sym);
        if (!stock) return [sym, null];
        const res = await fetchQuote(stock.yahooSymbol);
        return [sym, res.data];
      })
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(([sym, data]) => { map[sym] = data; });
      setQuotes(map);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [symbols, user]);

  if (!user) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-16 pb-16 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your portfolio</h1>
          <p className="text-gray-500 mb-6">Create a free demo account to get ₹1,00,000 virtual cash and start paper trading.</p>
          <Link to="/login" className="inline-block px-6 py-3 bg-brand text-white rounded-full font-bold hover:bg-brand-dark transition">
            Login / Sign up
          </Link>
        </div>
        <Footer />
        <WhatsAppFAB />
      </div>
    );
  }

  const holdingRows = symbols.map(sym => {
    const h = holdings[sym];
    const stock = findStock(sym);
    const q = quotes[sym];
    const currentPrice = q?.price ?? h.avgPrice;
    const invested = h.qty * h.avgPrice;
    const currentValue = h.qty * currentPrice;
    const pl = currentValue - invested;
    const plPct = invested ? (pl / invested) * 100 : 0;
    return { sym, name: stock?.name || h.name, qty: h.qty, avgPrice: h.avgPrice, currentPrice, invested, currentValue, pl, plPct };
  });

  const totalInvested = holdingRows.reduce((s, r) => s + r.invested, 0);
  const totalCurrent = holdingRows.reduce((s, r) => s + r.currentValue, 0);
  const totalPL = totalCurrent - totalInvested;
  const totalPLPct = totalInvested ? (totalPL / totalInvested) * 100 : 0;
  const netWorth = cash + totalCurrent;

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Portfolio</h1>
            <p className="text-gray-500 mt-1">Demo paper-trading account for {user.name}</p>
          </div>
          <button
            onClick={() => { if (confirm("Reset your demo portfolio back to ₹1,00,000 virtual cash? This clears all holdings and order history.")) resetPortfolio(); }}
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            Reset Portfolio
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Net Worth</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{fmtINR(netWorth)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Available Cash</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{fmtINR(cash)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Invested</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{fmtINR(totalInvested)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400">Total P&amp;L</p>
            <p className={`text-xl font-extrabold mt-1 ${totalPL >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {fmtINR(totalPL)} <span className="text-sm font-semibold">({fmtPct(totalPLPct)})</span>
            </p>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Holdings</h2>
          </div>
          {holdingRows.length === 0 ? (
            <div className="text-center py-14 px-6">
              <p className="text-gray-400 mb-4">You don't own any stocks yet.</p>
              <Link to="/stocks" className="inline-block px-5 py-2.5 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition text-sm">
                Explore Stocks
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 font-medium">Avg. Price</th>
                    <th className="px-6 py-3 font-medium">LTP</th>
                    <th className="px-6 py-3 font-medium">Current Value</th>
                    <th className="px-6 py-3 font-medium text-right">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingRows.map(r => (
                    <tr key={r.sym} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link to={`/stocks/${r.sym}`} className="font-semibold text-gray-900 hover:text-brand-dark transition">{r.sym}</Link>
                        <p className="text-xs text-gray-400">{r.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{r.qty}</td>
                      <td className="px-6 py-4 text-gray-700">{fmtINR(r.avgPrice)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {loading ? <span className="inline-block h-4 w-16 bg-gray-100 rounded animate-pulse" /> : fmtINR(r.currentPrice)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{fmtINR(r.currentValue)}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${r.pl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {fmtINR(r.pl)}<span className="block text-xs font-normal">{fmtPct(r.plPct)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order history */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Order History</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-3 text-gray-500">{new Date(o.ts).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${o.type === "BUY" ? "bg-brand-light text-brand-dark" : "bg-red-50 text-red-600"}`}>
                          {o.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">{o.symbol}</td>
                      <td className="px-6 py-3 text-gray-700">{o.qty}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{fmtINR(o.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          This is a simulated paper-trading portfolio starting with {fmtINR(startingCash)} virtual cash, for demo purposes only. No real money or real orders are involved.
        </p>
      </div>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
