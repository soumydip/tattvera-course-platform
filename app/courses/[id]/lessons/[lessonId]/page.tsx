import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { MarkCompleteButton } from "@/components/mark-complete-button";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/get-base-url";

type LessonResponse = {
  lesson: {
    id: string;
    title: string;
    content: string | null;
  };
  courseId: string;
  courseTitle: string;
  chapterTitle: string;
  nextLessonId: string | null;
  completed: boolean;
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = await params;
  const cookieHeader = (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const response = await fetch(
    `${await getBaseUrl()}/api/lessons/${lessonId}`,
    { cache: "no-store", headers: { cookie: cookieHeader } },
  );

  if (response.status === 401) {
    redirect(`/login?next=/courses/${courseId}/lessons/${lessonId}`);
  }
  if (response.status === 403) redirect(`/courses/${courseId}`);
  if (response.status === 404) notFound();
  if (!response.ok) {
    return <p className="p-8 text-red-500">Failed to load lesson.</p>;
  }

  const {
    lesson,
    courseId: responseCourseId,
    courseTitle,
    chapterTitle,
    nextLessonId,
    completed,
  }: LessonResponse = await response.json();

  if (responseCourseId !== courseId) notFound();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {courseTitle}
      </Link>

      <p className="mt-6 text-sm text-muted-foreground">
        {chapterTitle}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>

      <div className="mt-6 space-y-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
        {lesson.content ?? (
          <span className="text-muted-foreground">
            This lesson doesn&apos;t have any content yet.
          </span>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <MarkCompleteButton lessonId={lesson.id} initialComplete={completed} />

        {nextLessonId && (
          <Link
            href={`/courses/${courseId}/lessons/${nextLessonId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Next lesson
            <ChevronRightIcon className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
