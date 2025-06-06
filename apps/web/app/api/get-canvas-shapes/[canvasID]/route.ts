import { prisma } from "@repo/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasID: string }> }
) {
  try {
    const canvasID = (await params).canvasID;

    if (!canvasID) {
      return NextResponse.json(
        { error: "Canvas ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const shapes = await prisma.chat.findMany({
      where: {
        roomID: Number(canvasID),
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
      select: {
        id: true,
        message: true,
      },
    });

    if (!shapes) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Canvas shapes fetched",
      shapes: shapes,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
