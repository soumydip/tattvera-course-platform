"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  courseId: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  // Id of the first not-yet-completed lesson, from the course API.
  // `null`/`undefined` means either there are no lessons yet, or every
  // lesson is already complete.
  nextLessonId?: string | null;
  isCourseComplete?: boolean;
};

export function EnrollButton({
  courseId,
  isEnrolled,
  isLoggedIn,
  nextLessonId,
  isCourseComplete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Not logged in — send them to login, then back to this course
  if (!isLoggedIn) {
    return (
      <Link href={`/login?next=/courses/${courseId}`}>
        <Button className="w-full">Log in to enroll</Button>
      </Link>
    );
  }

  // Already enrolled — go straight to the next lesson that's pending,
  // or back to the first one if the course is already finished.
  if (isEnrolled) {
    const href = nextLessonId
      ? `/courses/${courseId}/lessons/${nextLessonId}`
      : `/courses/${courseId}`;

    return (
      <Link href={href}>
        <Button variant="outline" className="w-full">
          {isCourseComplete ? "Review course" : "Continue learning"}
        </Button>
      </Link>
    );
  }

  async function handleEnroll() {
    setLoading(true);
    setErrorMsg(null);

    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Re-fetch this Server Component page so it now shows "Continue learning"
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleEnroll} disabled={loading} className="w-full">
        {loading ? "Enrolling..." : "Enroll"}
      </Button>
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
    </div>
  );
}
