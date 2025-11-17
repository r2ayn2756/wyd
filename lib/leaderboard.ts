import { prisma } from "@/lib/prisma";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "yearly" | "alltime";

interface LeaderboardEntry {
  userId: string;
  fullName: string;
  linkedinUrl: string | null;
  totalSeconds: number;
}

// Get the 5 AM boundary for a given date in the app timezone
function get5AMBoundary(date: Date, timezone: string = "America/New_York"): Date {
  // Format to the target timezone at 5:00 AM
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  // Create a date string at 5:00 AM in the target timezone
  const dateStr = `${year}-${month}-${day}T05:00:00`;

  // Parse as if it's in the target timezone
  // Note: This is a simplified approach. For production, use a library like date-fns-tz
  const localDate = new Date(dateStr);

  return localDate;
}

function getDateRangeForPeriod(
  period: LeaderboardPeriod,
  timezone: string = "America/New_York"
): { start: Date; end: Date | null } {
  const now = new Date();

  switch (period) {
    case "daily": {
      // Today's 5 AM to now (or tomorrow's 5 AM)
      const today5AM = get5AMBoundary(now, timezone);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrow5AM = get5AMBoundary(tomorrow, timezone);

      // If current time is before today's 5 AM, we're still in yesterday's period
      if (now < today5AM) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: get5AMBoundary(yesterday, timezone),
          end: today5AM,
        };
      }

      return {
        start: today5AM,
        end: null, // null means "until now"
      };
    }

    case "weekly": {
      // Find last Monday at 5 AM
      const dayOfWeek = now.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const lastMonday = new Date(now);
      lastMonday.setDate(lastMonday.getDate() - daysSinceMonday);

      const monday5AM = get5AMBoundary(lastMonday, timezone);

      // If we're before Monday's 5 AM, go back one more week
      if (now < monday5AM) {
        lastMonday.setDate(lastMonday.getDate() - 7);
        return {
          start: get5AMBoundary(lastMonday, timezone),
          end: null,
        };
      }

      return {
        start: monday5AM,
        end: null,
      };
    }

    case "monthly": {
      // First day of current month at 5 AM
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const month5AM = get5AMBoundary(firstOfMonth, timezone);

      // If we're before the 1st at 5 AM, go back to previous month
      if (now < month5AM) {
        const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          start: get5AMBoundary(firstOfPrevMonth, timezone),
          end: null,
        };
      }

      return {
        start: month5AM,
        end: null,
      };
    }

    case "yearly": {
      // January 1st of current year at 5 AM
      const jan1 = new Date(now.getFullYear(), 0, 1);
      const year5AM = get5AMBoundary(jan1, timezone);

      // If we're before Jan 1 at 5 AM, go back to previous year
      if (now < year5AM) {
        const jan1PrevYear = new Date(now.getFullYear() - 1, 0, 1);
        return {
          start: get5AMBoundary(jan1PrevYear, timezone),
          end: null,
        };
      }

      return {
        start: year5AM,
        end: null,
      };
    }

    case "alltime": {
      // From the beginning of time
      return {
        start: new Date(0),
        end: null,
      };
    }
  }
}

export async function getLeaderboard(
  period: LeaderboardPeriod,
  timezone: string = process.env.APP_TIMEZONE || "America/New_York"
): Promise<LeaderboardEntry[]> {
  const { start, end } = getDateRangeForPeriod(period, timezone);

  // First, get all users in the system
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      linkedinUrl: true,
    },
  });

  // Initialize leaderboard with all users at 0 seconds
  const userTotals = new Map<string, LeaderboardEntry>();
  for (const user of allUsers) {
    userTotals.set(user.id, {
      userId: user.id,
      fullName: user.fullName,
      linkedinUrl: user.linkedinUrl,
      totalSeconds: 0,
    });
  }

  // Query all sessions in the date range
  const sessions = await prisma.session.findMany({
    where: {
      startTime: {
        gte: start,
        ...(end ? { lt: end } : {}),
      },
      endTime: {
        not: null,
      },
      verified: true,
    },
    select: {
      userId: true,
      duration: true,
    },
  });

  // Add session durations to user totals
  for (const session of sessions) {
    const entry = userTotals.get(session.userId);
    if (entry) {
      entry.totalSeconds += session.duration || 0;
    }
  }

  // Convert to array and sort by total time descending, then by name for ties
  return Array.from(userTotals.values()).sort((a, b) => {
    // Primary sort: by total time (descending)
    if (b.totalSeconds !== a.totalSeconds) {
      return b.totalSeconds - a.totalSeconds;
    }
    // Secondary sort: by name (ascending) for users with same time
    return a.fullName.localeCompare(b.fullName);
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
