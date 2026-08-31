"use client";

import React, { useState, useEffect } from "react";
import {
  getAircraftTypes,
  checkDuplicateVoucher,
  createVoucher,
  AircraftConfig,
  Voucher,
} from "@/lib/api";
import { SeatMap } from "@/components/SeatMap";
import { VoucherHistory } from "@/components/VoucherHistory";
import { VoucherPassModal } from "@/components/VoucherPassModal";
import {
  Plane,
  UserCheck,
  Sparkles,
  AlertTriangle,
  ListFilter,
} from "lucide-react";

export default function Home() {
  const [aircraftList, setAircraftList] = useState<AircraftConfig[]>([]);
  const [, setLoadingAircraft] = useState(true);

  // Form State
  const [crewName, setCrewName] = useState("Captain Sarah Jenkins");
  const [crewId, setCrewId] = useState("CRW-9821");
  const [flightNumber, setFlightNumber] = useState("GA-421");
  const [flightDate, setFlightDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>("B737-800");

  // Status & Validation State
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<Voucher | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Result State
  const [assignedSeats, setAssignedSeats] = useState<string[]>([]);
  const [issuedVoucher, setIssuedVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState<"issue" | "history">("issue");
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  // Load available aircraft types on mount
  useEffect(() => {
    async function loadAircraft() {
      try {
        const list = await getAircraftTypes();
        setAircraftList(list);
        if (list.length > 0) setSelectedAircraftId(list[0].id);
      } catch (err) {
        console.error("Failed to load aircraft configs", err);
      } finally {
        setLoadingAircraft(false);
      }
    }
    loadAircraft();
  }, []);

  // Check duplicate when flight number or flight date changes
  useEffect(() => {
    if (!flightNumber.trim() || !flightDate.trim()) {
      setDuplicateAlert(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicate(true);
      try {
        const res = await checkDuplicateVoucher(
          flightNumber.trim().toUpperCase(),
          flightDate.trim()
        );
        if (res.isDuplicate) {
          setDuplicateAlert(res.existingVoucher);
        } else {
          setDuplicateAlert(null);
        }
      } catch (err) {
        console.error("Failed duplicate check", err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [flightNumber, flightDate]);

  const activeAircraft = aircraftList.find((a) => a.id === selectedAircraftId);

  // Handle Form Submission: Generate 3 Random Seats & Persist Record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!crewName.trim() || !crewId.trim() || !flightNumber.trim() || !flightDate.trim()) {
      setFormError("All flight and crew details are required.");
      return;
    }

    if (duplicateAlert) {
      setFormError(
        `Duplicate Assignment Blocked: Flight ${flightNumber.toUpperCase()} on ${flightDate} already has an issued voucher.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await createVoucher({
        crew_name: crewName.trim(),
        crew_id: crewId.trim(),
        flight_number: flightNumber.trim().toUpperCase(),
        flight_date: flightDate.trim(),
        aircraft_type: selectedAircraftId,
      });

      // Update state with newly assigned seats and voucher record
      const seatCodes = [res.voucher.seat1, res.voucher.seat2, res.voucher.seat3];
      setAssignedSeats(seatCodes);
      setIssuedVoucher(res.voucher);
      setRefreshHistoryTrigger((prev) => prev + 1);
    } catch (err: any) {
      if (err.existingVoucher) {
        setDuplicateAlert(err.existingVoucher);
        setFormError(
          `Voucher already issued for flight ${flightNumber.toUpperCase()} on ${flightDate}`
        );
      } else {
        setFormError(err.message || "Failed to generate voucher assignment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/20 text-slate-950 font-black">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                AERO VOUCHER <span className="text-sky-400 font-medium text-xs border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 rounded-full">CREW PORTAL</span>
              </h1>
              <p className="text-xs text-slate-400">
                Random Seat Assignment for Airline Promotional Winners
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("issue")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "issue"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Issue Vouchers
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> History Log
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "issue" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-400" /> Crew & Flight Entry
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Input details to generate 3 random unique winning seats.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Crew Name & ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Crew Member Name
                      </label>
                      <input
                        type="text"
                        required
                        value={crewName}
                        onChange={(e) => setCrewName(e.target.value)}
                        placeholder="e.g. Mikhail Abdillah"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Crew ID
                      </label>
                      <input
                        type="text"
                        required
                        value={crewId}
                        onChange={(e) => setCrewId(e.target.value)}
                        placeholder="e.g. CRW-9821"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Flight Number & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Flight Number
                      </label>
                      <input
                        type="text"
                        required
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. GA-421"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Flight Date
                      </label>
                      <input
                        type="date"
                        required
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Aircraft Type Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Aircraft Type & Layout
                    </label>
                    <select
                      value={selectedAircraftId}
                      onChange={(e) => setSelectedAircraftId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      {aircraftList.map((ac) => (
                        <option key={ac.id} value={ac.id}>
                          {ac.name} ({ac.totalSeats} seats, {ac.description})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duplicate Alert Indicator */}
                  {duplicateAlert && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-rose-200">
                          Duplicate Voucher Assignment Found!
                        </span>
                        A voucher for flight <span className="font-mono">{duplicateAlert.flight_number}</span> on <span className="font-mono">{duplicateAlert.flight_date}</span> was already issued on {new Date(duplicateAlert.created_at).toLocaleDateString()}. Duplicate assignment is strictly prohibited.
                      </div>
                    </div>
                  )}

                  {/* Form General Error */}
                  {formError && !duplicateAlert && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      {formError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !!duplicateAlert || checkingDuplicate}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" /> Drawing 3 Winning Seats...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate 3 Random Seats & Save Voucher
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Cabin Seat Map Visualization */}
            <div className="lg:col-span-7">
              {activeAircraft ? (
                <SeatMap
                  aircraft={activeAircraft}
                  winningSeats={assignedSeats}
                  isDrawing={submitting}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  Loading aircraft configuration...
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History Tab */
          <VoucherHistory
            refreshTrigger={refreshHistoryTrigger}
            onSelectVoucher={(v) => setIssuedVoucher(v)}
          />
        )}
      </div>

      {/* Winner Voucher Pass Modal */}
      {issuedVoucher && (
        <VoucherPassModal
          voucher={issuedVoucher}
          onClose={() => setIssuedVoucher(null)}
        />
      )}
    </main>
  );
}
