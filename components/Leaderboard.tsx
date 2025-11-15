"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  linkedinUrl: string | null;
  totalSeconds: number;
  formattedTime: string;
}

type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "yearly" | "alltime";

const PERIOD_CONFIG: Record<
  LeaderboardPeriod,
  { title: string; subtitle: string }
> = {
  daily: {
    title: "Today's Leaderboard",
    subtitle: "We reset at 5AM because we work till 4",
  },
  weekly: {
    title: "This Week's Leaderboard",
    subtitle: "We reset at 5AM because we work till 4",
  },
  monthly: {
    title: "This Month's Leaderboard",
    subtitle: "We reset at 5AM because we work till 4",
  },
  yearly: {
    title: "This Year's Leaderboard",
    subtitle: "We reset at 5AM because we work till 4",
  },
  alltime: {
    title: "All-Time Leaderboard",
    subtitle: "Never resets",
  },
};

export function Leaderboard() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("daily");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard(activePeriod);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchLeaderboard(activePeriod);
    }, 30000);

    return () => clearInterval(interval);
  }, [activePeriod]);

  const fetchLeaderboard = async (period: LeaderboardPeriod) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?period=${period}`);
      const result = await response.json();
      setData(result.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );

  const renderLeaderboard = (entries: LeaderboardEntry[]) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data yet. Start tracking time to appear on the leaderboard!
        </div>
      );
    }

    return (
      <div className="space-y-3" role="list" aria-label="Leaderboard rankings">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            role="listitem"
            aria-label={`Rank ${entry.rank}: ${entry.fullName} with ${entry.formattedTime}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                aria-label={`Rank ${entry.rank}`}
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  entry.rank === 1
                    ? "bg-yellow-100 text-yellow-900"
                    : entry.rank === 2
                    ? "bg-gray-200 text-gray-900"
                    : entry.rank === 3
                    ? "bg-orange-100 text-orange-900"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.rank}
              </div>
              <div>
                {entry.linkedinUrl ? (
                  <a
                    href={entry.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                    aria-label={`${entry.fullName}'s LinkedIn profile`}
                  >
                    {entry.fullName}
                  </a>
                ) : (
                  <span className="font-medium">{entry.fullName}</span>
                )}
              </div>
            </div>
            <div className="font-mono font-semibold tabular-nums" aria-label={`Time tracked: ${entry.formattedTime}`}>
              {entry.formattedTime}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const config = PERIOD_CONFIG[activePeriod];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activePeriod} onValueChange={(v) => setActivePeriod(v as LeaderboardPeriod)}>
          <TabsList className="grid w-full grid-cols-5 text-xs sm:text-sm">
            <TabsTrigger value="daily" className="px-2 sm:px-3">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="px-2 sm:px-3">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="px-2 sm:px-3">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="px-2 sm:px-3">Yearly</TabsTrigger>
            <TabsTrigger value="alltime" className="px-2 sm:px-3">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activePeriod} className="mt-6">
            {isLoading && data.length === 0 ? (
              renderSkeletons()
            ) : (
              renderLeaderboard(data)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
