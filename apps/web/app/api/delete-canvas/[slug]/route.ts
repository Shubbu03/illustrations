import { prisma } from "@repo/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userID = session.user.id;
    const { slug } = params;

    const room = await prisma.room.findUnique({
      where: { slug },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Canvas not found" },
        { status: 404 }
      );
    }

    if (room.adminID !== userID) {
      return NextResponse.json(
        { message: "You don't have permission to delete this canvas" },
        { status: 403 }
      );
    }

    await prisma.room.delete({
      where: { slug },
    });

    return NextResponse.json({
      message: "Canvas deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting canvas:", error);
    return NextResponse.json(
      { message: "Error occurred while deleting canvas" },
      { status: 500 }
    );
  }
}
