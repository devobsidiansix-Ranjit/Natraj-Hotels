import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, RefreshCw, Wifi } from "lucide-react";
import { Booking, BookingRoom, Room, User } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingWithRelations = Booking & {
  user: User;
  rooms: (BookingRoom & { room: Room })[];
};

type OperationalStatus =
  | "CONFIRMED"
  | "CHECKED-IN"
  | "COMPLETED"
  | "CANCELLED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOperationalStatus(booking: BookingWithRelations): OperationalStatus {
  if (booking.status === "Cancelled") return "CANCELLED";
  if (booking.status === "Completed") return "COMPLETED";

  const now = new Date();
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);

  // Normalise to midnight for date-only comparisons
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (startMidnight <= todayMidnight && endMidnight >= todayMidnight) return "CHECKED-IN";
  if (startMidnight > todayMidnight) return "CONFIRMED";
  return "COMPLETED";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  gradient,
}: {
  title: string;
  value: number;
  gradient: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-6 px-4 text-white ${gradient}`}
    >
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-90 mb-1">
        {title}
      </p>
      <p className="text-5xl font-bold leading-none">{value}</p>
    </div>
  );
}

function SystemSyncCard() {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 bg-white border-l border-gray-200">
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">
        System Sync
      </p>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-sm font-semibold text-gray-700">LIVE</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OperationalStatus }) {
  const styles: Record<OperationalStatus, string> = {
    CONFIRMED: "bg-amber-500 text-white",
    "CHECKED-IN": "bg-emerald-500 text-white",
    COMPLETED: "bg-gray-400 text-white",
    CANCELLED: "bg-red-500 text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SourceBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold tracking-wider border ${
        isOnline
          ? "border-sky-300 text-sky-600 bg-sky-50"
          : "border-violet-300 text-violet-600 bg-violet-50"
      }`}
    >
      {isOnline ? "WEBSITE" : "WALK-IN"}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FrontDeskPage() {
  // ── Data fetching ────────────────────────────────────────────────────────

  const [allBookings, totalRooms, categories] = await Promise.all([
    prismadb.booking.findMany({
      include: {
        user: true,
        rooms: { include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<BookingWithRelations[]>,
    prismadb.room.count(),
    prismadb.category.findMany(),
  ]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const activeBookings = allBookings.filter(
    (b) => b.status !== "Cancelled"
  );

  const checkIns = activeBookings.filter((b) => {
    const s = new Date(b.startDate);
    const sm = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    return b.status === "Booked" && sm.getTime() === todayMidnight.getTime();
  }).length;

  const checkOuts = activeBookings.filter((b) => {
    const e = new Date(b.endDate);
    const em = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    return em.getTime() === todayMidnight.getTime();
  }).length;

  const inHouseBookings = activeBookings.filter((b) => {
    const s = new Date(b.startDate);
    const e = new Date(b.endDate);
    return b.status === "Booked" && s <= todayEnd && e >= todayMidnight;
  });

  const inHouseCount = inHouseBookings.length;

  // Count unique rooms occupied today
  const occupiedRoomIds = new Set(
    inHouseBookings.flatMap((b) => b.rooms.map((br) => br.roomId))
  );
  const available = Math.max(0, totalRooms - occupiedRoomIds.size);

  // ── Derived values ───────────────────────────────────────────────────────

  const formattedToday = format(new Date(), "yyyy-MM-dd");
  const defaultCategoryId = categories[0]?.id ?? "";

  return (
    <main className="min-h-screen bg-[#F0F2F5]">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-5">
        <StatCard
          title="Check-Ins"
          value={checkIns}
          gradient="bg-gradient-to-br from-[#20C45A] to-[#15A348]"
        />
        <StatCard
          title="Check-Outs"
          value={checkOuts}
          gradient="bg-gradient-to-br from-[#E84B6E] to-[#C7304E]"
        />
        <StatCard
          title="In-House"
          value={inHouseCount}
          gradient="bg-gradient-to-br from-[#7A6FF0] to-[#5E54D4]"
        />
        <StatCard
          title="Available"
          value={available}
          gradient="bg-gradient-to-br from-[#00BFD8] to-[#0099B0]"
        />
        <SystemSyncCard />
      </div>

      {/* ── Dashboard Table ── */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          {/* Table Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1A2340]">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold tracking-[0.15em] text-sm uppercase">
                Unified Front Desk Dashboard
              </span>
              <RefreshCw className="w-4 h-4 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer" />
            </div>
            <Link
              href={`/admin/offlinebooking?categoryId=${defaultCategoryId}&startDate=${formattedToday}&endDate=${formattedToday}`}
              className="inline-flex items-center gap-2 bg-[#B8975A] hover:bg-[#A8874A] active:bg-[#987040] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded transition-all duration-150"
            >
              <span className="text-base leading-none">+</span>
              NEW WALK-IN
            </Link>
          </div>

          {/* Column Headers */}
          <div className="grid items-center gap-0 px-6 py-3 border-b border-gray-100 bg-gray-50/70"
            style={{ gridTemplateColumns: "130px 1fr 170px 110px 150px 120px 36px" }}
          >
            {["ROOM", "GUEST INFO", "STAY WINDOW", "SOURCE", "STATUS", "BALANCE", ""].map(
              (h) => (
                <div
                  key={h}
                  className="text-[10px] font-extrabold tracking-[0.18em] text-gray-400 uppercase"
                >
                  {h}
                </div>
              )
            )}
          </div>

          {/* Rows */}
          {activeBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Wifi className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No bookings to display</p>
            </div>
          ) : (
            activeBookings.map((booking) => {
              const opStatus = getOperationalStatus(booking);
              const isOnline = !booking.user?.isAdmin;
              const isPaid = isOnline; // Online = pre-paid; Walk-in = pay at desk

              // Room display: show room name only when checked-in
              const assignedRoom = booking.rooms?.[0]?.room?.name;
              const displayRoom =
                opStatus === "CHECKED-IN" && assignedRoom ? assignedRoom : "---";
              const categoryLabel = booking.roomtype ?? "";

              return (
                <div
                  key={booking.id}
                  className="grid items-center gap-0 px-6 py-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors duration-100 group"
                  style={{ gridTemplateColumns: "130px 1fr 170px 110px 150px 120px 36px" }}
                >
                  {/* Room */}
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {displayRoom}
                    </p>
                    {categoryLabel && (
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                        {categoryLabel}
                      </p>
                    )}
                  </div>

                  {/* Guest Info */}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {booking.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {booking.userphone}
                    </p>
                  </div>

                  {/* Stay Window */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span>{format(new Date(booking.startDate), "d MMM")}</span>
                    <span className="text-gray-300">→</span>
                    <span>{format(new Date(booking.endDate), "d MMM")}</span>
                  </div>

                  {/* Source */}
                  <div>
                    <SourceBadge isOnline={isOnline} />
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={opStatus} />
                  </div>

                  {/* Balance */}
                  <div>
                    {isPaid ? (
                      <span className="text-emerald-600 font-bold text-sm">
                        PAID ✓
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-sm">
                        ₹{booking.totalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/booking/${booking.id}?startDate=${format(
                        new Date(booking.startDate),
                        "yyyy-MM-dd"
                      )}&endDate=${format(new Date(booking.endDate), "yyyy-MM-dd")}`}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Showing {activeBookings.length} active booking{activeBookings.length !== 1 ? "s" : ""} &nbsp;·&nbsp; Last refreshed: {format(new Date(), "d MMM yyyy, hh:mm a")}
        </p>
      </div>
    </main>
  );
}
