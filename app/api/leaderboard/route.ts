import { NextResponse } from "next/server";
import { getLeaderboard, LeaderboardPeriod, formatDuration } from "@/lib/leaderboard";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "daily") as LeaderboardPeriod;

    const validPeriods: LeaderboardPeriod[] = ["daily", "weekly", "monthly", "yearly", "alltime"];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: "Invalid period" },
        { status: 400 }
      );
    }

    const leaderboard = await getLeaderboard(period);

    // Format the response
    const formatted = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      fullName: entry.fullName,
      linkedinUrl: entry.linkedinUrl,
      totalSeconds: entry.totalSeconds,
      formattedTime: formatDuration(entry.totalSeconds),
    }));

    return NextResponse.json({ leaderboard: formatted, period });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
