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

interface ClockOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClockOut: (taskDescription: string) => void;
  isLoading?: boolean;
}

export function ClockOutDialog({
  open,
  onOpenChange,
  onClockOut,
  isLoading,
}: ClockOutDialogProps) {
  const [taskDescription, setTaskDescription] = useState("");

  const handleSubmit = () => {
    if (taskDescription.trim()) {
      onClockOut(taskDescription.trim());
      setTaskDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>wyd?</DialogTitle>
          <DialogDescription>
            What did you work on? Describe what you accomplished during this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="task">Task Description</Label>
          <Textarea
            id="task"
            placeholder="e.g., Completed client proposal, Wrote documentation for API..."
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
            {isLoading ? "Clocking Out..." : "Clock Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
