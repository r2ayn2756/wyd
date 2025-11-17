"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockOutDialog } from "@/components/ClockOutDialog";
import { VerificationDialog } from "@/components/VerificationDialog";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  taskDescription: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  verified: boolean;
}

interface TimeTrackerProps {
  userId: string;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function TimeTracker({ userId }: TimeTrackerProps) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [sessionToVerify, setSessionToVerify] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current session on mount
  useEffect(() => {
    fetchCurrentSession();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!currentSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(currentSession.startTime).getTime();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const fetchCurrentSession = async () => {
    try {
      const response = await fetch("/api/sessions/current");
      const data = await response.json();
      setCurrentSession(data.session);

      if (data.session) {
        const now = new Date().getTime();
        const start = new Date(data.session.startTime).getTime();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }
    } catch (error) {
      console.error("Failed to fetch current session:", error);
    }
  };

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sessions/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to clock in");
        return;
      }

      const data = await response.json();
      setCurrentSession(data.session);
      setElapsedSeconds(0);
      toast.success("Clocked in successfully!");
    } catch (error) {
      console.error("Clock in error:", error);
      toast.error("Failed to clock in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async (taskDescription: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sessions/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskDescription }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to clock out");
        return;
      }

      const data = await response.json();

      setIsClockOutDialogOpen(false);

      // If verification needed, show dialog
      if (data.needsVerification) {
        setSessionToVerify(data.session);
        setIsVerificationDialogOpen(true);
        toast.info("Please verify your session");
      } else {
        toast.success("Clocked out successfully!");
      }

      setCurrentSession(null);
      setElapsedSeconds(0);
    } catch (error) {
      console.error("Clock out error:", error);
      toast.error("Failed to clock out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!sessionToVerify) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/sessions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionToVerify.id }),
      });

      if (!response.ok) {
        toast.error("Failed to verify session");
        setIsLoading(false);
        return;
      }

      setSessionToVerify(null);
      setIsVerificationDialogOpen(false);
      toast.success("Session verified successfully! Refreshing...");

      // Refresh the page to show updated leaderboard
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Verify error:", error);
      toast.error("Failed to verify session");
      setIsLoading(false);
    }
  };

  const handleManualFix = async (startTime: string, endTime: string) => {
    if (!sessionToVerify) return;

    console.log("=== Manual Fix - Client Side ===");
    console.log("Session ID:", sessionToVerify.id);
    console.log("New start time:", startTime);
    console.log("New end time:", endTime);

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionToVerify.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, endTime }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error("Manual fix failed:", error);
        toast.error(error.error || "Failed to update session");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Manual fix successful:", data);

      setSessionToVerify(null);
      setIsVerificationDialogOpen(false);
      toast.success("Session updated successfully! Refreshing...");

      // Refresh the page to show updated leaderboard
      setTimeout(() => {
        console.log("Refreshing page...");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Manual fix error:", error);
      toast.error("Failed to update session");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracker
          </CardTitle>
          <CardDescription>
            Track your productive time with a simple clock in/out system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSession ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg font-semibold">Clocked In</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Session Time
                </p>
                <p
                  className="text-4xl font-mono font-bold tabular-nums"
                  role="timer"
                  aria-live="polite"
                  aria-label={`Session time: ${formatTime(elapsedSeconds)}`}
                >
                  {formatTime(elapsedSeconds)}
                </p>
              </div>

              <Button
                onClick={() => setIsClockOutDialogOpen(true)}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isLoading}
                aria-label="Clock out and end current session"
              >
                Clock Out
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg font-semibold">Clocked Out</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ready to start tracking your time?
                </p>
              </div>

              <Button
                onClick={handleClockIn}
                className="w-full"
                size="lg"
                disabled={isLoading}
                aria-label="Clock in and start tracking time"
              >
                {isLoading ? "Clocking In..." : "Clock In"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ClockOutDialog
        open={isClockOutDialogOpen}
        onOpenChange={setIsClockOutDialogOpen}
        onClockOut={handleClockOut}
        isLoading={isLoading}
      />

      {sessionToVerify && (
        <VerificationDialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          sessionId={sessionToVerify.id}
          taskDescription={sessionToVerify.taskDescription}
          startTime={new Date(sessionToVerify.startTime)}
          endTime={new Date(sessionToVerify.endTime!)}
          duration={sessionToVerify.duration!}
          onVerify={handleVerify}
          onManualFix={handleManualFix}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
