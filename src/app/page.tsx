"use client";

import { portfolio as defaultPortfolio } from "@/data/portfolio";
import { useEffect, useState, useCallback } from "react";
import React from "react";
import SectorPie from "@/components/SectorPie";
import PortfolioTable from "@/components/PortfolioTabe";
import UploadPortfolio from "@/components/UploadPortfolio";


export default function Home() {
  interface StockData {
    cmp: number | null;
    peRatio: number | null;
    earnings: number | null;
    cached?: boolean;
    lastFetchedAt?: number;
    error?: boolean;
  }


  const BATCH_POLL_MS = 15000;

  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [portfolioState, setPortfolioState] = useState<typeof defaultPortfolio>(defaultPortfolio);

  // Memoized upload handler to prevent unnecessary re-renders
  const handlePortfolioUpload = useCallback((items: typeof defaultPortfolio) => {
    setPortfolioState(items);
  }, []);

  // Handler to reset to default portfolio
  const handleClearStored = useCallback(() => {
    setPortfolioState(defaultPortfolio);
  }, []);

  const totalInvestment = portfolioState.reduce(
    (sum, stock) => sum + stock.purchasePrice * stock.quantity,
    0
  );

  useEffect(() => {
    let mounted = true;

    async function fetchBatch() {
      if (!portfolioState || portfolioState.length === 0) return;

      const symbols = portfolioState.map((s) => s.symbol).filter(Boolean).join(",");
      try {
        const res = await fetch(`/api/portfolio?symbols=${encodeURIComponent(symbols)}`);
        const json = await res.json();
        if (json?.results) {
          const mapped: Record<string, StockData> = {};
          for (const [sym, val] of Object.entries(json.results)) {
            const stockInfo = val as any;
            mapped[sym] = {
              cmp: stockInfo.cmp ?? null,
              peRatio: stockInfo.peRatio ?? null,
              earnings: stockInfo.earnings ?? null,
              cached: stockInfo.cached ?? false,
              lastFetchedAt: stockInfo.lastFetchedAt ?? null,
              error: stockInfo.error ?? false,
            };
          }
          if (mounted) {
            setStockData(mapped);
            setLastUpdated(Date.now());
          }
        } else {
          console.warn("Unexpected response from /api/portfolio", json);
        }
      } catch (err) {
        console.error("Failed to fetch batch:", err);
      }
    }
    fetchBatch();
    const interval = setInterval(fetchBatch, BATCH_POLL_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [portfolioState]);

  // Group by sector
  const groupedBySector: Record<
    string,
    {
      stocks: typeof portfolioState;
      totals: { investment: number; presentValue: number; gainLoss: number };
    }
  > = {};

  for (const obj of portfolioState) {
    const investment = obj.purchasePrice * obj.quantity;
    const cmp = stockData[obj.symbol]?.cmp || 0;
    const presentValue = cmp * obj.quantity;
    const gainLoss = presentValue - investment;
    if (!groupedBySector[obj.sector]) {
      groupedBySector[obj.sector] = {
        stocks: [],
        totals: { investment: 0, presentValue: 0, gainLoss: 0 },
      };
    }
    groupedBySector[obj.sector].stocks.push(obj);
    groupedBySector[obj.sector].totals.investment += investment;
    groupedBySector[obj.sector].totals.presentValue += presentValue;
    groupedBySector[obj.sector].totals.gainLoss += gainLoss;
  }

  const sectors = Object.keys(groupedBySector);
  const loading = lastUpdated === null;



  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
            Portfolio Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 tracking-wide flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-800/60 ring-1 ring-white/10 text-[10px] font-semibold text-cyan-300">LIVE</span>
            Real-time snapshot of holdings performance
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-500">
            Updated:{" "}
            <span className="font-medium text-gray-200">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                loading ? "bg-yellow-400 animate-pulse" : "bg-emerald-500"
              }`}
              title={loading ? "Fetching..." : "Live"}
            />
            <span className="text-xs text-gray-400">
              {loading ? "Syncing..." : "Live"}
            </span>
          </div>
        </div>
      </div>

      <UploadPortfolio onUpload={handlePortfolioUpload} onClearStored={handleClearStored} />

      <PortfolioTable groupedBySector={groupedBySector} totalInvestment={totalInvestment} sectors={sectors} stockData={stockData}/>

      <div className="lg:col-span-1">
        <SectorPie portfolio={portfolioState} stockData={stockData} />
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
          <div className="w-48 h-48 rounded-2xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-300 animate-pulse ring-1 ring-white/10">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-600/40" />
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin [animation-duration:1.2s]" />
            </div>
            <p className="text-xs font-medium tracking-wide uppercase">Fetching data</p>
          </div>
        </div>
      )}
    </main>
  );
}