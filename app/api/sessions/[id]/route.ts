import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startTime, endTime } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const existingSession = await prisma.session.findUnique({
      where: { id: params.id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    // Update session with corrected times
    const updatedSession = await prisma.session.update({
      where: { id: params.id },
      data: {
        startTime: start,
        endTime: end,
        duration,
        verified: true, // Mark as verified after manual fix
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
