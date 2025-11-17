"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  taskDescription: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  onVerify: () => void;
  onManualFix: (startTime: string, endTime: string) => void;
  isLoading?: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputDateTime(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function VerificationDialog({
  open,
  onOpenChange,
  sessionId,
  taskDescription,
  startTime,
  endTime,
  duration,
  onVerify,
  onManualFix,
  isLoading,
}: VerificationDialogProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [newStartTime, setNewStartTime] = useState(toInputDateTime(startTime));
  const [newEndTime, setNewEndTime] = useState(toInputDateTime(endTime));

  const handleVerify = () => {
    onVerify();
    onOpenChange(false);
  };

  const handleFixSubmit = () => {
    onManualFix(newStartTime, newEndTime);
    setIsFixing(false);
    onOpenChange(false);
  };

  if (isFixing) {
    return (
      <Dialog open={open} onOpenChange={() => {/* Non-dismissible during fix */}}>
        <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Fix Session Times</DialogTitle>
            <DialogDescription>
              Adjust the start and end times for this session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Task:</p>
              <p className="text-sm text-muted-foreground">{taskDescription}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFixing(false)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button onClick={handleFixSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Correction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {/* Non-dismissible - must verify */}}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Verify Your Session (Required)</DialogTitle>
          <DialogDescription>
            You tracked {formatDuration(duration)} for the following task. Please verify or fix before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Task:</p>
            <p className="text-sm text-muted-foreground">{taskDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Started:</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(startTime)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Ended:</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(endTime)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Duration:</p>
            <p className="text-sm text-muted-foreground">
              {formatDuration(duration)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsFixing(true)}
            disabled={isLoading}
          >
            No, Fix It
          </Button>
          <Button onClick={handleVerify} disabled={isLoading}>
            {isLoading ? "Confirming..." : "Yes, Correct"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
