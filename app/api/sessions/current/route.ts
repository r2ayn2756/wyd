import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json({ session: activeSession });
  } catch (error) {
    console.error("Get current session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
