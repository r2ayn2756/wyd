import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
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

    // Mark session as verified
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { verified: true },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
