"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";

interface Session {
  id: string;
  taskDescription: string | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  createdAt: string;
}

interface UserInfo {
  id: string;
  fullName: string;
  linkedinUrl: string | null;
}

interface UserSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0h 0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function UserSessionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserSessionsDialogProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserSessions();
    }
  }, [open, userId]);

  const fetchUserSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/user/${userId}`);

      if (!response.ok) {
        console.error("Failed to fetch user sessions");
        return;
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setUserInfo(data.user || null);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalTime = () => {
    const total = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    return formatDuration(total);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userName}'s Sessions
            {userInfo?.linkedinUrl && (
              <a
                href={userInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`View ${userName}'s LinkedIn profile`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading ? (
              "Loading sessions..."
            ) : (
              <>
                {sessions.length} session{sessions.length !== 1 ? "s" : ""} • Total: {getTotalTime()}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No sessions found for this user.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-sm flex-1">
                      {session.taskDescription || "No description"}
                    </p>
                    <span className="font-mono text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Start: {formatDateTime(session.startTime)}</span>
                    {session.endTime && (
                      <span>End: {formatDateTime(session.endTime)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
