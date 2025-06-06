import { NextResponse } from "next/server";
import { hashPassword } from "@repo/auth/bcrypt";
import { SignupSchema } from "@repo/types/zod";
import { prisma } from "@repo/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = SignupSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((error) => `${error.path}: ${error.message}`)
        .join(", ");

      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { email, name, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    return NextResponse.json(
      { user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
