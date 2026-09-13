import { useState, useEffect, useCallback, useRef } from "react";
import { fetchQuote } from "../lib/yahooFinance";
import { STOCKS } from "../data/stocksList";

// Returns { quotes, loading, lastUpdated, refresh, hasError }
// quotes: { [symbol]: { price, change, changePercent, open, high, low, volume, ... } | null }
//
// All symbols are dispatched to fetchQuote() at once — the small
// concurrency-limited queue inside yahooFinance.js is what actually
// throttles the network calls, so this hook doesn't need to wait for
// one stock before starting the next.
export default function useWatchlistQuotes() {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(STOCKS.map(s => [s.symbol, true]))
  );
  const [lastUpdated, setLastUpdated] = useState({});
  const [hasError, setHasError] = useState(false);
  const runId = useRef(0);

  const loadAll = useCallback(() => {
    const myRun = ++runId.current;
    setLoading(Object.fromEntries(STOCKS.map(s => [s.symbol, true])));
    setHasError(false);

    STOCKS.forEach(stock => {
      fetchQuote(stock.yahooSymbol).then(result => {
        if (runId.current !== myRun) return; // a newer refresh superseded this one
        if (result.data) {
          setQuotes(prev => ({ ...prev, [stock.symbol]: result.data }));
          setLastUpdated(prev => ({ ...prev, [stock.symbol]: Date.now() }));
        }
        if (result.source === "error" && !result.data) setHasError(true);
        setLoading(prev => ({ ...prev, [stock.symbol]: false }));
      });
    });
  }, []);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    quotes,
    loading,
    lastUpdated,
    hasError,
    refresh: loadAll,
  };
}
