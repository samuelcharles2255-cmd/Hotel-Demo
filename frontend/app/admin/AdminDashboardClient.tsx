"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession, type Guest } from "@/lib/authentication";
import AdminSecurityGate from "./AdminSecurityGate";
import type {
  AdminBooking,
  AdminCustomer,
  AdminHotel,
  AdminRoom,
  AdminRoomBlock,
  AdminRoomType,
} from "./types";
import {
  cancelStaffBooking,
  completeStaffBooking,
  confirmStaffBooking,
  createRoomBlock,
  deleteRoomBlock,
  fetchCustomers,
  fetchHotelProfile,
  fetchRoomBlocks,
  fetchRooms,
  fetchRoomTypes,
  fetchStaffBookings,
  updateCustomer,
  updateRoom,
  updateRoomType,
} from "./api";

type Tab = "overview" | "bookings" | "rooms" | "rates" | "customers" | "property";

export default function AdminDashboardClient() {
  const { guest, ready, signOut } = useSession();
  const [currentUser, setCurrentUser] = useState<Guest | null>(guest);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data sets
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [roomBlocks, setRoomBlocks] = useState<AdminRoomBlock[]>([]);
  const [roomTypes, setRoomTypes] = useState<AdminRoomType[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [hotel, setHotel] = useState<AdminHotel | null>(null);

  // Filters & Search
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");

  // Modals & Action States
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<AdminBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New Block Form state
  const [blockRoomId, setBlockRoomId] = useState<number | "">("");
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Rate Editor state
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");

  useEffect(() => {
    if (guest) setCurrentUser(guest);
  }, [guest]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Fetch all administrative data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        loadedBookings,
        loadedRooms,
        loadedBlocks,
        loadedTypes,
        loadedCustomers,
        loadedHotel,
      ] = await Promise.all([
        fetchStaffBookings().catch(() => []),
        fetchRooms().catch(() => []),
        fetchRoomBlocks().catch(() => []),
        fetchRoomTypes().catch(() => []),
        fetchCustomers().catch(() => []),
        fetchHotelProfile().catch(() => null),
      ]);

      setBookings(loadedBookings);
      setRooms(loadedRooms);
      setRoomBlocks(loadedBlocks);
      setRoomTypes(loadedTypes);
      setCustomers(loadedCustomers);
      setHotel(loadedHotel);
    } catch {
      showToast("Could not synchronize data with backend server.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (currentUser && (currentUser.role === "admin" || currentUser.role === "staff")) {
      loadAllData();
    }
  }, [currentUser, refreshKey, loadAllData]);

  // Authorization check
  const isAuthorized =
    currentUser && (currentUser.role === "admin" || currentUser.role === "staff");

  // Formatting helpers
  const formatTsh = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "TSH 0";
    return `TSH ${Math.round(num).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (parseFloat(String(b.total_amount)) || 0), 0);

    const totalPhysicalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const maintenanceRooms = rooms.filter((r) => r.status === "maintenance").length;
    const occupancyRate =
      totalPhysicalRooms > 0
        ? Math.round((occupiedRooms / totalPhysicalRooms) * 100)
        : 0;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
      totalPhysicalRooms,
      occupiedRooms,
      maintenanceRooms,
      occupancyRate,
    };
  }, [bookings, rooms]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesFilter =
        bookingFilter === "all" ? true : b.status === bookingFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.reference.toLowerCase().includes(q) ||
        b.customer_email?.toLowerCase().includes(q) ||
        b.room_type_name.toLowerCase().includes(q) ||
        b.guests.some(
          (g) =>
            g.first_name.toLowerCase().includes(q) ||
            g.last_name.toLowerCase().includes(q) ||
            g.email.toLowerCase().includes(q) ||
            g.phone.includes(q)
        );
      return matchesFilter && matchesQuery;
    });
  }, [bookings, bookingFilter, searchQuery]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, customerSearch]);

  // Booking Actions
  async function handleConfirm(reference: string) {
    setIsSubmitting(true);
    try {
      const updated = await confirmStaffBooking(reference);
      setBookings((prev) =>
        prev.map((b) => (b.reference === reference ? updated : b))
      );
      if (selectedBooking?.reference === reference) setSelectedBooking(updated);
      showToast(`Booking ${reference} has been successfully CONFIRMED.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(reference: string) {
    setIsSubmitting(true);
    try {
      const updated = await completeStaffBooking(reference);
      setBookings((prev) =>
        prev.map((b) => (b.reference === reference ? updated : b))
      );
      if (selectedBooking?.reference === reference) setSelectedBooking(updated);
      showToast(`Booking ${reference} marked as COMPLETED.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelModalBooking) return;
    setIsSubmitting(true);
    try {
      const res = await cancelStaffBooking(cancelModalBooking.reference, cancelReason);
      setBookings((prev) =>
        prev.map((b) =>
          b.reference === cancelModalBooking.reference ? res.booking : b
        )
      );
      if (selectedBooking?.reference === cancelModalBooking.reference) {
        setSelectedBooking(res.booking);
      }
      showToast(`Booking ${cancelModalBooking.reference} has been CANCELLED.`);
      setCancelModalBooking(null);
      setCancelReason("");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Room status toggle
  async function handleToggleRoomStatus(room: AdminRoom) {
    const newStatus = room.status === "available" ? "maintenance" : "available";
    try {
      const updated = await updateRoom(room.id, { status: newStatus });
      setRooms((prev) => prev.map((r) => (r.id === room.id ? updated : r)));
      showToast(`Room ${room.number} is now marked ${newStatus.toUpperCase()}.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  }

  // Create Room Block
  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!blockRoomId || !blockStartDate || !blockEndDate) {
      showToast("Please fill in room and date range.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createRoomBlock({
        room: Number(blockRoomId),
        start_date: blockStartDate,
        end_date: blockEndDate,
        reason: blockReason.trim() || "Routine inspection & maintenance",
      });
      setRoomBlocks((prev) => [created, ...prev]);
      setBlockRoomId("");
      setBlockStartDate("");
      setBlockEndDate("");
      setBlockReason("");
      showToast("Maintenance block scheduled successfully.");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete Room Block
  async function handleDeleteBlock(id: number) {
    try {
      await deleteRoomBlock(id);
      setRoomBlocks((prev) => prev.filter((b) => b.id !== id));
      showToast("Room maintenance block removed.");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  }

  // Update Room Type Rate
  async function handleSaveRate(typeId: number) {
    const parsed = parseFloat(editingPrice);
    if (isNaN(parsed) || parsed <= 0) {
      showToast("Please specify a valid positive rate in TSH.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await updateRoomType(typeId, { base_price: parsed });
      setRoomTypes((prev) => prev.map((t) => (t.id === typeId ? updated : t)));
      setEditingRateId(null);
      setEditingPrice("");
      showToast(`Rate updated to ${formatTsh(parsed)}/night.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Customer status toggle
  async function handleToggleCustomer(customer: AdminCustomer) {
    const nextStatus = !customer.is_active;
    try {
      const updated = await updateCustomer(customer.id, { is_active: nextStatus });
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? updated : c))
      );
      showToast(
        `User ${customer.email} ${nextStatus ? "reactivated" : "suspended"}.`
      );
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal text-ivory">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-copper border-t-transparent rounded-full animate-spin" />
          <p className="eyebrow text-copper-light tracking-[0.3em]">
            AETHER Core Initializing…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <AdminSecurityGate onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#110f0d] text-ivory flex flex-col font-sans selection:bg-copper/30">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
            toast.type === "success"
              ? "bg-[#182318]/95 border-emerald-500/40 text-emerald-200"
              : "bg-[#281414]/95 border-red-500/40 text-red-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span className="text-xs tracking-wide font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 border-b border-ivory/10 bg-[#16120e]/95 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="display text-xl sm:text-2xl tracking-[0.3em] text-ivory group-hover:text-white transition-colors">
                AETHER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-copper" />
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-ivory/15" />

            <div className="hidden sm:flex flex-col">
              <span className="eyebrow text-copper-light text-[10px] tracking-[0.25em]">
                Mbeya Estate Management
              </span>
              <span className="text-[11px] text-ivory/50 font-light">
                Hospital Hill Rd &bull; Live Operations
              </span>
            </div>
          </div>

          {/* Right Status & Identity */}
          <div className="flex items-center gap-4">
            {/* System Online Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Django Synced</span>
            </div>

            {/* Current Admin user */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-ivory/5 border border-ivory/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-copper/20 border border-copper/40 flex items-center justify-center text-[10px] font-bold text-copper-light">
                {currentUser?.first_name?.[0] || "A"}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-ivory leading-tight text-[11px]">
                  {currentUser?.first_name} {currentUser?.last_name}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-copper-light font-mono">
                  {currentUser?.role} Clearance
                </span>
              </div>
            </div>

            {/* Quick Public Site Link */}
            <Link
              href="/"
              target="_blank"
              title="Open public hotel website in new tab"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-ivory/60 hover:text-ivory border border-ivory/10 hover:border-ivory/25 transition-colors"
            >
              <span>Public Site</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            {/* Sign Out */}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setCurrentUser(null);
              }}
              className="px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-[11px] transition-colors font-light"
            >
              Lock / Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-ivory/10 pb-4 overflow-x-auto gap-2">
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { id: "bookings", label: `Bookings (${bookings.length})`, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { id: "rooms", label: `Rooms & Blocks (${rooms.length})`, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { id: "rates", label: `Rates & Types (${roomTypes.length})`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { id: "customers", label: `Guests (${customers.length})`, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { id: "property", label: "Property & Mbeya", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-copper/20 text-copper-light border border-copper/40 shadow-[0_0_20px_rgba(192,122,58,0.2)] font-medium"
                    : "text-ivory/60 hover:text-ivory hover:bg-ivory/5 border border-transparent"
                }`}
              >
                <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            title="Reload live database values"
            className="px-3 py-2 rounded-xl border border-ivory/15 bg-ivory/5 hover:bg-ivory/10 text-ivory/70 hover:text-ivory text-xs flex items-center gap-1.5 transition-all"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>

        {/* ----------------------------------------------------- TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass-deep rounded-2xl p-5 border border-ivory/10 flex flex-col">
                <span className="eyebrow text-ivory/40 text-[10px]">Total Bookings</span>
                <span className="display text-3xl text-ivory mt-2 num">{stats.total}</span>
                <span className="text-[11px] text-ivory/50 mt-1">Recorded in system</span>
              </div>

              <div className="glass-deep rounded-2xl p-5 border border-amber-500/20 bg-amber-950/10 flex flex-col">
                <span className="eyebrow text-amber-400 text-[10px]">Active Holds</span>
                <span className="display text-3xl text-amber-300 mt-2 num">{stats.pending}</span>
                <span className="text-[11px] text-amber-400/70 mt-1">Awaiting confirmation</span>
              </div>

              <div className="glass-deep rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10 flex flex-col">
                <span className="eyebrow text-emerald-400 text-[10px]">Confirmed Stays</span>
                <span className="display text-3xl text-emerald-300 mt-2 num">{stats.confirmed}</span>
                <span className="text-[11px] text-emerald-400/70 mt-1">Guaranteed rooms</span>
              </div>

              <div className="glass-deep rounded-2xl p-5 border border-blue-500/20 bg-blue-950/10 flex flex-col">
                <span className="eyebrow text-blue-400 text-[10px]">Completed</span>
                <span className="display text-3xl text-blue-300 mt-2 num">{stats.completed}</span>
                <span className="text-[11px] text-blue-400/70 mt-1">Past checked-out stays</span>
              </div>

              <div className="glass-deep rounded-2xl p-5 border border-copper/30 bg-copper-deep/10 flex flex-col col-span-2 sm:col-span-1 lg:col-span-1">
                <span className="eyebrow text-copper-light text-[10px]">Occupancy</span>
                <span className="display text-3xl text-copper-light mt-2 num">{stats.occupancyRate}%</span>
                <span className="text-[11px] text-ivory/50 mt-1">{stats.occupiedRooms} of {stats.totalPhysicalRooms} rooms occupied</span>
              </div>

              <div className="glass-deep rounded-2xl p-5 border border-copper/40 bg-copper/10 flex flex-col col-span-2 sm:col-span-1 lg:col-span-1">
                <span className="eyebrow text-copper-light text-[10px]">Total Revenue</span>
                <span className="display text-xl text-white mt-2 num font-semibold">
                  {formatTsh(stats.totalRevenue)}
                </span>
                <span className="text-[11px] text-copper-light/80 mt-1">Confirmed + Completed</span>
              </div>
            </div>

            {/* Quick Attention & Recent Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Urgent Holds Section */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10 lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="display text-xl text-ivory">Pending Reservations Needing Action</h2>
                    <p className="text-xs text-ivory/50">Guests awaiting review or payment clearance</p>
                  </div>
                  <button
                    onClick={() => {
                      setBookingFilter("pending");
                      setActiveTab("bookings");
                    }}
                    className="text-xs text-copper-light hover:underline"
                  >
                    View All Holds &rarr;
                  </button>
                </div>

                {bookings.filter((b) => b.status === "pending").length === 0 ? (
                  <div className="py-12 text-center text-ivory/40 text-xs">
                    No pending bookings waiting for staff attention.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[360px]">
                    {bookings
                      .filter((b) => b.status === "pending")
                      .slice(0, 5)
                      .map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-xl bg-ivory/5 border border-ivory/10 hover:border-copper/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-copper-light font-bold">
                                {b.reference}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 uppercase">
                                Hold Pending
                              </span>
                            </div>
                            <p className="text-sm font-medium text-ivory mt-1">
                              {b.guests?.[0]
                                ? `${b.guests[0].first_name} ${b.guests[0].last_name}`
                                : b.customer_email || "Valued Guest"}
                            </p>
                            <p className="text-xs text-ivory/50 mt-0.5">
                              {b.room_type_name} &bull; {formatDate(b.check_in)} &rarr; {formatDate(b.check_out)} ({b.nights} nights)
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="text-sm font-medium text-white mr-2">
                              {formatTsh(b.total_amount)}
                            </span>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleConfirm(b.reference)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              disabled={isSubmitting}
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-lg bg-ivory/10 hover:bg-ivory/15 text-ivory text-xs transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Physical Inventory Quick Card */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10 flex flex-col">
                <h2 className="display text-xl text-ivory">Inventory Status</h2>
                <p className="text-xs text-ivory/50 mb-4">Mbeya physical room overview</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="text-xs text-ivory/70">Available Suites</span>
                    <span className="font-mono text-sm text-emerald-400 font-bold">
                      {rooms.filter((r) => r.status === "available").length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="text-xs text-ivory/70">Occupied Stays</span>
                    <span className="font-mono text-sm text-blue-400 font-bold">
                      {rooms.filter((r) => r.status === "occupied").length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="text-xs text-ivory/70">Maintenance / Blocked</span>
                    <span className="font-mono text-sm text-amber-400 font-bold">
                      {rooms.filter((r) => r.status === "maintenance").length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="text-xs text-ivory/70">Active Room Blocks</span>
                    <span className="font-mono text-sm text-copper-light font-bold">
                      {roomBlocks.length}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => setActiveTab("rooms")}
                    className="btn btn-ghost w-full text-xs text-copper-light border-copper/30 hover:border-copper"
                  >
                    Manage Room Allocations &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- TAB: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="glass-deep rounded-2xl p-5 border border-ivory/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
                {[
                  { key: "all", label: "All Bookings", count: bookings.length },
                  { key: "pending", label: "Pending", count: stats.pending },
                  { key: "confirmed", label: "Confirmed", count: stats.confirmed },
                  { key: "completed", label: "Completed", count: stats.completed },
                  { key: "cancelled", label: "Cancelled", count: stats.cancelled },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setBookingFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all whitespace-nowrap ${
                      bookingFilter === f.key
                        ? "bg-copper text-white font-medium shadow-md"
                        : "bg-ivory/5 text-ivory/60 hover:text-ivory"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reference, guest, email…"
                  className="w-full px-4 py-2 pl-9 rounded-xl bg-ivory/5 border border-ivory/15 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
                <svg
                  className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ivory/40 hover:text-ivory"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-deep rounded-2xl border border-ivory/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory/5 border-b border-ivory/10 text-ivory/50 eyebrow text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Reference</th>
                      <th className="px-5 py-3.5">Primary Guest</th>
                      <th className="px-5 py-3.5">Suite / Room</th>
                      <th className="px-5 py-3.5">Dates (Nights)</th>
                      <th className="px-5 py-3.5">Total (TSH)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory/5 font-light">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-ivory/40">
                          No reservations match the specified filter or query.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const guestName = b.guests?.[0]
                          ? `${b.guests[0].first_name} ${b.guests[0].last_name}`
                          : b.customer_email || "Direct Guest";

                        return (
                          <tr key={b.id} className="hover:bg-ivory/[0.03] transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono text-copper-light font-bold">
                                {b.reference}
                              </span>
                              <div className="text-[10px] text-ivory/30">
                                {formatDate(b.created_at)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-ivory">{guestName}</div>
                              <div className="text-[11px] text-ivory/50">
                                {b.guests?.[0]?.email || b.customer_email}
                              </div>
                              {b.guests?.[0]?.phone && (
                                <div className="text-[10px] text-ivory/40 font-mono">
                                  {b.guests[0].phone}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-ivory font-medium">{b.room_type_name}</div>
                              <div className="text-[11px] text-ivory/50">
                                {b.room_number ? `Room #${b.room_number}` : "Auto-assigned upon check-in"}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-ivory">
                                {formatDate(b.check_in)} &rarr; {formatDate(b.check_out)}
                              </div>
                              <div className="text-[10px] text-ivory/40">
                                {b.nights} {b.nights === 1 ? "night" : "nights"} &bull; {b.adults} adult{b.adults > 1 ? "s" : ""}{b.children > 0 ? `, ${b.children} child` : ""}
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono font-medium text-white">
                              {formatTsh(b.total_amount)}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider ${
                                  b.status === "confirmed"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : b.status === "completed"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : b.status === "cancelled"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="px-2.5 py-1 rounded bg-ivory/10 hover:bg-ivory/20 text-ivory text-[11px] transition-colors"
                                  title="View full reservation details"
                                >
                                  Details
                                </button>

                                {b.status === "pending" && (
                                  <button
                                    onClick={() => handleConfirm(b.reference)}
                                    disabled={isSubmitting}
                                    className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-[11px] transition-colors"
                                    title="Confirm booking"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {b.status === "confirmed" && (
                                  <button
                                    onClick={() => handleComplete(b.reference)}
                                    disabled={isSubmitting}
                                    className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-[11px] transition-colors"
                                    title="Mark completed (checkout)"
                                  >
                                    Complete
                                  </button>
                                )}

                                {b.status !== "cancelled" && b.status !== "completed" && (
                                  <button
                                    onClick={() => {
                                      setCancelModalBooking(b);
                                      setCancelReason("");
                                    }}
                                    disabled={isSubmitting}
                                    className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-[11px] transition-colors"
                                    title="Cancel booking"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- TAB: ROOMS & BLOCKS */}
        {activeTab === "rooms" && (
          <div className="space-y-8 animate-fade-in">
            {/* Physical Room Grid */}
            <div className="glass-deep rounded-2xl p-6 border border-ivory/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="display text-2xl text-ivory">Physical Room Grid</h2>
                  <p className="text-xs text-ivory/50">
                    Live status and maintenance allocation across floors
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Maintenance</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {rooms.map((room) => {
                  const type = roomTypes.find((t) => t.id === room.room_type);
                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        room.status === "available"
                          ? "bg-emerald-950/15 border-emerald-500/25 hover:border-emerald-500/50"
                          : room.status === "occupied"
                          ? "bg-blue-950/15 border-blue-500/25 hover:border-blue-500/50"
                          : "bg-amber-950/15 border-amber-500/25 hover:border-amber-500/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-ivory/50">
                            Fl. {room.floor}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              room.status === "available"
                                ? "bg-emerald-400"
                                : room.status === "occupied"
                                ? "bg-blue-400"
                                : "bg-amber-400"
                            }`}
                          />
                        </div>
                        <div className="font-mono text-xl font-bold text-white mt-1">
                          #{room.number}
                        </div>
                        <div className="text-[11px] text-ivory/60 truncate mt-1">
                          {type?.name || "Suite"}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ivory/10 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">
                          {room.status}
                        </span>
                        <button
                          onClick={() => handleToggleRoomStatus(room)}
                          title="Toggle Available / Maintenance"
                          className="text-[10px] text-copper-light hover:underline font-mono"
                        >
                          {room.status === "available" ? "Set Maint." : "Set Free"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Maintenance Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form: Add Block */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10">
                <h3 className="display text-xl text-ivory mb-1">Schedule Maintenance Block</h3>
                <p className="text-xs text-ivory/50 mb-5">
                  Block a room for dates to prevent double booking during repairs or VIP holds
                </p>

                <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
                  <div>
                    <label className="block eyebrow text-ivory/50 text-[10px] mb-1.5">
                      Target Room
                    </label>
                    <select
                      value={blockRoomId}
                      onChange={(e) => setBlockRoomId(Number(e.target.value) || "")}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-xs focus:outline-none focus:border-copper"
                    >
                      <option value="">Select Room Number…</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id} className="bg-charcoal text-ivory">
                          Room #{r.number} (Floor {r.floor})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block eyebrow text-ivory/50 text-[10px] mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={blockStartDate}
                        onChange={(e) => setBlockStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-xs focus:outline-none focus:border-copper"
                      />
                    </div>
                    <div>
                      <label className="block eyebrow text-ivory/50 text-[10px] mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={blockEndDate}
                        onChange={(e) => setBlockEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-xs focus:outline-none focus:border-copper"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block eyebrow text-ivory/50 text-[10px] mb-1.5">
                      Reason / Notes
                    </label>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g. HVAC maintenance, VIP inspection"
                      className="w-full px-3 py-2 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-xs focus:outline-none focus:border-copper"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-copper btn-sheen w-full text-xs mt-2"
                  >
                    Lock Room for Dates
                  </button>
                </form>
              </div>

              {/* Table of Active Blocks */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10 lg:col-span-2 flex flex-col">
                <h3 className="display text-xl text-ivory mb-1">Active &amp; Scheduled Blocks</h3>
                <p className="text-xs text-ivory/50 mb-5">
                  Rooms unavailable to guest availability searches
                </p>

                {roomBlocks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-ivory/40 text-xs py-8">
                    No active maintenance blocks registered. All rooms are in normal rotation.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[380px]">
                    {roomBlocks.map((blk) => {
                      const roomObj = rooms.find((r) => r.id === blk.room);
                      return (
                        <div
                          key={blk.id}
                          className="p-3.5 rounded-xl bg-ivory/5 border border-ivory/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white font-bold">
                                Room #{roomObj?.number || blk.room}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                                {formatDate(blk.start_date)} &rarr; {formatDate(blk.end_date)}
                              </span>
                            </div>
                            <p className="text-ivory/60 mt-1">{blk.reason}</p>
                          </div>

                          <button
                            onClick={() => handleDeleteBlock(blk.id)}
                            className="px-2.5 py-1 rounded border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-[11px] transition-colors"
                          >
                            Release Block
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- TAB: RATES & TYPES */}
        {activeTab === "rates" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-deep rounded-2xl p-6 border border-ivory/10">
              <div className="mb-6">
                <h2 className="display text-2xl text-ivory">Suite Rates &amp; Specifications</h2>
                <p className="text-xs text-ivory/50">
                  Update base prices per night in Tanzanian Shilling (TSH) and inspect capacities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomTypes.map((t) => {
                  const isEditing = editingRateId === t.id;
                  const primaryImage =
                    t.images?.find((img) => img.is_primary)?.image ||
                    t.images?.[0]?.image ||
                    "/hotel_images/02_twin_executive_suite.jpg";

                  return (
                    <div
                      key={t.id}
                      className="glass rounded-2xl p-5 border border-ivory/10 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image preview */}
                        <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-charcoal-deep">
                          <img
                            src={primaryImage}
                            alt={t.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-ivory font-mono">
                            Max {t.max_adults} Adults, {t.max_children} Children
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="display text-xl text-ivory">{t.name}</h3>
                            <p className="text-xs text-ivory/60 mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          </div>
                        </div>

                        {/* Bed config & Amenities */}
                        <div className="mt-4 pt-3 border-t border-ivory/10 flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-ivory/5 text-[10px] text-ivory/70 font-mono">
                            Bed: {t.bed_configuration}
                          </span>
                          {t.amenities?.slice(0, 3).map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-ivory/5 text-[10px] text-ivory/60"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price Editor Bar */}
                      <div className="mt-6 pt-4 border-t border-ivory/10 flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ivory/40">
                                TSH
                              </span>
                              <input
                                type="number"
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(e.target.value)}
                                className="w-full pl-12 pr-3 py-1.5 rounded-lg bg-ivory/10 border border-copper text-xs text-ivory focus:outline-none"
                                placeholder="e.g. 450000"
                              />
                            </div>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleSaveRate(t.id)}
                              className="px-3 py-1.5 rounded-lg bg-copper hover:bg-copper-light text-white text-xs transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRateId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-ivory/5 text-ivory/60 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="eyebrow text-ivory/40 text-[9px]">Rate / Night</span>
                              <div className="text-lg font-mono font-bold text-copper-light">
                                {formatTsh(t.base_price)}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingRateId(t.id);
                                setEditingPrice(String(t.base_price));
                              }}
                              className="px-3 py-1.5 rounded-lg border border-copper/40 bg-copper/10 hover:bg-copper/20 text-copper-light text-xs transition-colors font-medium"
                            >
                              Modify Rate
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- TAB: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-6 animate-fade-in">
            {/* Customer Search & Header */}
            <div className="glass-deep rounded-2xl p-5 border border-ivory/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="display text-xl text-ivory">Registered Guest Directory</h2>
                <p className="text-xs text-ivory/50">
                  {customers.length} verified and active customer accounts
                </p>
              </div>

              <div className="relative min-w-[280px]">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Filter by name, email, phone…"
                  className="w-full px-4 py-2 pl-9 rounded-xl bg-ivory/5 border border-ivory/15 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
                <svg
                  className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Customers Table */}
            <div className="glass-deep rounded-2xl border border-ivory/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory/5 border-b border-ivory/10 text-ivory/50 eyebrow text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Guest Identity</th>
                      <th className="px-5 py-3.5">Contact Details</th>
                      <th className="px-5 py-3.5">Verification</th>
                      <th className="px-5 py-3.5">Member Since</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory/5 font-light">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-ivory/40">
                          No registered guests match your query.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-ivory/[0.03] transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-medium text-ivory">
                              {cust.first_name} {cust.last_name}
                            </div>
                            <div className="text-[10px] text-ivory/30 font-mono">
                              User ID #{cust.id}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-ivory">{cust.email}</div>
                            {cust.phone && (
                              <div className="text-[11px] text-ivory/50 font-mono">
                                {cust.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {cust.email_verified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-ivory/40">Unverified</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-ivory/60">
                            {formatDate(cust.date_joined)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider ${
                                cust.is_active
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {cust.is_active ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleCustomer(cust)}
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                cust.is_active
                                  ? "border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300"
                                  : "border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300"
                              }`}
                            >
                              {cust.is_active ? "Suspend Access" : "Reactivate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- TAB: PROPERTY & MBEYA */}
        {activeTab === "property" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hotel Metadata Card */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/15 border border-copper/30 text-copper-light text-[11px] mb-3">
                    Specialty Lodging #10 of 12 in Mbeya
                  </div>
                  <h2 className="display text-3xl text-ivory">
                    {hotel?.name || "AETHER Luxury Hotel"}
                  </h2>
                  <p className="text-xs text-ivory/60 mt-1">
                    {hotel?.address || "Hospital Hill Rd, 4C5R+R3H"}, Mbeya, Tanzania
                  </p>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ivory/10 text-center">
                  <div className="p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="eyebrow text-ivory/40 text-[9px]">Rooms</span>
                    <div className="display text-2xl text-copper-light mt-1">5.0</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="eyebrow text-ivory/40 text-[9px]">Value</span>
                    <div className="display text-2xl text-copper-light mt-1">5.0</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ivory/5 border border-ivory/10">
                    <span className="eyebrow text-ivory/40 text-[9px]">Service</span>
                    <div className="display text-2xl text-copper-light mt-1">4.0</div>
                  </div>
                </div>

                {/* Operations Info */}
                <div className="space-y-3 pt-4 border-t border-ivory/10 text-xs">
                  <div className="flex justify-between py-1 border-b border-ivory/5">
                    <span className="text-ivory/50">Primary Contact Phone</span>
                    <span className="font-mono text-ivory">{hotel?.phone || "+255 754 123 456"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ivory/5">
                    <span className="text-ivory/50">Official Desk Email</span>
                    <span className="text-ivory">{hotel?.email || "reservations@aether-collection.com"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ivory/5">
                    <span className="text-ivory/50">Standard Check-In Hour</span>
                    <span className="font-mono text-ivory">{hotel?.check_in_time || "14:00:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ivory/5">
                    <span className="text-ivory/50">Standard Check-Out Hour</span>
                    <span className="font-mono text-ivory">{hotel?.check_out_time || "11:00:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ivory/5">
                    <span className="text-ivory/50">Operational Currency</span>
                    <span className="font-mono text-copper-light font-bold">TSH (Tanzanian Shillings)</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div className="pt-4 border-t border-ivory/10">
                  <span className="eyebrow text-ivory/40 text-[10px] block mb-3">
                    Featured Amenities
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-ivory/70">
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Free parking
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> High Speed WiFi
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Hot tub
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Bar / lounge
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Children Activities
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Airport transport
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-copper-light">&check;</span> Meeting rooms
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Maps Live Card */}
              <div className="glass-deep rounded-2xl p-6 border border-ivory/10 flex flex-col">
                <div className="mb-4">
                  <h3 className="display text-xl text-ivory">Mbeya Location Map</h3>
                  <p className="text-xs text-ivory/50">
                    Hospital Hill Rd &bull; Coordinates 4C5R+R3H, Mbeya
                  </p>
                </div>

                <div className="relative flex-1 min-h-[360px] rounded-xl overflow-hidden border border-ivory/15 shadow-inner">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.8821814491803!2d33.43838671435692!3d-8.890544900000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19aa75551bca87b1%3A0x2b8326a6eac6fa57!2s4C5R%2BR3H%2C%20Hospital%20Hill%20Rd%2C%20Mbeya!5e0!3m2!1sen!2stz!4v1792060197828!5m2!1sen!2stz"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 w-full h-full filter invert-[0.9] hue-rotate-180 contrast-125 brightness-90"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------- MODAL: RESERVATION DETAILS */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-deep rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-ivory/20 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center text-lg"
            >
              &times;
            </button>

            <div className="mb-6">
              <span className="eyebrow text-copper-light text-[11px]">
                Reservation Audit File
              </span>
              <h2 className="display text-2xl sm:text-3xl text-ivory mt-1">
                Ref: {selectedBooking.reference}
              </h2>
              <p className="text-xs text-ivory/50 font-mono mt-0.5">
                Token UUID: {selectedBooking.access_token}
              </p>
            </div>

            <div className="space-y-6 text-xs">
              {/* Status and Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-ivory/5 border border-ivory/10">
                <div>
                  <span className="text-ivory/40 block text-[10px] uppercase">Status</span>
                  <span className="font-mono text-sm font-bold uppercase text-copper-light">
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <span className="text-ivory/40 block text-[10px] uppercase">Check-In</span>
                  <span className="font-medium text-white">
                    {formatDate(selectedBooking.check_in)}
                  </span>
                </div>
                <div>
                  <span className="text-ivory/40 block text-[10px] uppercase">Check-Out</span>
                  <span className="font-medium text-white">
                    {formatDate(selectedBooking.check_out)}
                  </span>
                </div>
                <div>
                  <span className="text-ivory/40 block text-[10px] uppercase">Duration</span>
                  <span className="font-medium text-white">
                    {selectedBooking.nights} Nights
                  </span>
                </div>
              </div>

              {/* Guest occupants */}
              <div>
                <h3 className="eyebrow text-ivory/50 text-[11px] mb-3">Guest List</h3>
                <div className="space-y-2">
                  {selectedBooking.guests?.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-ivory/5 border border-ivory/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {g.first_name} {g.last_name}
                          {g.is_primary && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-copper/20 text-copper-light uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ivory/50">{g.email}</div>
                      </div>
                      <div className="font-mono text-ivory/70">{g.phone || "No phone"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suite & Room Allocation */}
              <div className="p-4 rounded-xl bg-ivory/5 border border-ivory/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-ivory/50">Allocated Suite Type</span>
                  <span className="font-medium text-white">{selectedBooking.room_type_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/50">Physical Room Number</span>
                  <span className="font-mono font-bold text-copper-light">
                    {selectedBooking.room_number ? `#${selectedBooking.room_number}` : "Assigned at front desk"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/50">Special Guest Requests</span>
                  <span className="text-ivory text-right max-w-xs italic">
                    {selectedBooking.special_requests || "None specified"}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl bg-copper/10 border border-copper/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-ivory/70">Rate per night</span>
                  <span className="font-mono">{formatTsh(selectedBooking.price_per_night)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ivory/70">Nights</span>
                  <span className="font-mono">&times; {selectedBooking.nights}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-copper/30">
                  <span>Total Amount</span>
                  <span className="font-mono text-copper-light text-base">
                    {formatTsh(selectedBooking.total_amount)}
                  </span>
                </div>
              </div>

              {/* Cancellation detail if cancelled */}
              {selectedBooking.status === "cancelled" && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300">
                  <span className="font-bold text-[11px] block uppercase">Cancellation Audit</span>
                  <p className="mt-1">
                    Cancelled at: {selectedBooking.cancelled_at ? formatDate(selectedBooking.cancelled_at) : "N/A"}
                  </p>
                  <p className="mt-0.5">Reason: {selectedBooking.cancellation_reason || "No reason given"}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory/10">
                {selectedBooking.status === "pending" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleConfirm(selectedBooking.reference)}
                    className="btn btn-copper btn-sheen text-xs !py-2.5 !px-5"
                  >
                    Confirm Reservation
                  </button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleComplete(selectedBooking.reference)}
                    className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => {
                      setCancelModalBooking(selectedBooking);
                      setCancelReason("");
                    }}
                    className="px-4 py-2.5 rounded-full border border-red-500/40 bg-red-950/30 hover:bg-red-950/50 text-red-200 text-xs font-medium"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2.5 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------- MODAL: CANCEL PROMPT */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-deep rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-500/30 shadow-2xl relative">
            <h3 className="display text-2xl text-red-300">
              Cancel Booking {cancelModalBooking.reference}
            </h3>
            <p className="text-xs text-ivory/60 mt-1">
              Please document the cancellation rationale. This action releases held room inventory.
            </p>

            <form onSubmit={handleCancelSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block eyebrow text-ivory/50 text-[10px] mb-1.5">
                  Cancellation Reason
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Guest requested cancellation via telephone; Flight rescheduled."
                  className="w-full px-3 py-2 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-xs focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 rounded-xl bg-ivory/10 text-ivory text-xs hover:bg-ivory/20"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-lg"
                >
                  {isSubmitting ? "Cancelling…" : "Execute Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

