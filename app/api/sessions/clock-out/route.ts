import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskDescription } = await request.json();

    if (!taskDescription || taskDescription.trim().length === 0) {
      return NextResponse.json(
        { error: "Task description is required" },
        { status: 400 }
      );
    }

    // Find active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - activeSession.startTime.getTime()) / 1000
    );

    // Auto-verify sessions <= 1 hour (3600 seconds)
    const verified = duration <= 3600;

    // Update session with task description
    const updatedSession = await prisma.session.update({
      where: { id: activeSession.id },
      data: {
        endTime,
        duration,
        verified,
        taskDescription: taskDescription.trim(),
      },
    });

    return NextResponse.json({
      session: updatedSession,
      needsVerification: !verified,
    });
  } catch (error) {
    console.error("Clock-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
