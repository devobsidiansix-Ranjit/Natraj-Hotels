import prismadb from "@/lib/prismadb";
import { format, addDays, startOfDay } from "date-fns";
import InventoryClient from "./inventory-client";

interface SearchParams {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // ── Date range setup ────────────────────────────────────────────────────────
  const today = new Date();
  const defaultStart = format(today, "yyyy-MM-dd");
  const defaultEnd = format(addDays(today, 13), "yyyy-MM-dd");

  const startDateStr = searchParams.startDate || defaultStart;
  const endDateStr = searchParams.endDate || defaultEnd;

  const startDate = startOfDay(new Date(startDateStr));
  const endDate = startOfDay(new Date(endDateStr));

  // Limit date range to maximum 31 days to ensure great UI performance
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const safeEndDate = diffDays > 31 ? addDays(startDate, 30) : endDate;
  const safeEndDateStr = format(safeEndDate, "yyyy-MM-dd");

  // ── Database Queries ────────────────────────────────────────────────────────
  const [categories, rooms, bookings, blockedRooms] = await Promise.all([
    prismadb.category.findMany({
      orderBy: { name: "asc" },
    }),
    prismadb.room.findMany(),
    prismadb.booking.findMany({
      where: {
        status: { not: "Cancelled" },
        startDate: { lte: safeEndDate },
        endDate: { gte: startDate },
      },
      include: {
        rooms: {
          include: {
            room: true,
          },
        },
      },
    }),
    prismadb.blockedRoom.findMany({
      where: {
        startDate: { lte: safeEndDate },
        endDate: { gte: startDate },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <main className="p-6 min-h-screen bg-[#F0F2F5]">
      <InventoryClient
        initialCategories={categories}
        initialRooms={rooms}
        initialBookings={JSON.parse(JSON.stringify(bookings))}
        initialBlockedRooms={JSON.parse(JSON.stringify(blockedRooms))}
        startDateStr={startDateStr}
        endDateStr={safeEndDateStr}
        selectedCategoryId={searchParams.categoryId || "all"}
      />
    </main>
  );
}
