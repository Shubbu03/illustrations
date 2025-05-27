import { prisma } from "@repo/db/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { generateSlug } from "random-word-slugs";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userID = session.user.id;

    const slug = generateSlug(2, {
      format: "lower",
      partsOfSpeech: ["noun", "adjective"],
      categories: {
        noun: ["animals", "food"],
        adjective: ["time", "color"],
      },
    });
    const existing = await prisma.room.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        slug,
        adminID: userID,
      },
    });

    console.log("Room created :", room);

    return NextResponse.json({ message: "Canvas created", status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error occured while creating room"},
      { status: 500 }
    );
  }
}
