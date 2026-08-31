"use client";

import React from "react";
import { Voucher } from "@/lib/api";
import { Ticket, X, Printer, CheckCircle2, UserCheck, Calendar, Plane } from "lucide-react";

interface VoucherPassModalProps {
  voucher: Voucher;
  onClose: () => void;
}

export function VoucherPassModal({ voucher, onClose }: VoucherPassModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Voucher Issued Successfully</h3>
              <p className="text-xs text-slate-400">Record #{voucher.id} persisted to database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Content */}
        <div className="p-6 space-y-6">
          <div className="bg-linear-to-br from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            {/* Background Decorative Pattern */}
            <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
              <Plane className="w-64 h-64 text-sky-400" />
            </div>

            {/* Top Bar */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                  Airline Promotional Campaign
                </span>
                <h4 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-400" /> WINNER VOUCHER PASS
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aircraft</span>
                <span className="text-sm font-semibold text-sky-300">{voucher.aircraft_type}</span>
              </div>
            </div>

            {/* Flight & Crew Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Flight Number</span>
                <span className="font-mono font-bold text-white text-base">{voucher.flight_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Flight Date</span>
                <span className="font-semibold text-slate-200 text-sm">{voucher.flight_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Crew Name</span>
                <span className="font-medium text-slate-200 text-sm truncate block">{voucher.crew_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Crew ID</span>
                <span className="font-mono text-slate-300 text-sm">{voucher.crew_id}</span>
              </div>
            </div>

            {/* Winning Seats Display */}
            <div className="pt-4">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-3">
                3 Assigned Unique Seat Numbers
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Winner #1", seat: voucher.seat1 },
                  { label: "Winner #2", seat: voucher.seat2 },
                  { label: "Winner #3", seat: voucher.seat3 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 text-center shadow-md transform hover:-translate-y-0.5 transition-transform"
                  >
                    <span className="text-[10px] text-amber-400/90 uppercase font-medium block">
                      {item.label}
                    </span>
                    <span className="text-2xl font-mono font-extrabold text-amber-300 tracking-wider">
                      {item.seat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp & Barcode */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Issued at: {new Date(voucher.created_at).toLocaleString()}</span>
              <span className="font-mono tracking-widest bg-slate-950/60 px-3 py-1 rounded border border-slate-800 text-slate-500">
                |||| | ||||| ||| |||| ||||
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-sky-500/25"
          >
            <Printer className="w-4 h-4" /> Print Voucher Pass
          </button>
        </div>
      </div>
    </div>
  );
}
