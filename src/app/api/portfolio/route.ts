import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import pLimit from "p-limit";


type QuoteData = {
  cmp: number | null;
  peRatio: number | null;
  earnings: number | null;
};

// Simple in-memory cache
type CacheEntry = {
  data: QuoteData;
  expiresAt: number;
  lastFetchedAt: number;
};

type FetchResult = {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  earnings: number | null;
  cached?: boolean;
  lastFetchedAt?: number;
  error?: boolean;
};


const CACHE_TTL_MS = 60_000; // cache for 60 seconds (tweakable)
const BATCH_CHUNK = 20;
const cache: Record<string, CacheEntry> = {};

// Helper: fetch single symbol from Yahoo (with cache)
async function fetchSymbolAndCache(symbol: string):Promise<FetchResult> {
  const key = symbol.toUpperCase();
  const now = Date.now();

  // return cached if fresh
  if (cache[key] && cache[key].expiresAt > now) {
    return { symbol: key, ...cache[key].data, cached: true, lastFetchedAt: cache[key].lastFetchedAt };
  }

  try {
    const quote = await yahooFinance.quote(key);

    const data: QuoteData = {
      cmp: quote?.regularMarketPrice ?? null,
      peRatio: quote?.trailingPE ?? null,
      earnings: quote?.epsTrailingTwelveMonths ?? null,
    };

    cache[key] = {
      data,
      expiresAt: now + CACHE_TTL_MS,
      lastFetchedAt: now,
    };

    return { symbol: key, ...data, cached: false, lastFetchedAt: now };
  } catch (err) {
    console.error(`Error fetching symbol ${key}:`, err);
    // don't update cache on error; return error marker
    return { symbol: key, cmp: null, peRatio: null, earnings: null, cached: false, error: true };
  }
}


async function fetchBatch(symbols: string[]) {
  const now = Date.now();
  const results: Record<
    string,
    { cmp: number | null; peRatio: number | null; earnings: number | null; cached?: boolean; lastFetchedAt?: number; error?: boolean }
  > = {};

  // Split into chunks to avoid very large requests
  for (let i = 0; i < symbols.length; i += BATCH_CHUNK) {
    const chunk = symbols.slice(i, i + BATCH_CHUNK);

    try {
      // yahooFinance.quote accepts array; returns array of quote objects
      const quotes = await yahooFinance.quote(chunk);

      // Normalize to array
      const items = Array.isArray(quotes) ? quotes : [quotes];

      for (const q of items) {
        const sym = (q?.symbol ?? "").toString().toUpperCase();
        const data = {
          cmp: q?.regularMarketPrice ?? null,
          peRatio: q?.trailingPE ?? null,
          earnings: q?.epsTrailingTwelveMonths ?? null,
        };

        // update cache and results
        results[sym] = { ...data, cached: false, lastFetchedAt: now };
        cache[sym] = { data, expiresAt: now + CACHE_TTL_MS, lastFetchedAt: now };
      }
    } catch (err) {
      console.warn("Batch fetch error for chunk:", chunk, err);
      // On batch failure, do nothing here — caller will fallback per-symbol
    }
  }

  return results;
}

// GET /api/portfolio?symbols=TCS.NS,INFY.NS
// GET /api/portfolio?symbols=TCS.NS,INFY.NS
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols") || "";
  const rawSymbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase());

  if (rawSymbols.length === 0) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
  }

  const now = Date.now();
  const results: Record<
    string,
    { cmp: number | null; peRatio: number | null; earnings: number | null; cached?: boolean; lastFetchedAt?: number; error?: boolean }
  > = {};

  // 1) Seed results with fresh cached entries
  const symbolsToFetch: string[] = [];
  for (const sym of rawSymbols) {
    if (cache[sym] && cache[sym].expiresAt > now) {
      results[sym] = {
        cmp: cache[sym].data.cmp,
        peRatio: cache[sym].data.peRatio,
        earnings: cache[sym].data.earnings,
        cached: true,
        lastFetchedAt: cache[sym].lastFetchedAt,
      };
    } else {
      symbolsToFetch.push(sym);
    }
  }

  // 2) Batch fetch stale symbols
  if (symbolsToFetch.length > 0) {
    const batchResults = await fetchBatch(symbolsToFetch);
    for (const [sym, val] of Object.entries(batchResults)) {
      results[sym] = {
        cmp: val.cmp,
        peRatio: val.peRatio,
        earnings: val.earnings,
        cached: false,
        lastFetchedAt: val.lastFetchedAt,
      };
    }

    // 3) Fallback for any missing after batch
    const missing = symbolsToFetch.filter((s) => !results[s]);

    if(missing.length > 0 ){
        const limit = pLimit(3)
        const promises = missing.map((sym) => limit(() => fetchSymbolAndCache(sym)));
        const fallbackResults = await Promise.all(promises);
          for (const r of fallbackResults) {
    results[r.symbol] = {
      cmp: r.cmp,
      peRatio: r.peRatio,
      earnings: r.earnings,
      cached: r.cached,
      lastFetchedAt: r.lastFetchedAt,
      ...(r.error ? { error: true } : {}),
    };
  }
    }


    }
    

  return NextResponse.json({ results });
}
