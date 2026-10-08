// ============================================================
// Yahoo Finance client for the Stocks section.
//
// Yahoo doesn't publish an official public API (no key, no signup),
// so this talks to the same JSON endpoint the yahoo finance website
// itself uses. Two practical constraints shape everything below:
//
//   1. CORS: browsers block direct calls to query1.finance.yahoo.com
//      from a page hosted on another domain.
//        - In dev (`npm run dev`) this goes through the Vite proxy
//          defined in vite.config.js — no CORS issue there.
//        - In production, this now goes through OUR OWN Vercel
//          serverless function at /api/yahoo-chart (see
//          api/yahoo-chart.js at the project root). That function
//          fetches Yahoo server-side, where CORS doesn't apply, so
//          there's no third-party proxy involved anymore and nothing
//          outside our own deployment that can go down or rate-limit
//          us. (Previously this used the free public proxy
//          api.allorigins.win, which is why live prices were
//          unreliable on the deployed site — that proxy goes down /
//          gets rate-limited independent of anything in this repo.)
//   2. No official rate limit is published, but hammering Yahoo (or
//      our own function) is still a good way to get temporarily
//      throttled. So we still:
//      - Cache every response in localStorage with a TTL (quotes: 2
//        minutes, daily history: 24 hours).
//      - Cap concurrent in-flight requests instead of firing 10+ at once.
//      - Fall back to stale cache whenever a request fails, so the UI
//        never goes blank.
// ============================================================

const QUOTE_TTL = 2 * 60 * 1000;        // 2 minutes
const DAILY_TTL = 24 * 60 * 60 * 1000;  // 24 hours
const MAX_CONCURRENT = 3;

// Yahoo needs no API key at all — kept as a no-op so callers/UI that
// used to gate on "is a key configured" still work without changes.
export const isApiKeyConfigured = () => true;

// ── Build the request URL for one symbol ─────────────────────
// Dev: Vite's local proxy (see vite.config.js) forwards this straight
// to Yahoo with no CORS issue.
// Prod: our own Vercel serverless function (api/yahoo-chart.js) does
// the Yahoo call server-side and returns the same JSON shape.
function buildChartUrl(yahooSymbol, range, interval) {
  if (import.meta.env.DEV) {
    return `/yahoo-api/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`;
  }
  return `/api/yahoo-chart?symbol=${encodeURIComponent(yahooSymbol)}&range=${range}&interval=${interval}`;
}

// ── localStorage cache helpers ───────────────────────────────
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function cacheSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...value, ts: Date.now() }));
  } catch {
    /* storage full/unavailable — ignore, we just won't cache */
  }
}
function isFresh(entry, ttl) {
  return entry && Date.now() - entry.ts < ttl;
}

// ── Small concurrency-limited queue (priority-aware) ─────────
let active = 0;
const pending = []; // { fn, resolve, reject, priority }

function runNext() {
  if (active >= MAX_CONCURRENT || pending.length === 0) return;
  pending.sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0));
  const task = pending.shift();
  active++;
  task
    .fn()
    .then(task.resolve, task.reject)
    .finally(() => {
      active--;
      runNext();
    });
}

function enqueue(fn, priority) {
  return new Promise((resolve, reject) => {
    pending.push({ fn, resolve, reject, priority });
    runNext();
  });
}

async function fetchJson(targetUrl, priority) {
  return enqueue(async () => {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, priority);
}

function getChartResult(json) {
  const result = json?.chart?.result?.[0];
  if (!result || json?.chart?.error) return null;
  return result;
}

// ── Quote (current price, OHLC, volume, change) ──────────────
export async function fetchQuote(yahooSymbol, { priority = false } = {}) {
  const key = `yf_quote_${yahooSymbol}`;
  const cached = cacheGet(key);
  if (isFresh(cached, QUOTE_TTL)) return { data: cached.data, stale: false, source: "cache" };

  try {
    const url = buildChartUrl(yahooSymbol, "5d", "1d");
    const json = await fetchJson(url, priority);
    const result = getChartResult(json);
    const meta = result?.meta;
    const quoteArr = result?.indicators?.quote?.[0];

    if (!meta || meta.regularMarketPrice == null) {
      return { data: cached?.data || null, stale: true, source: "error" };
    }

    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? null;
    const price = meta.regularMarketPrice;
    const change = prevClose != null ? price - prevClose : null;
    const changePercent = prevClose ? (change / prevClose) * 100 : null;

    // Last entry in the daily bar arrays is today's (or the latest
    // trading day's) bar — use its open as "today's open".
    const opens = quoteArr?.open || [];
    const lastOpen = [...opens].reverse().find(v => v != null) ?? null;

    const parsed = {
      price,
      open: lastOpen,
      high: meta.regularMarketDayHigh ?? null,
      low: meta.regularMarketDayLow ?? null,
      volume: meta.regularMarketVolume ?? null,
      prevClose,
      change,
      changePercent,
      tradingDay: meta.regularMarketTime
        ? new Date(meta.regularMarketTime * 1000).toISOString().slice(0, 10)
        : null,
    };
    cacheSet(key, { data: parsed });
    return { data: parsed, stale: false, source: "live" };
  } catch (e) {
    return { data: cached?.data || null, stale: true, source: "error", error: e.message };
  }
}

// ── Daily history (used for charts + 52W high/low) ───────────
export async function fetchDailySeries(yahooSymbol, { priority = false } = {}) {
  const key = `yf_daily_${yahooSymbol}`;
  const cached = cacheGet(key);
  if (isFresh(cached, DAILY_TTL)) return { data: cached.data, stale: false, source: "cache" };

  try {
    const url = buildChartUrl(yahooSymbol, "5y", "1d");
    const json = await fetchJson(url, priority);
    const result = getChartResult(json);
    const timestamps = result?.timestamp;
    const quoteArr = result?.indicators?.quote?.[0];

    if (!timestamps || !quoteArr) {
      return { data: cached?.data || null, stale: true, source: "error" };
    }

    const parsed = timestamps
      .map((ts, i) => ({
        time: new Date(ts * 1000).toISOString().slice(0, 10),
        open: quoteArr.open?.[i],
        high: quoteArr.high?.[i],
        low: quoteArr.low?.[i],
        close: quoteArr.close?.[i],
        volume: quoteArr.volume?.[i],
      }))
      .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
      .sort((a, b) => (a.time < b.time ? -1 : 1));

    cacheSet(key, { data: parsed });
    return { data: parsed, stale: false, source: "live" };
  } catch (e) {
    return { data: cached?.data || null, stale: true, source: "error", error: e.message };
  }
}

// Slice a full daily series down to a visible range for the chart tabs
export function sliceRange(series, range) {
  if (!series || series.length === 0) return [];
  const days = { "1W": 7, "1M": 30, "3M": 90, "1Y": 365 }[range];
  if (!days) return series; // "ALL"/unknown → full series
  return series.slice(-days);
}

export function fiftyTwoWeek(series) {
  const yearSlice = sliceRange(series, "1Y");
  if (!yearSlice.length) return { high: null, low: null };
  return {
    high: Math.max(...yearSlice.map(d => d.high)),
    low: Math.min(...yearSlice.map(d => d.low)),
  };
}