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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ClockInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClockIn: (taskDescription: string) => void;
  isLoading?: boolean;
}

export function ClockInDialog({
  open,
  onOpenChange,
  onClockIn,
  isLoading,
}: ClockInDialogProps) {
  const [taskDescription, setTaskDescription] = useState("");

  const handleSubmit = () => {
    if (taskDescription.trim()) {
      onClockIn(taskDescription.trim());
      setTaskDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>wyd?</DialogTitle>
          <DialogDescription>
            What are you working on? Describe your task to start tracking time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="task">Task Description</Label>
          <Textarea
            id="task"
            placeholder="e.g., Working on client proposal, Writing documentation..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows={4}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSubmit();
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!taskDescription.trim() || isLoading}
          >
            {isLoading ? "Starting..." : "Start Timer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
