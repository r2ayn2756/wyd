import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    console.log("=== Get User Sessions API - Start ===");
    const session = await auth();

    if (!session?.user?.id) {
      console.log("Get user sessions failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    console.log("Fetching sessions for user:", userId);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
      },
    });

    if (!user) {
      console.log("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all completed and verified sessions for this user
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        endTime: {
          not: null,
        },
        verified: true,
      },
      select: {
        id: true,
        taskDescription: true,
        startTime: true,
        endTime: true,
        duration: true,
        createdAt: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: 50, // Limit to last 50 sessions
    });

    console.log(`Found ${sessions.length} sessions for user ${userId}`);
    console.log("=== Get User Sessions API - Success ===");

    return NextResponse.json({
      user,
      sessions,
    });
  } catch (error) {
    console.error("=== Get User Sessions API - ERROR ===");
    console.error("Get user sessions error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      return NextResponse.json(
        {
          error: "Failed to fetch user sessions",
          details: error.message,
          type: error.name,
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
