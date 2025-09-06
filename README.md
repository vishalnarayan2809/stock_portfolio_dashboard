# Portfolio Dashboard

A real-time portfolio monitoring dashboard built with **Next.js 15**, **TypeScript**, and **TailwindCSS**.  
It displays stock holdings grouped by sector, calculates investment metrics, and visualizes allocation using **Recharts**.  

Data is fetched live from **Yahoo Finance (unofficial API)** with caching, batching, and error handling.

---

## 🚀 Features
- **Live Updates**: Polls Yahoo Finance every 15 seconds for CMP, P/E ratio, and latest earnings.  
- **Portfolio Table**: Grouped by sector with investment totals, present value, gain/loss (color-coded).  
- **Sector Pie Chart**: Visualizes sector allocation by value.  
- **Upload CSV/Excel**: Import your own portfolio (CSV/XLSX) with persistence in localStorage.  
- **Error Handling**: Inline ⚠ indicators for fetch failures, graceful fallbacks from cache.  
- **Caching & Rate-Limiting**:  
  - In-memory cache (TTL = 60s).  
  - Batch requests in chunks of 20.  
  - Concurrency limiter (max 3 requests at once for fallbacks).  

---

## 📂 Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Recharts  
- **Backend**: Next.js API Routes, yahoo-finance2, p-limit  
- **Utilities**: SheetJS (xlsx) for Excel/CSV parsing, localStorage persistence

---

## 📦 Setup
```bash
git clone <your-repo>
cd portfolio-dashboard
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 📊 Usage
1. By default, loads a sample portfolio (`src/data/portfolio.ts`).  
2. Upload your own CSV/XLSX (headers: `symbol, name, purchasePrice, quantity, exchange, sector`).  
3. The dashboard refreshes every 15s and updates CMP, PV, Gain/Loss.  
4. Sector pie chart updates automatically.  

---

## ⚖️ Design Choices & Trade-offs
- **Yahoo vs Google**: Assignment suggested Google for P/E & earnings. We consolidated on Yahoo (CMP, trailingPE, EPS) because:
  - Yahoo provides all 3 in one API.
  - Google Finance has no official API, often blocked/scraped.
  - For production, we’d use a paid, reliable data provider (e.g., Polygon.io).
- **In-memory cache**: Simple, fast, but not distributed. For scaling, replace with Redis.  
- **Rate limiting**:  
  - Cache TTL = 60s (reduces API hits).  
  - Batch requests (20 symbols) + concurrency limit (3) balance speed and safety.  
  - This avoids hitting Yahoo’s undocumented rate limits.
- **react-table**: Initially considered, but dropped for simplicity. Custom grouped table gave full control over UI/UX and styling.  

---

## 📄 Deliverables
- [x] Next.js + Tailwind app  
- [x] Live API integration (yahoo-finance2)  
- [x] Sector grouping + totals  
- [x] Charting with Recharts  
- [x] Upload Excel/CSV portfolio  
- [x] Error handling + caching strategy  
- [ ] Deployment (suggested: Vercel)

---

## ⚠️ Limitations
- Uses unofficial Yahoo Finance API — subject to breakage and rate limits.  
- In-memory cache means data resets on server restart.  
- Real-time defined as 15s polling — not streaming. For true real-time, use a provider with WebSockets.  

---

## 📸 Screenshots
(Add screenshots of table + pie chart here)

---
