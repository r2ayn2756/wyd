import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    console.log(`[CRON] Running 5 AM reset at ${now.toISOString()}`);

    // Find all active sessions (where endTime is null)
    const activeSessions = await prisma.session.findMany({
      where: {
        endTime: null,
      },
      include: {
        user: true,
      },
    });

    console.log(`[CRON] Found ${activeSessions.length} active sessions`);

    if (activeSessions.length === 0) {
      return NextResponse.json({
        message: "No active sessions to split",
        splitCount: 0,
      });
    }

    // For each active session:
    // 1. Clock out at 04:59:59 (attribute to previous period)
    // 2. Clock in at 05:00:00 (start new period with same task)

    const results = [];

    for (const session of activeSessions) {
      try {
        // Create end time at 04:59:59 of the current day
        const endOfPreviousPeriod = new Date(now);
        endOfPreviousPeriod.setHours(4, 59, 59, 999);

        // If we're past 5 AM, use yesterday's 04:59:59
        if (now.getHours() >= 5) {
          endOfPreviousPeriod.setDate(endOfPreviousPeriod.getDate() - 1);
        }

        // Calculate duration for the old session
        const duration = Math.floor(
          (endOfPreviousPeriod.getTime() - new Date(session.startTime).getTime()) / 1000
        );

        // Update the old session to end at 04:59:59
        await prisma.session.update({
          where: { id: session.id },
          data: {
            endTime: endOfPreviousPeriod,
            duration,
            verified: true, // Auto-verify split sessions
          },
        });

        // Create new session starting at 05:00:00
        const startOfNewPeriod = new Date(endOfPreviousPeriod);
        startOfNewPeriod.setSeconds(startOfNewPeriod.getSeconds() + 1); // 05:00:00

        await prisma.session.create({
          data: {
            userId: session.userId,
            taskDescription: session.taskDescription, // Reuse same task
            startTime: startOfNewPeriod,
            verified: false,
          },
        });

        results.push({
          userId: session.userId,
          userName: session.user.fullName,
          oldSessionId: session.id,
          split: true,
        });

        console.log(`[CRON] Split session for user ${session.user.fullName}`);
      } catch (error) {
        console.error(`[CRON] Failed to split session ${session.id}:`, error);
        results.push({
          userId: session.userId,
          userName: session.user.fullName,
          oldSessionId: session.id,
          error: "Failed to split",
        });
      }
    }

    console.log(`[CRON] Reset complete. Split ${results.length} sessions.`);

    return NextResponse.json({
      message: "5 AM reset complete",
      splitCount: results.filter((r) => r.split).length,
      results,
    });
  } catch (error) {
    console.error("[CRON] Reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
