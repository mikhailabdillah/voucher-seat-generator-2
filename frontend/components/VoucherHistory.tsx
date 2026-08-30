"use client";

import React, { useState, useEffect } from "react";
import { Voucher, getVouchers, deleteVoucher } from "@/lib/api";
import { Search, Trash2, Calendar, Ticket, User, RefreshCw, Eye } from "lucide-react";

interface VoucherHistoryProps {
  onSelectVoucher?: (voucher: Voucher) => void;
  refreshTrigger?: number;
}

export function VoucherHistory({ onSelectVoucher, refreshTrigger = 0 }: VoucherHistoryProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchHistory = async (query?: string) => {
    setLoading(true);
    try {
      const data = await getVouchers(query);
      setVouchers(data);
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(search);
  }, [search, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete voucher #${id}?`)) return;
    setDeletingId(id);
    try {
      await deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete voucher");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-sky-400" /> Issued Vouchers History
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Persisted assignment records from database ({vouchers.length} records)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search flight, crew..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            onClick={() => fetchHistory(search)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto mt-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> Loading voucher records...
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No voucher assignment records found.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Flight Date</th>
                <th className="py-3 px-4">Aircraft</th>
                <th className="py-3 px-4">Crew Details</th>
                <th className="py-3 px-4 text-center">3 Assigned Seats</th>
                <th className="py-3 px-4">Issued At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vouchers.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors text-slate-300"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">#{item.id}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-400 text-sm">
                    {item.flight_number}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {item.flight_date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                      {item.aircraft_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{item.crew_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {item.crew_id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center gap-1.5 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.seat1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.seat2}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.seat3}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(item.created_at).toLocaleDateString()}{" "}
                    <span className="text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onSelectVoucher && (
                        <button
                          onClick={() => onSelectVoucher(item)}
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                          title="View Pass"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
