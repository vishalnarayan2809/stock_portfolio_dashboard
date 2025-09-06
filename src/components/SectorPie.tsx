"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Stock } from "@/data/portfolio";

const COLORS = ["#60a5fa", "#34d399", "#f97316", "#f472b6", "#a78bfa", "#f87171", "#facc15"];

export default function SectorPie({
  portfolio,
  stockData,
}: {
  portfolio: Stock[];
  stockData: Record<string, { cmp: number | null }>;
}) {
  const data = useMemo(() => {
  const map = new Map<string, number>();
  for (const p of portfolio) {
    const inv = p.purchasePrice * p.quantity;
    const cmp = stockData[p.symbol]?.cmp ?? null;
    const pv = cmp != null ? cmp * p.quantity : inv; // fallback to investment
    map.set(p.sector, (map.get(p.sector) || 0) + pv);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value: value ?? 0 })); // ensure number
}, [portfolio, stockData]);

// compute total once, safe default 1 to avoid divide-by-zero
const totalValue = data.reduce((s, d) => s + (d.value ?? 0), 0) || 1;

  return (
    <div className="glass-panel h-96 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-200 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Sector Distribution
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-md bg-slate-800/60 ring-1 ring-white/10 text-slate-400">
          by value
        </span>
      </div>
      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {COLORS.map((c, i) => (
                <radialGradient key={i} id={`grad-${i}`} cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor={c} stopOpacity={0.15} />
                  <stop offset="60%" stopColor={c} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.95} />
                </radialGradient>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={85}
              innerRadius={35}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#0f172a"
              label={(entry) => `${entry.name} ${Math.round(((entry.value ?? 0) / totalValue) * 100)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              offset={15}
              allowEscapeViewBox={{ x: false, y: false }}
              formatter={(value: number) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              contentStyle={{
                background: "rgba(15,23,42,.95)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "8px 12px",
                color: "#f1f5f9",
                fontSize: "12px",
                fontWeight: "500",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{
                color: "#cbd5e1",
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
              itemStyle={{
                color: "#f1f5f9",
                fontSize: "12px",
                fontWeight: "500",
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="text-[11px] tracking-wide text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        {data.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-slate-500 text-xs">
            <div className="flex flex-col items-center gap-2">
              <span className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
              Loading chart...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
