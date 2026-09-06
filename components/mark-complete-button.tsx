"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: string;
  initialComplete: boolean;
};

export function MarkCompleteButton({ lessonId, initialComplete }: Props) {
  const [completed, setCompleted] = useState(initialComplete);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !completed;
    setLoading(true);
    setCompleted(next); // optimistic

    const res = await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: next }),
    });

    if (!res.ok) {
      setCompleted(!next); // roll back
      setLoading(false);
      return;
    }

    setLoading(false);
    // Refresh so the course page's progress bar and "up next" marker
    // reflect this change next time it's visited.
    router.refresh();
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={completed ? "secondary" : "default"}
      className={cn(completed && "text-[#223B5C]")}
    >
      <CheckIcon className="size-4" />
      {completed ? "Completed" : "Mark as complete"}
    </Button>
  );
}
