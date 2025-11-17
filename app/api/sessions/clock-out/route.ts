import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("=== Clock-Out API - Start ===");
    const session = await auth();

    if (!session?.user?.id) {
      console.log("Clock-out failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", session.user.id);

    const { taskDescription } = await request.json();
    console.log("Task description:", taskDescription);

    if (!taskDescription || taskDescription.trim().length === 0) {
      console.log("Clock-out failed: Missing task description");
      return NextResponse.json(
        { error: "Task description is required" },
        { status: 400 }
      );
    }

    // Find active session
    console.log("Searching for active session...");
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (!activeSession) {
      console.log("Clock-out failed: No active session found");
      return NextResponse.json(
        { error: "No active session found" },
        { status: 400 }
      );
    }

    console.log("Active session found:", activeSession.id);
    console.log("Session start time:", activeSession.startTime);

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - activeSession.startTime.getTime()) / 1000
    );

    console.log("End time:", endTime);
    console.log("Duration (seconds):", duration);

    // Auto-verify sessions <= 1 hour (3600 seconds)
    const verified = duration <= 3600;
    console.log("Auto-verified:", verified);

    // Update session with task description
    console.log("Updating session in database...");
    const updatedSession = await prisma.session.update({
      where: { id: activeSession.id },
      data: {
        endTime,
        duration,
        verified,
        taskDescription: taskDescription.trim(),
      },
    });

    console.log("Session updated successfully:", updatedSession.id);
    console.log("Needs verification:", !verified);
    console.log("=== Clock-Out API - Success ===");

    return NextResponse.json({
      session: updatedSession,
      needsVerification: !verified,
    });
  } catch (error) {
    console.error("=== Clock-Out API - ERROR ===");
    console.error("Clock-out error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Return more specific error for debugging
      return NextResponse.json(
        {
          error: "Failed to save session",
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
