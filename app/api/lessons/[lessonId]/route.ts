import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch the lesson along with its chapter -> course, so we know
  // which course this lesson belongs to (needed for the enrollment check).
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      id,
      title,
      content,
      chapter:chapters (
        course_id,
        title,
        course:courses ( title )
      )
    `,
    )
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const courseId = (lesson.chapter as unknown as { course_id: string } | null)
    ?.course_id;

  if (!courseId) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Enforce enrollment — logged in isn't enough, they must own an
  // enrollment row for the course this lesson belongs to.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json(
      { error: "You are not enrolled in this course" },
      { status: 403 },
    );
  }

  const { data: courseLessons, error: courseLessonsError } = await supabase
    .from("chapters")
    .select("position, lessons ( id, position )")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "lessons", ascending: true })
    .returns<{ position: number; lessons: { id: string; position: number } }[]>();

  if (courseLessonsError) {
    return NextResponse.json(
      { error: courseLessonsError.message },
      { status: 500 },
    );
  }

  const orderedLessonIds =
    courseLessons?.flatMap((chapter) => {
      const lessons = chapter.lessons;
      return Array.isArray(lessons)
        ? lessons.map((item: { id: string }) => item.id)
        : [lessons.id];
    }) ?? [];

  // Fetch this user's completion status for the lesson
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const chapter = lesson.chapter as unknown as {
    title: string;
    course: { title: string } | null;
  } | null;
  const currentIndex = orderedLessonIds.indexOf(lessonId);

  return NextResponse.json({
    lesson: { id: lesson.id, title: lesson.title, content: lesson.content },
    courseId,
    courseTitle: chapter?.course?.title ?? "",
    chapterTitle: chapter?.title ?? "",
    nextLessonId: orderedLessonIds[currentIndex + 1] ?? null,
    completed: progress?.completed ?? false,
  });
}
