"use me";
"use client";

import React from "react";
import { AircraftConfig } from "@/lib/api";
import { Sparkles, AlertCircle } from "lucide-react";

interface SeatMapProps {
  aircraft: AircraftConfig;
  winningSeats?: string[]; // e.g. ["12A", "14C", "22F"]
  isDrawing?: boolean;
}

export function SeatMap({ aircraft, winningSeats = [], isDrawing = false }: SeatMapProps) {
  const winningSet = new Set(winningSeats);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200">
      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center pb-4 mb-6 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            ✈️ {aircraft.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase tracking-wide">
              {aircraft.category}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{aircraft.description}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600 inline-block"></span>
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 shadow-sm shadow-amber-500/50 inline-block animate-pulse"></span>
            <span className="text-amber-400 font-semibold">Voucher Winner</span>
          </div>
        </div>
      </div>

      {/* Cabin Visualization */}
      <div className="relative max-w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="min-w-[400px] flex flex-col items-center">
          {/* Cockpit / Nose */}
          <div className="w-48 h-12 bg-gradient-to-b from-sky-900/60 to-slate-800 border-t-2 border-x-2 border-sky-500/40 rounded-t-full flex items-center justify-center text-xs font-semibold text-sky-300 tracking-widest uppercase mb-4 shadow-lg shadow-sky-950/50">
            <span>Cockpit</span>
          </div>

          {/* Seat Grid Rows */}
          <div className="w-full flex flex-col gap-2">
            {Array.from({ length: aircraft.rows }, (_, r) => r + 1).map((rowNum) => {
              const isExit = aircraft.exitRows.includes(rowNum);

              return (
                <div
                  key={rowNum}
                  className={`flex items-center justify-center gap-4 px-4 py-1.5 rounded-lg transition-colors ${
                    isExit ? "bg-amber-950/30 border border-amber-500/30" : "hover:bg-slate-800/50"
                  }`}
                >
                  {/* Row Number */}
                  <span className="w-8 text-right text-xs font-mono font-semibold text-slate-400">
                    {rowNum}
                  </span>

                  {/* Column Groups */}
                  <div className="flex items-center gap-6">
                    {aircraft.columnGroups.map((group, groupIdx) => (
                      <div key={groupIdx} className="flex gap-1.5">
                        {group.map((col) => {
                          const seatCode = `${rowNum}${col}`;
                          const isWinner = winningSet.has(seatCode);

                          return (
                            <div
                              key={seatCode}
                              title={`Seat ${seatCode}`}
                              className={`relative w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 transform ${
                                isWinner
                                  ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 scale-110 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300 z-10 animate-bounce"
                                  : isDrawing
                                  ? "bg-slate-800 text-slate-400 animate-pulse"
                                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:border-sky-500/50"
                              }`}
                            >
                              {isWinner ? (
                                <Sparkles className="w-4 h-4 text-slate-950" />
                              ) : (
                                col
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Exit Row Indicator */}
                  <span className="w-12 text-xs font-semibold text-amber-500/80">
                    {isExit ? "EXIT" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tail Section */}
          <div className="w-36 h-8 bg-slate-800/80 border-b-2 border-x-2 border-slate-700 rounded-b-xl flex items-center justify-center text-[10px] text-slate-500 uppercase tracking-widest mt-4">
            Rear Galley / Tail
          </div>
        </div>
      </div>

      {winningSeats.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                3 Assigned Winning Seats
              </p>
              <p className="text-lg font-mono font-bold text-white tracking-widest mt-0.5">
                {winningSeats.join(" • ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
