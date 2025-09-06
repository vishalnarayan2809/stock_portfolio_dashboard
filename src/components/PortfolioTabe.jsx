"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function PortfolioTable({ groupedBySector, sectors, totalInvestment, stockData }) {
  const [expanded, setExpanded] = useState({});


  const sectorColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 50%)`;
  };

  const formatCurrency = (v) =>
    v == null ? "—" : new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);

  const Chip = ({ value }) => {
    if (value == null) return <span className="text-gray-400">—</span>;
    const cls =
      value > 0
        ? "bg-green-100 text-green-700 ring-green-300"
        : value < 0
        ? "bg-red-100 text-red-600 ring-red-300"
        : "bg-gray-100 text-gray-600 ring-gray-300";
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ring-1 ${cls}`}>
        {formatCurrency(value)}
      </span>
    );
  };

  const SkeletonCell = () => (
    <span className="relative inline-block w-12 h-4 overflow-hidden rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse shimmer" />
  );


  const data = useMemo(() => {
    const tableData = [];
    
    sectors.forEach((sector) => {
      const sectorData = groupedBySector[sector];
      const { investment, presentValue, gainLoss } = sectorData.totals;
      const sectorPercent = ((investment / totalInvestment) * 100).toFixed(1);
      

      tableData.push({
        id: `sector-${sector}`,
        type: 'sector',
        sector,
        sectorData,
        investment,
        presentValue,
        gainLoss,
        sectorPercent,
        accent: sectorColor(sector),
        stockCount: sectorData.stocks.length
      });
      

      sectorData.stocks.forEach((stock, idx) => {
        const stockInvestment = stock.purchasePrice * stock.quantity;
        const cmp = stockData[stock.symbol]?.cmp ?? null;
        const stockPresentValue = cmp != null ? cmp * stock.quantity : null;
        const stockGainLoss = stockPresentValue != null ? stockPresentValue - stockInvestment : null;
        const portfolioPercent = ((stockInvestment / totalInvestment) * 100).toFixed(2);
        
        tableData.push({
          id: `stock-${sector}-${stock.symbol}`,
          type: 'stock',
          sector,
          stock,
          investment: stockInvestment,
          presentValue: stockPresentValue,
          gainLoss: stockGainLoss,
          portfolioPercent,
          cmp,
          rowIndex: idx
        });
      });
    });
    
    return tableData;
  }, [groupedBySector, sectors, totalInvestment, stockData]);


  const columns = useMemo(() => [
    {
      id: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const rowData = row.original;
        
        if (rowData.type === 'sector') {
          const isExpanded = expanded[rowData.sector];
          return (
            <div 
              className="cursor-pointer select-none"
              onClick={() => setExpanded(prev => ({ ...prev, [rowData.sector]: !prev[rowData.sector] }))}
            >
              <div className="relative flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-6 overflow-hidden group/sector">
                <div className="absolute inset-0 opacity-0 group-hover/sector:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-slate-800/60 via-slate-800/30 to-transparent" />
                <div className="absolute inset-0 backdrop-brightness-110 mix-blend-overlay opacity-0 group-hover/sector:opacity-100 transition-opacity" />
                {/* Left accent bar */}
                <span
                  className="absolute left-0 top-0 h-full w-1 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
                  style={{ background: rowData.accent }}
                />
                {/* Subtle glow ring */}
                <span className="pointer-events-none absolute -inset-px rounded-lg border border-white/5 group-hover/sector:border-white/10" />
                {/* Content */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`transition-transform text-slate-300 text-xs inline-flex h-5 w-5 items-center justify-center rounded-md ring-1 ring-white/10 bg-slate-800/40
                      ${isExpanded ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                  <h3 className="font-semibold tracking-wide text-sm md:text-base text-slate-100 uppercase flex items-center gap-2">
                    {rowData.sector}
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-300 ring-1 ring-white/10"
                      title="Sector share of total investment"
                    >
                      {rowData.sectorPercent}%
                    </span>
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] md:text-xs ml-8 md:ml-0">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="text-slate-500">Investment:</span>
                    <span className="font-medium text-slate-200">
                      {formatCurrency(rowData.investment)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="text-slate-500">Value:</span>
                    <span className="font-medium text-slate-200">
                      {formatCurrency(rowData.presentValue)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="text-slate-500">Gain/Loss:</span>
                    <Chip value={rowData.gainLoss} />
                  </span>
                  <span
                    className="hidden md:inline-flex items-center gap-1 text-slate-500"
                    title="Holdings in this sector"
                  >
                    {rowData.stockCount} stk
                  </span>
                </div>
              </div>
            </div>
          );
        }
        
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">
                {rowData.stock.name}
              </span>
              {stockData[rowData.stock.symbol]?.cached && (
                <span
                  title="Cached value"
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                >
                  cache
                </span>
              )}
              {stockData[rowData.stock.symbol]?.error && (
                <span
                  title="Fetch failed"
                  className="text-yellow-400 text-sm"
                >
                  ⚠
                </span>
              )}
            </div>
          );
        }
        
        return null;
      }
    },
    {
      id: 'buyPrice',
      header: 'Buy Price',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return <span className="text-slate-300">₹{rowData.stock.purchasePrice}</span>;
        }
        return null;
      }
    },
    {
      id: 'qty',
      header: 'Qty',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return <span className="text-slate-300">{rowData.stock.quantity}</span>;
        }
        return null;
      }
    },
    {
      id: 'investment',
      header: 'Investment',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return formatCurrency(rowData.investment);
        }
        return null;
      }
    },
    {
      id: 'portfolioPercent',
      header: '% Portfolio',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return <span className="text-slate-400">{rowData.portfolioPercent}%</span>;
        }
        return null;
      }
    },
    {
      id: 'exchange',
      header: 'Exchange',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return <span className="text-slate-300">{rowData.stock.exchange}</span>;
        }
        return null;
      }
    },
    {
      id: 'cmp',
      header: 'CMP',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          const cmp = rowData.cmp;
          const stockInfo = stockData[rowData.stock.symbol];
          
          if (cmp != null && !stockInfo?.error) {
            return (
              <span className="tabular-nums text-slate-100">
                {cmp}
              </span>
            );
          } else if (stockInfo?.error) {
            return (
              <span
                title="Failed to fetch latest price"
                className="text-yellow-500"
              >
                ⚠
              </span>
            );
          } else {
            return <SkeletonCell />;
          }
        }
        return null;
      }
    },
    {
      id: 'presentValue',
      header: 'Present Value',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return rowData.presentValue != null ? formatCurrency(rowData.presentValue) : "—";
        }
        return null;
      }
    },
    {
      id: 'gainLoss',
      header: 'Gain / Loss',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return <Chip value={rowData.gainLoss} />;
        }
        return null;
      }
    },
    {
      id: 'pe',
      header: 'P/E',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return (
            <span className="text-slate-300">
              {stockData[rowData.stock.symbol]?.peRatio ?? "—"}
            </span>
          );
        }
        return null;
      }
    },
    {
      id: 'earnings',
      header: 'Earnings',
      cell: ({ row }) => {
        const rowData = row.original;
        if (rowData.type === 'stock' && expanded[rowData.sector]) {
          return (
            <span className="text-slate-300">
              {stockData[rowData.stock.symbol]?.earnings ?? "—"}
            </span>
          );
        }
        return null;
      }
    }
  ], [expanded, stockData, formatCurrency]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
  });

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-800/60 backdrop-blur sticky top-0 z-10 text-[11px] md:text-xs uppercase tracking-wide text-slate-300">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className={`px-4 py-3 font-medium ${
                      header.id === 'stock' ? 'text-left' : 
                      header.id === 'exchange' ? '' : 'text-right'
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {table.getRowModel().rows.map((row) => {
              const rowData = row.original;
              
              if (rowData.type === 'sector') {
                return (
                  <tr key={row.id} className="relative cursor-pointer select-none group/sector">
                    <td colSpan={11} className="p-0">
                      {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                    </td>
                  </tr>
                );
              }
              
              if (rowData.type === 'stock' && expanded[rowData.sector]) {
                const cellBase = "px-4 py-2 whitespace-nowrap transition-colors";
                return (
                  <tr
                    key={row.id}
                    className={`group transition-colors duration-300 ${
                      rowData.rowIndex % 2 === 0
                        ? "bg-slate-900/30"
                        : "bg-slate-900/20"
                    } hover:bg-slate-800/60`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id} 
                        className={`${cellBase} ${
                          cell.column.id === 'stock' ? 'text-left' : 
                          cell.column.id === 'exchange' ? 'text-center' : 'text-right'
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              }
              
              return null;
            })}
            {sectors.length === 0 && (
              <tr>
                <td
                  className="px-4 py-10 text-center text-slate-400"
                  colSpan={11}
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-700/40 text-[11px] md:text-xs text-slate-400 flex flex-wrap gap-4">
        <span>
          Total Investment:{" "}
          <span className="text-slate-300 font-medium">
            {formatCurrency(totalInvestment)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-400" /> Loading
        </span>
      </div>
    </div>
  );
}