"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Upload, FileUp, X } from "lucide-react";

type RawRow = { [k: string]: unknown };
export type UploadedStock = {
  symbol: string;
  name: string;
  purchasePrice: number;
  quantity: number;
  exchange: string;
  sector: string;
};

const STORAGE_KEY = "portfolio-uploaded-data";

export default function UploadPortfolio({ 
  onUpload, 
  onClearStored 
}: { 
  onUpload: (items: UploadedStock[]) => void;
  onClearStored?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load stored data on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setHasStoredData(true);
          setPreviewCount(parsedData.length);
          onUpload(parsedData); // Load stored data into app
        }
      }
    } catch (err) {
      console.warn("Failed to load stored portfolio data:", err);
      localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save data to localStorage
  const saveToStorage = (data: UploadedStock[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasStoredData(true);
    } catch (err) {
      console.warn("Failed to save portfolio data to localStorage:", err);
    }
  };

  // Clear stored data
  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasStoredData(false);
    setPreviewCount(null);
    setError(null);
    if (onClearStored) {
      onClearStored(); // Reset to default portfolio
    }
  };

  function normalizeHeader(h: string) {
    return (h || "").toString().trim().toLowerCase().replace(/\s+/g, "_");
  }

  function mapRowToStock(row: RawRow): UploadedStock | null {
    // Accept multiple plausible header names for robustness
    const lookup = (keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
      }
      return undefined;
    };

    const symbol = lookup(["symbol", "ticker", "code"]) ?? "";
    const name = lookup(["name", "company", "stock_name"]) ?? "";
    const purchasePrice = Number(lookup(["purchaseprice", "price", "buy_price", "buyprice"]) ?? 0) || 0;
    const quantity = Number(lookup(["quantity", "qty", "shares"]) ?? 0) || 0;
    const exchange = lookup(["exchange", "market"]) ?? "";
    const sector = lookup(["sector", "industry"]) ?? "";

    if (!symbol || !name) return null;

    return {
      symbol: String(symbol).trim(),
      name: String(name).trim(),
      purchasePrice: Number(purchasePrice),
      quantity: Number(quantity),
      exchange: String(exchange).trim(),
      sector: String(sector).trim() || "Unknown",
    };
  }

  const handleFile = async (file?: File) => {
    setError(null);
    setPreviewCount(null);
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Use first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Parse to JSON using SheetJS (works for csv/xlsx)
      const raw = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: "" });

      if (!raw || raw.length === 0) {
        setError("File contains no rows.");
        return;
      }

      // Normalize headers (create a map)
      // Convert each object's keys to normalized keys
      const normalizedRows: RawRow[] = raw.map((r) => {
        const out: RawRow = {};
        Object.keys(r).forEach((k) => {
          out[normalizeHeader(k)] = r[k];
        });
        return out;
      });

      // Map rows
      const mapped: UploadedStock[] = [];
      const badRows: number[] = [];
      normalizedRows.forEach((r, idx) => {
        const stock = mapRowToStock(r);
        if (stock) mapped.push(stock);
        else badRows.push(idx + 2); // human-friendly (header is row 1)
      });

      if (mapped.length === 0) {
        setError("No valid rows found. Make sure your sheet has columns like Symbol, Name, PurchasePrice, Quantity, Exchange, Sector.");
        return;
      }

      // show preview count and call callback
      setPreviewCount(mapped.length);
      saveToStorage(mapped); // Save to localStorage
      onUpload(mapped);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to parse file. Make sure it's a valid Excel or CSV file.");
    }
  };

  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/40">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-slate-200 font-medium">Portfolio Upload</label>
        {hasStoredData && (
          <button
            onClick={clearStoredData}
            className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
            title="Clear stored data and use default portfolio"
          >
            <X size={12} />
            Clear stored
          </button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver
            ? "border-cyan-400 bg-cyan-400/5"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            handleFile(files[0]);
          }
        }}
      >
        <input
          type="file"
          accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="portfolio-upload"
        />
        
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className={`p-3 rounded-full transition-colors ${
              isDragOver ? "bg-cyan-400/20 text-cyan-400" : "bg-slate-700/50 text-slate-400"
            }`}>
              <FileUp size={24} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-cyan-400">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-slate-500">Supports CSV, Excel (.xlsx, .xls)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            // Complete sample file with all portfolio data
            const sample = [
              ["symbol", "name", "purchasePrice", "quantity", "exchange", "sector"],
              ["TCS.NS", "Tata Consultancy Services", "3200", "10", "NSE", "Technology"],
              ["INFY.NS", "Infosys", "1500", "20", "NSE", "Technology"],
              ["HDFCBANK.NS", "HDFC Bank", "1600", "15", "NSE", "Financials"],
              ["RELIANCE.NS", "Reliance Industries", "2450", "25", "NSE", "Energy"],
              ["BHARTIARTL.NS", "Bharti Airtel", "850", "30", "NSE", "Telecommunications"],
              ["ITC.NS", "ITC Limited", "420", "50", "NSE", "Consumer Goods"],
              ["LT.NS", "Larsen & Toubro", "2100", "12", "NSE", "Industrials"],
              ["ASIANPAINT.NS", "Asian Paints", "3150", "8", "NSE", "Materials"],
              ["SUNPHARMA.NS", "Sun Pharmaceutical", "980", "22", "NSE", "Healthcare"],
              ["MARUTI.NS", "Maruti Suzuki", "8900", "5", "NSE", "Automotive"],
              ["SBIN.NS", "State Bank of India", "550", "35", "NSE", "Financials"],
              ["COALINDIA.NS", "Coal India", "185", "100", "NSE", "Materials"],
              ["WIPRO.NS", "Wipro", "480", "40", "NSE", "Technology"],
              ["AXISBANK.NS", "Axis Bank", "780", "18", "NSE", "Financials"],
              ["TITAN.NS", "Titan Company", "2650", "7", "NSE", "Consumer Discretionary"],
            ];
            const ws = XLSX.utils.aoa_to_sheet(sample);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Portfolio");
            const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbout], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "complete_portfolio_sample.xlsx";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 text-slate-300 rounded text-xs hover:bg-slate-700 transition-colors"
        >
          <Upload size={12} />
          Download sample (15 stocks)
        </button>
      </div>

      {hasStoredData && previewCount !== null && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-emerald-400">
            Using stored data ({previewCount} stocks) - Upload new file to replace
          </span>
        </div>
      )}

      {!hasStoredData && previewCount !== null && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs">
          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          <span className="text-cyan-400">Uploaded {previewCount} stocks successfully</span>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500 leading-relaxed">
        <strong>Expected columns:</strong> symbol, name, purchasePrice, quantity, exchange, sector
        <br />
        <em>Note:</em> Column names are case-insensitive. Alternative names like &quot;ticker&quot;, &quot;qty&quot;, &quot;shares&quot; are also accepted.
      </div>
    </div>
  );
}
