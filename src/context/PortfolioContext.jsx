import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const PortfolioContext = createContext(null);
const STARTING_CASH = 100000; // ₹1,00,000 virtual cash for every new demo account

function storageKey(email) {
  return `pb_portfolio_${email || "guest"}`;
}

function loadPortfolio(email) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(email)));
    if (saved) return saved;
  } catch {
    /* ignore */
  }
  return { cash: STARTING_CASH, holdings: {}, orders: [] };
}

export function PortfolioProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email || null;
  const [portfolio, setPortfolio] = useState(() => loadPortfolio(email));

  // Reload portfolio whenever the logged-in user changes
  useEffect(() => {
    setPortfolio(loadPortfolio(email));
  }, [email]);

  useEffect(() => {
    if (email) localStorage.setItem(storageKey(email), JSON.stringify(portfolio));
  }, [portfolio, email]);

  const buy = useCallback((symbol, name, qty, price) => {
    if (!email) return { ok: false, message: "Please sign in to trade." };
    if (!qty || qty <= 0) return { ok: false, message: "Enter a valid quantity." };
    const cost = qty * price;
    let result = { ok: false, message: "" };
    setPortfolio(prev => {
      if (cost > prev.cash) {
        result = { ok: false, message: "Insufficient virtual cash balance." };
        return prev;
      }
      const existing = prev.holdings[symbol] || { qty: 0, avgPrice: 0, name };
      const newQty = existing.qty + qty;
      const newAvg = (existing.qty * existing.avgPrice + cost) / newQty;
      const order = { id: Date.now(), type: "BUY", symbol, name, qty, price, ts: new Date().toISOString() };
      result = { ok: true, message: `Bought ${qty} share(s) of ${symbol} at ₹${price.toFixed(2)}` };
      return {
        cash: prev.cash - cost,
        holdings: { ...prev.holdings, [symbol]: { qty: newQty, avgPrice: newAvg, name } },
        orders: [order, ...prev.orders].slice(0, 100),
      };
    });
    return result;
  }, [email]);

  const sell = useCallback((symbol, qty, price) => {
    if (!email) return { ok: false, message: "Please sign in to trade." };
    let result = { ok: false, message: "" };
    setPortfolio(prev => {
      const existing = prev.holdings[symbol];
      if (!existing || existing.qty < qty) {
        result = { ok: false, message: "You don't hold enough shares to sell." };
        return prev;
      }
      const proceeds = qty * price;
      const remainingQty = existing.qty - qty;
      const newHoldings = { ...prev.holdings };
      if (remainingQty <= 0) delete newHoldings[symbol];
      else newHoldings[symbol] = { ...existing, qty: remainingQty };
      const order = { id: Date.now(), type: "SELL", symbol, qty, price, ts: new Date().toISOString() };
      result = { ok: true, message: `Sold ${qty} share(s) of ${symbol} at ₹${price.toFixed(2)}` };
      return {
        cash: prev.cash + proceeds,
        holdings: newHoldings,
        orders: [order, ...prev.orders].slice(0, 100),
      };
    });
    return result;
  }, [email]);

  const resetPortfolio = useCallback(() => {
    setPortfolio({ cash: STARTING_CASH, holdings: {}, orders: [] });
  }, []);

  return (
    <PortfolioContext.Provider value={{ ...portfolio, buy, sell, resetPortfolio, startingCash: STARTING_CASH }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
