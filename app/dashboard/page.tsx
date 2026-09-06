import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getBaseUrl } from "@/lib/get-base-url";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import type { Enrollment } from "@/types/course";

export default async function DashboardPage() {
  const baseUrl = await getBaseUrl();
  const cookieHeader = (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${baseUrl}/api/dashboard`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (response.status === 401) redirect("/login");
  if (!response.ok) {
    return <p className="p-8 text-red-500">Failed to load dashboard</p>;
  }

  const {
    enrollments,
    completedLessonIds,
  }: {
    enrollments: Enrollment[];
    completedLessonIds: string[];
  } = await response.json();

  const completedIds = new Set(completedLessonIds);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-secondary-foreground">
          Your learning space
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Keep going.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick up exactly where you left off.
        </p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          <p>You haven&apos;t enrolled in any courses yet.</p>

          <Link href="/courses">
            <Button className="mt-4">Browse courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;

            if (!course) return null;

            const orderedLessons = [...course.chapters]
              .sort((a, b) => a.position - b.position)
              .flatMap((chapter) =>
                [...chapter.lessons].sort((a, b) => a.position - b.position),
              );

            const totalLessons = orderedLessons.length;

            const completedCount = orderedLessons.filter((lesson) =>
              completedIds.has(lesson.id),
            ).length;

            const percent =
              totalLessons === 0
                ? 0
                : Math.round((completedCount / totalLessons) * 100);

            const isComplete =
              totalLessons > 0 && completedCount === totalLessons;

            const nextLesson = orderedLessons.find(
              (lesson) => !completedIds.has(lesson.id),
            );

            const targetLessonId = nextLesson?.id ?? orderedLessons[0]?.id;

            const continueHref = targetLessonId
              ? `/courses/${course.id}/lessons/${targetLessonId}`
              : `/courses/${course.id}`;

            return (
              <Card key={enrollment.id} className="border-border/80">
                <CardHeader className="gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-secondary-foreground">
                    Course progress
                  </div>
                  <CardTitle className="line-clamp-2 min-h-[2.75rem]">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {completedCount} of {totalLessons} lessons complete
                  </p>

                  <Progress value={percent} />

                  <p className="text-right text-xs font-medium text-muted-foreground">
                    {percent}%
                  </p>

                  <Link href={continueHref}>
                    <Button variant="outline" className="w-full">
                      {isComplete ? "Review course" : "Continue learning"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
