import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("=== Clock-In API - Start ===");
    const session = await auth();

    if (!session?.user?.id) {
      console.log("Clock-in failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", session.user.id);

    // Check if user already has an active session
    console.log("Checking for existing active session...");
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (activeSession) {
      console.log("Clock-in failed: Active session already exists:", activeSession.id);
      return NextResponse.json(
        { error: "You already have an active session" },
        { status: 400 }
      );
    }

    console.log("No active session found, creating new session...");

    // Create new session without task description (will be added on clock-out)
    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        startTime: new Date(),
        verified: false,
      },
    });

    console.log("Session created successfully:", newSession.id);
    console.log("Session start time:", newSession.startTime);
    console.log("=== Clock-In API - Success ===");

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("=== Clock-In API - ERROR ===");
    console.error("Clock-in error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Return more specific error for debugging
      return NextResponse.json(
        {
          error: "Failed to create session",
          details: error.message,
          type: error.name
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
