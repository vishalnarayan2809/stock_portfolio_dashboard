# Technical Document — Portfolio Dashboard

## Overview
This dashboard was built as part of a portfolio monitoring assignment.  
It allows users to:
- View holdings grouped by sector.
- Monitor CMP, investment value, present value, and gain/loss.
- Upload their own portfolio (CSV/XLSX) with localStorage persistence.
- Visualize sector allocation with a pie chart.

**🚀 Live Deployment**: [https://stoccckkkportfolio.vercel.app](https://stoccckkkportfolio.vercel.app)

---

## Architecture
- **Frontend**: Next.js App Router with client components for table and chart.  
- **Backend**: API route `/api/portfolio` fetches stock data.  
- **Data Source**: Yahoo Finance (via `yahoo-finance2` npm library).  
- **Deployment**: Vercel with serverless functions for API routes.
- **Storage**: LocalStorage for persistent portfolio data across sessions.  

---

## Data Flow
1. **Client polling** every 15 seconds requests `/api/portfolio?symbols=AAPL,MSFT,...`.  
2. **API Route** (deployed as Vercel serverless function):
   - Checks in-memory cache.  
   - Batch fetches symbols in chunks of 20 from Yahoo.  
   - On errors, retries with per-symbol fallback (concurrency-limited).  
   - Returns JSON results with flags (`cached`, `error`, `lastFetchedAt`).  
3. **Frontend** updates table + pie chart using new data.
4. **Upload feature** processes Excel/CSV files and stores data in localStorage for persistence.

---

## Rate Limiting & Caching
- **Cache TTL**: 60 seconds per symbol. Avoids repeated Yahoo hits for popular symbols.  
- **Batching**: Up to 20 symbols in one request → reduces network calls.  
- **Fallback + Concurrency Limit**: If batch fails, fetch each symbol individually, but only 3 at a time (`p-limit`).  
- **Trade-off**: This keeps UI responsive while staying below Yahoo’s undocumented rate limits.

---

## Error Handling
- **Backend**: On failure, returns `{ cmp:null, error:true }` for symbol instead of throwing.  
- **Frontend**: Shows ⚠ icon in CMP cell, continues rendering other data.  
- **Global state**: “Live/Syncing” indicator shows fetch status.  

---

## Trade-offs & Design Decisions
- **Google vs Yahoo**:  
  - Assignment suggested Google Finance for P/E & earnings.  
  - Chose Yahoo for consistency and simplicity (all metrics in one request).  
  - Documented this decision; in production, would abstract source for pluggability.
- **react-table**:  
  - Considered for table rendering.  
  - Dropped in favor of a custom grouped table for tighter control and simpler code.  
- **In-memory cache**:  
  - Simple and fast for demo.  
  - Not suitable for multi-instance deployment. A Redis store would be used in production.  

---

## Known Limitations
- Data may lag up to 60s (due to cache TTL).  
- No WebSocket/streaming — true tick-level updates not possible.  
- Yahoo Finance API is unofficial and may break without notice.  
- ✅ **Deployed successfully** to Vercel with full functionality.

---

## Future Improvements
- Add Redis or Upstash for distributed caching.  
- Add proper error banners and retry UI for failed fetches.  
- Replace Yahoo with a stable paid data source.  
- Add WebSocket support for real-time streaming data.
- Implement user authentication and portfolio sharing.

---

## Deployment Notes
- **Platform**: Vercel (optimal for Next.js)
- **API Routes**: Deployed as serverless functions
- **Static Assets**: CDN-optimized
- **Build**: Optimized production build with TypeScript and ESLint validation
- **Performance**: Fast global deployment with edge functions  
