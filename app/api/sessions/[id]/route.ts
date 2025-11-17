import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== PATCH Session - Start ===");
    const session = await auth();

    if (!session?.user?.id) {
      console.log("Update session failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", session.user.id);

    const { id } = await params;
    const { startTime, endTime } = await request.json();

    console.log("Session ID to update:", id);
    console.log("New start time:", startTime);
    console.log("New end time:", endTime);

    if (!startTime || !endTime) {
      console.log("Validation failed: Missing start or end time");
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    console.log("Parsed start date:", start.toISOString());
    console.log("Parsed end date:", end.toISOString());

    if (end <= start) {
      console.log("Validation failed: End time must be after start time");
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    console.log("Looking up existing session...");
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      console.log("Session not found:", id);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    console.log("Existing session found:", existingSession.id);
    console.log("Session user ID:", existingSession.userId);
    console.log("Old start time:", existingSession.startTime);
    console.log("Old end time:", existingSession.endTime);
    console.log("Old duration:", existingSession.duration);
    console.log("Old verified status:", existingSession.verified);

    if (existingSession.userId !== session.user.id) {
      console.log("Forbidden: Session belongs to different user");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    console.log("Calculated new duration:", duration, "seconds");

    // Update session with corrected times
    console.log("Updating session in database...");
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        startTime: start,
        endTime: end,
        duration,
        verified: true, // Mark as verified after manual fix
      },
    });

    console.log("Session updated successfully!");
    console.log("New start time:", updatedSession.startTime);
    console.log("New end time:", updatedSession.endTime);
    console.log("New duration:", updatedSession.duration);
    console.log("New verified status:", updatedSession.verified);
    console.log("=== PATCH Session - Success ===");

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("=== PATCH Session - ERROR ===");
    console.error("Update session error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
