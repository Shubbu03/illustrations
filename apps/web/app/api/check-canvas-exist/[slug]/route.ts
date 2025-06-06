import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingRoom = await prisma.room.findUnique({ where: { slug } });

    if (existingRoom?.slug) {
      return NextResponse.json({
        message: "Room exists",
        roomExist: true,
        status: 200,
      });
    }

    return NextResponse.json({
      message: "Room doesn't exists",
      roomExist: false,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
