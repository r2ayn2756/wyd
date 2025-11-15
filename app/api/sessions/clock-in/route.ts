import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has an active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (activeSession) {
      return NextResponse.json(
        { error: "You already have an active session" },
        { status: 400 }
      );
    }

    // Create new session without task description (will be added on clock-out)
    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        startTime: new Date(),
        verified: false,
      },
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Clock-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
