"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, parseISO, startOfDay } from "date-fns";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lock,
  Plus,
  RefreshCw,
  Trash,
  X,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  price: number;
}

interface Room {
  id: string;
  name: string;
  categoryId: string;
}

interface BookingRoom {
  roomId: string;
  room: Room;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  roomtype: string;
  totalPrice: number;
  rooms: BookingRoom[];
}

interface BlockedRoom {
  id: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  count: number;
  reason: string;
}

interface InventoryClientProps {
  initialCategories: Category[];
  initialRooms: Room[];
  initialBookings: Booking[];
  initialBlockedRooms: BlockedRoom[];
  startDateStr: string;
  endDateStr: string;
  selectedCategoryId: string;
}

export default function InventoryClient({
  initialCategories,
  initialRooms,
  initialBookings,
  initialBlockedRooms,
  startDateStr,
  endDateStr,
  selectedCategoryId,
}: InventoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState(selectedCategoryId);
  const [startDateInput, setStartDateInput] = useState(startDateStr);
  const [endDateInput, setEndDateInput] = useState(endDateStr);

  // Blocking Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockCategory, setBlockCategory] = useState(initialCategories[0]?.id || "");
  const [blockStart, setBlockStart] = useState(startDateStr);
  const [blockEnd, setBlockEnd] = useState(startDateStr);
  const [blockCount, setBlockCount] = useState(1);
  const [blockReason, setBlockReason] = useState("");

  // Manage Blocks Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Generate date list between start and end dates
  const start = startOfDay(parseISO(startDateStr));
  const end = startOfDay(parseISO(endDateStr));
  const datesList: Date[] = [];
  let curr = new Date(start);

  while (curr <= end) {
    datesList.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // ── Navigation & Filter Functions ──────────────────────────────────────────

  const applyFilters = (startStr: string, endStr: string, catId: string) => {
    router.push(
      `/admin/inventory?categoryId=${catId}&startDate=${startStr}&endDate=${endStr}`
    );
  };

  const shiftDates = (days: number) => {
    const newStart = addDays(parseISO(startDateStr), days);
    const newEnd = addDays(parseISO(endDateStr), days);
    const newStartStr = format(newStart, "yyyy-MM-dd");
    const newEndStr = format(newEnd, "yyyy-MM-dd");
    setStartDateInput(newStartStr);
    setEndDateInput(newEndStr);
    applyFilters(newStartStr, newEndStr, filterCategory);
  };

  // ── Block Inventory Actions ────────────────────────────────────────────────

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockCategory || !blockStart || !blockEnd) return;

    try {
      setLoading(true);
      await axios.post("/api/blocked", {
        startDate: blockStart,
        endDate: blockEnd,
        categoryId: blockCategory,
        count: blockCount,
        reason: blockReason,
      });

      toast({
        title: "Rooms Blocked Successfully",
        description: `Blocked ${blockCount} rooms in selected dates.`,
      });

      setIsBlockModalOpen(false);
      setBlockReason("");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Block failed",
        description: "An error occurred while blocking rooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/blocked?id=${id}`);

      toast({
        title: "Block removed",
        description: "The room block has been deleted.",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: "Failed to delete block.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter categories to show
  const categoriesToShow =
    filterCategory === "all"
      ? initialCategories
      : initialCategories.filter((c) => c.id === filterCategory);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Control Panel ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm">
        {/* Left: Dropdowns & Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Selector */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              applyFilters(startDateInput, endDateInput, e.target.value);
            }}
            className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white font-medium focus:ring-2 focus:ring-[#B8975A] focus:outline-none min-w-[150px]"
          >
            <option value="all">All room types</option>
            {initialCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Date range picker bar */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => shiftDates(-14)}
              className="px-2.5 py-2 hover:bg-gray-50 border-r border-gray-200 text-gray-500 transition-colors"
              title="Previous 14 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Start Date input */}
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => {
                setStartDateInput(e.target.value);
                applyFilters(e.target.value, endDateInput, filterCategory);
              }}
              className="px-2 py-1.5 text-sm text-gray-700 font-semibold border-none focus:outline-none cursor-pointer bg-white"
            />
            <span className="text-gray-300 text-sm">|</span>
            {/* End Date input */}
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => {
                setEndDateInput(e.target.value);
                applyFilters(startDateInput, e.target.value, filterCategory);
              }}
              className="px-2 py-1.5 text-sm text-gray-700 font-semibold border-none focus:outline-none cursor-pointer bg-white"
            />

            <button
              onClick={() => shiftDates(14)}
              className="px-2.5 py-2 hover:bg-gray-50 border-l border-gray-200 text-gray-500 transition-colors"
              title="Next 14 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center gap-1.5 border border-[#B8975A] text-[#B8975A] hover:bg-[#B8975A]/5 px-4 py-2 rounded text-xs font-bold transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            MANAGE BLOCKS
          </button>
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#B8975A] hover:bg-[#A8874A] text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            BLOCK INVENTORY
          </button>
        </div>
      </div>

      {/* ── Dynamic Grid Calendar ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[900px]">
            {/* Grid Days Header */}
            <div
              className="grid border-b border-gray-100 bg-[#1A2340] text-white py-3 text-center"
              style={{
                gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
              }}
            >
              {/* Row Month indicator */}
              <div className="text-left pl-6 font-bold tracking-[0.1em] text-xs uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B8975A]" />
                {datesList.length > 0 ? format(datesList[0], "MMMM yyyy") : ""}
              </div>
              {datesList.map((date) => (
                <div key={date.toISOString()} className="flex flex-col">
                  <span className="text-[10px] tracking-wider uppercase text-gray-400 font-bold">
                    {format(date, "eee")}
                  </span>
                  <span className="text-sm font-extrabold text-[#B8975A]">
                    {format(date, "d")}
                  </span>
                </div>
              ))}
            </div>

            {/* Category Inventories */}
            {categoriesToShow.map((cat) => {
              const roomsInCat = initialRooms.filter((r) => r.categoryId === cat.id);
              const roomsToSell = roomsInCat.length;

              return (
                <div key={cat.id} className="border-b border-gray-100 last:border-none">
                  {/* Category Section Header */}
                  <div className="bg-gray-50/60 px-6 py-2 flex items-center justify-between border-b border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2 font-medium">
                        (Total Rooms: {roomsToSell})
                      </span>
                    </div>
                    <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      Add availability Data updates twice per day.
                    </span>
                  </div>

                  {/* Calendar Row Stack */}
                  <div className="text-center text-sm font-semibold">
                    {/* Row 1: Room Status */}
                    <div
                      className="grid items-center border-b border-gray-50 py-2.5 hover:bg-gray-50/30 transition-colors"
                      style={{
                        gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
                      }}
                    >
                      <div className="text-left pl-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Room status
                      </div>
                      {datesList.map((date) => {
                        const dateMidnight = startOfDay(date);

                        // Bookings count on this date
                        const netBooked = initialBookings.filter((b) => {
                          const bs = startOfDay(parseISO(b.startDate));
                          const be = startOfDay(parseISO(b.endDate));
                          const inside = dateMidnight >= bs && dateMidnight <= be;
                          const hasCatRoom = b.rooms.some(
                            (br) => br.room.categoryId === cat.id
                          );
                          return inside && hasCatRoom;
                        }).length;

                        // Blocked count on this date
                        const blocked = initialBlockedRooms
                          .filter((b) => {
                            const bs = startOfDay(parseISO(b.startDate));
                            const be = startOfDay(parseISO(b.endDate));
                            return (
                              b.categoryId === cat.id &&
                              dateMidnight >= bs &&
                              dateMidnight <= be
                            );
                          })
                          .reduce((sum, b) => sum + b.count, 0);

                        const available = Math.max(0, roomsToSell - netBooked - blocked);
                        const isBookable = available > 0;

                        return (
                          <div key={date.toISOString()} className="px-1">
                            <span
                              className={`inline-block w-full py-1 text-[10px] font-bold tracking-wider rounded text-center border ${
                                isBookable
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                  : "bg-red-50 border-red-100 text-red-600"
                              }`}
                            >
                              {isBookable ? "Bookable" : "Sold Out"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 2: Rooms to Sell */}
                    <div
                      className="grid items-center border-b border-gray-50 py-2 hover:bg-gray-50/30 transition-colors text-gray-700"
                      style={{
                        gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
                      }}
                    >
                      <div className="text-left pl-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Rooms to sell
                      </div>
                      {datesList.map((date) => (
                        <div key={date.toISOString()} className="text-xs font-bold text-gray-500">
                          {roomsToSell}
                        </div>
                      ))}
                    </div>

                    {/* Row 3: Net Booked */}
                    <div
                      className="grid items-center border-b border-gray-50 py-2 hover:bg-gray-50/30 transition-colors"
                      style={{
                        gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
                      }}
                    >
                      <div className="text-left pl-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Net booked
                      </div>
                      {datesList.map((date) => {
                        const dateMidnight = startOfDay(date);
                        const netBooked = initialBookings.filter((b) => {
                          const bs = startOfDay(parseISO(b.startDate));
                          const be = startOfDay(parseISO(b.endDate));
                          const inside = dateMidnight >= bs && dateMidnight <= be;
                          const hasCatRoom = b.rooms.some(
                            (br) => br.room.categoryId === cat.id
                          );
                          return inside && hasCatRoom;
                        }).length;

                        return (
                          <div
                            key={date.toISOString()}
                            className="flex justify-center items-center"
                          >
                            {netBooked > 0 ? (
                              <span className="w-5 h-5 rounded-full bg-[#1A2340] text-white flex items-center justify-center font-bold text-[10px]">
                                {netBooked}
                              </span>
                            ) : (
                              <span className="text-gray-200 text-[10px] font-normal">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 4: Blocked */}
                    <div
                      className="grid items-center border-b border-gray-50 py-2 hover:bg-gray-50/30 transition-colors"
                      style={{
                        gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
                      }}
                    >
                      <div className="text-left pl-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Blocked
                      </div>
                      {datesList.map((date) => {
                        const dateMidnight = startOfDay(date);
                        const blocked = initialBlockedRooms
                          .filter((b) => {
                            const bs = startOfDay(parseISO(b.startDate));
                            const be = startOfDay(parseISO(b.endDate));
                            return (
                              b.categoryId === cat.id &&
                              dateMidnight >= bs &&
                              dateMidnight <= be
                            );
                          })
                          .reduce((sum, b) => sum + b.count, 0);

                        return (
                          <div
                            key={date.toISOString()}
                            className="font-bold text-xs"
                          >
                            {blocked > 0 ? (
                              <span className="text-orange-500 bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5">
                                {blocked}
                              </span>
                            ) : (
                              <span className="text-gray-300">0</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 5: Pricing */}
                    <div
                      className="grid items-center py-3 hover:bg-gray-50/30 transition-colors"
                      style={{
                        gridTemplateColumns: `220px repeat(${datesList.length}, 1fr)`,
                      }}
                    >
                      <div className="text-left pl-6 text-xs text-gray-500 font-bold uppercase tracking-wider flex flex-col justify-start">
                        <span>Fully flexible</span>
                        <span className="text-[9px] text-[#B8975A] font-medium tracking-normal leading-tight mt-0.5">
                          Base rate
                        </span>
                      </div>
                      {datesList.map((date) => (
                        <div
                          key={date.toISOString()}
                          className="text-xs font-extrabold text-gray-700"
                        >
                          ₹{cat.price.toLocaleString("en-IN")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-gray-300" />
        Synced live with Website & Front Desk booking engines.
      </p>

      {/* ── MODAL 1: Block Inventory Modal ── */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1A2340] text-white">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Block Room Inventory
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateBlock} className="p-6 flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Room Type
                </label>
                <select
                  value={blockCategory}
                  onChange={(e) => setBlockCategory(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B8975A] focus:outline-none"
                  required
                >
                  {initialCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start/End dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B8975A] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B8975A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Count */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Rooms to block
                </label>
                <input
                  type="number"
                  min="1"
                  value={blockCount}
                  onChange={(e) => setBlockCount(Number(e.target.value))}
                  className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B8975A] focus:outline-none"
                  required
                />
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Block Reason / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. AC Repair / Leak Maintenance"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B8975A] focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#B8975A] hover:bg-[#A8874A] disabled:bg-[#B8975A]/60 text-white rounded text-xs font-bold transition-colors"
                >
                  {loading ? "BLOCKING..." : "CONFIRM BLOCK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Manage Active Blocks Modal ── */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1A2340] text-white">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Manage Active Inventory Blocks
              </h3>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
              {initialBlockedRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
                  <p className="text-sm font-medium">No active room blocks created.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {initialBlockedRooms.map((block) => {
                    const blockCat = initialCategories.find(
                      (c) => c.id === block.categoryId
                    );
                    return (
                      <div
                        key={block.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                            {blockCat?.name || "Unknown room type"}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            Blocked Count: {block.count} room(s) &nbsp;·&nbsp; Stay:{" "}
                            {format(parseISO(block.startDate), "d MMM yyyy")} →{" "}
                            {format(parseISO(block.endDate), "d MMM yyyy")}
                          </span>
                          {block.reason && (
                            <span className="text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-0.5 mt-1 border border-amber-100 self-start">
                              Reason: {block.reason}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          disabled={loading}
                          className="p-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-all"
                          title="Remove block"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-bold transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
