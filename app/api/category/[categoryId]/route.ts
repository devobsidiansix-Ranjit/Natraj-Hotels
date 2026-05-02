import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const body = await req.json();
    const { name, price } = body;
    if (!name || !price || !params.categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        ...body,
      },
    });
    await prismadb.room.updateMany({
      where: {
        categoryId: params.categoryId,
      },
      data: {
        price: category.price,
        name: category.name,
      },
    });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Find all rooms in this category
    const rooms = await prismadb.room.findMany({
      where: {
        categoryId: params.categoryId,
      },
    });

    const roomIds = rooms.map((room) => room.id);

    // 2. Delete all booking references for these rooms
    await prismadb.bookingRoom.deleteMany({
      where: {
        roomId: {
          in: roomIds,
        },
      },
    });

    // 3. Delete the rooms
    await prismadb.room.deleteMany({
      where: {
        categoryId: params.categoryId,
      },
    });

    // 4. Finally delete the category
    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });
    
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
