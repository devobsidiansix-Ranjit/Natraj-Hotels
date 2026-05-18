import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startDate, endDate, categoryId, count, reason } = body;

    if (!startDate || !endDate || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return new NextResponse("Invalid date range", { status: 400 });
    }

    // Create the blocked room record
    const block = await prismadb.blockedRoom.create({
      data: {
        startDate: start,
        endDate: end,
        categoryId: categoryId,
        count: count ? Number(count) : 1,
        reason: reason || "",
      },
    });

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("[BLOCKED_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause: any = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (startDate && endDate) {
      whereClause.startDate = { lte: new Date(endDate) };
      whereClause.endDate = { gte: new Date(startDate) };
    }

    const blocks = await prismadb.blockedRoom.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, blocks });
  } catch (error) {
    console.error("[BLOCKED_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Block ID is required", { status: 400 });
    }

    await prismadb.blockedRoom.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true, message: "Block deleted successfully" });
  } catch (error) {
    console.error("[BLOCKED_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
