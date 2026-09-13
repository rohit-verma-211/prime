// ============================================================
// Curated watchlist shown in the Stocks section.
// `yahooSymbol` is the Yahoo Finance symbol (NSE-listed Indian
// stocks use the ".NS" suffix). Name/sector/exchange are static
// reference data — price, change, OHLC and volume always come
// live from Yahoo Finance (see src/lib/yahooFinance.js).
// ============================================================

export const SECTORS = [
  "Banking",
  "IT Services",
  "Oil & Gas",
  "FMCG",
  "Telecom",
  "Financial Services",
  "Consumer Goods"
];

export const STOCKS = [
  { symbol: "RELIANCE",   yahooSymbol: "RELIANCE.NS",   name: "Reliance Industries Ltd.",        sector: "Oil & Gas" },
  { symbol: "TCS",        yahooSymbol: "TCS.NS",        name: "Tata Consultancy Services Ltd.",  sector: "IT Services" },
  { symbol: "HDFCBANK",   yahooSymbol: "HDFCBANK.NS",   name: "HDFC Bank Ltd.",                  sector: "Banking" },
  { symbol: "INFY",       yahooSymbol: "INFY.NS",       name: "Infosys Ltd.",                    sector: "IT Services" },
  { symbol: "ICICIBANK",  yahooSymbol: "ICICIBANK.NS",  name: "ICICI Bank Ltd.",                 sector: "Banking" },
  { symbol: "BHARTIARTL", yahooSymbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd.",              sector: "Telecom" },
  { symbol: "ITC",        yahooSymbol: "ITC.NS",        name: "ITC Ltd.",                        sector: "FMCG" },
  { symbol: "HINDUNILVR", yahooSymbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd.",         sector: "FMCG" },
  { symbol: "SBIN",       yahooSymbol: "SBIN.NS",       name: "State Bank of India",             sector: "Banking" },
  { symbol: "BAJFINANCE", yahooSymbol: "BAJFINANCE.NS", name: "Bajaj Finance Ltd.",              sector: "Financial Services" },
  { symbol: "TATASILVER", yahooSymbol: "TATSILV.NS",   name: "Tata Silver Ltd.",                sector: "Consumer Goods" },
  { symbol: "TATAGOLD",   yahooSymbol: "TATAGOLD.NS",   name: "Tata Gold Ltd.",                  sector: "Consumer Goods" },
];

export function findStock(symbol) {
  return STOCKS.find(s => s.symbol === symbol.toUpperCase());
}
