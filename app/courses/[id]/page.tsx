import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnrollButton } from "@/components/enroll-button";
import { getBaseUrl } from "@/lib/get-base-url";
import { cn } from "@/lib/utils";

type Lesson = { id: string; title: string; position: number };
type Chapter = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};
type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  chapters: Chapter[];
};
type CourseResponse = {
  course: Course;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  completedLessonIds: string[];
  nextLessonId: string | null;
  totalLessons: number;
  completedLessons: number;
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseUrl = await getBaseUrl();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${baseUrl}/api/courses/${id}`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    return (
      <p className="p-8 text-red-500">
        Failed to load this course. Please try again later.
      </p>
    );
  }

  const {
    course,
    isEnrolled,
    isLoggedIn,
    completedLessonIds,
    nextLessonId,
    totalLessons,
    completedLessons,
  }: CourseResponse = await res.json();

  const completedSet = new Set(completedLessonIds);
  const isCourseComplete = isEnrolled && totalLessons > 0 && !nextLessonId;
  const percent =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <p className="mt-2 text-gray-500">{course.description}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          ₹{course.price}
        </Badge>
      </div>

      <div className="mb-6 max-w-xs space-y-3">
        {isEnrolled && totalLessons > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm text-gray-500">
              {isCourseComplete
                ? "All lessons complete"
                : `${completedLessons} of ${totalLessons} lessons complete`}
            </p>
            <Progress value={percent} />
          </div>
        )}
        <EnrollButton
          courseId={course.id}
          isEnrolled={isEnrolled}
          isLoggedIn={isLoggedIn}
          nextLessonId={nextLessonId}
          isCourseComplete={isCourseComplete}
        />
      </div>

      <h2 className="mb-3 text-lg font-medium">Course content</h2>
      <div className="space-y-3">
        {course.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader>
              <CardTitle className="text-base">{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {chapter.lessons.map((lesson) => {
                  const isDone = completedSet.has(lesson.id);
                  const isUpNext = isEnrolled && lesson.id === nextLessonId;

                  if (!isEnrolled) {
                    return (
                      <li key={lesson.id} className="text-gray-400">
                        {lesson.title}
                      </li>
                    );
                  }

                  return (
                    <li key={lesson.id}>
                      <a
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-1.5 py-1 -mx-1.5 hover:bg-muted",
                          isDone && "text-gray-500",
                          isUpNext && "font-medium",
                        )}
                      >
                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {isDone ? (
                            <CheckIcon className="size-3.5 text-[#223B5C]" />
                          ) : (
                            <span className="size-1.5 rounded-full bg-gray-300" />
                          )}
                        </span>
                        <span className="flex-1">{lesson.title}</span>
                        {isUpNext && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            Continue
                          </Badge>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
