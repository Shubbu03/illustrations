import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userID = session.user.id;

    const existingCanvas = await prisma.room.findMany({
      where: { adminID: userID },
      select: {
        id: true,
        slug: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Canvas fetched successfully",
      status: 200,
      canvas: existingCanvas,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error occured while fetching canvas data",
      status: 500,
    });
  }
}
