// ============================================================
// Vercel Serverless Function — server-side Yahoo Finance proxy.
//
// Place this file at:  api/yahoo-chart.js   (project ROOT, next to
// package.json — a sibling of src/, NOT inside src/). Vercel auto-
// detects any .js file under /api as a serverless function, for any
// framework (Vite included) — no extra config needed.
//
// Why this replaces the allorigins.win proxy:
//   - Browsers block query1.finance.yahoo.com directly (CORS), so the
//     old code routed through a free public proxy (allorigins.win).
//     That proxy is unreliable — it goes down / rate-limits / gets
//     blocked, which is why your live prices stopped working.
//   - This function runs on Vercel's own servers. Server-to-server
//     calls aren't subject to browser CORS at all, so there's no
//     proxy needed, nothing to go down except Yahoo itself, and no
//     rate limit shared with every other allorigins.win user on earth.
//
// Usage from the frontend:
//   /api/yahoo-chart?symbol=RELIANCE.NS&range=5d&interval=1d
// ============================================================

export default async function handler(req, res) {
  const { symbol, range = "5d", interval = "1d" } = req.query;

  if (!symbol) {
    res.status(400).json({ error: "Missing required query param: symbol" });
    return;
  }

  try {
    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;

    const upstream = await fetch(yahooUrl, {
      headers: {
        // Yahoo's endpoint sometimes returns an empty/blocked response
        // to requests with no User-Agent at all — a normal browser-like
        // UA avoids that.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    const text = await upstream.text();

    // Cache at Vercel's edge for 60s, serve stale for up to 2 more
    // minutes while revalidating — cuts down repeat calls to Yahoo
    // for symbols many visitors are looking at around the same time.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Content-Type", "application/json");
    res.status(upstream.status).send(text);
  } catch (e) {
    res.status(502).json({ error: "Failed to reach Yahoo Finance", detail: e.message });
  }
}