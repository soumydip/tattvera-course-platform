/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      price,
      chapters (
        id,
        title,
        position,
        lessons ( id, title, position )
      )
    `,
    )
    .eq("id", id)
    .order("position", { referencedTable: "chapters", ascending: true })
    .order("position", { referencedTable: "chapters.lessons", ascending: true })
    .single();

  if (error || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if the current user (if logged in) is enrolled in this course
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .maybeSingle();

    isEnrolled = !!enrollment;
  }

  // Flattened, position-ordered list of every lesson in this course —
  // used to work out completion counts and which lesson comes next.
  const allLessons = course.chapters.flatMap(
    (chapter: { lessons: any }) => chapter.lessons,
  );

  let completedLessonIds: string[] = [];
  if (user && isEnrolled && allLessons.length > 0) {
    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in(
        "lesson_id",
        allLessons.map((lesson: { id: any }) => lesson.id),
      );

    completedLessonIds =
      progressRows?.map((row: { lesson_id: any }) => row.lesson_id) ?? [];
  }

  const completedSet = new Set(completedLessonIds);
  // First lesson (in course order) that isn't done yet — this is what
  // "Continue learning" should open. `null` means every lesson is done.
  const nextLesson = allLessons.find(
    (lesson: { id: string }) => !completedSet.has(lesson.id),
  );

  return NextResponse.json({
    course,
    isEnrolled,
    isLoggedIn: !!user,
    completedLessonIds,
    nextLessonId: nextLesson?.id ?? null,
    totalLessons: allLessons.length,
    completedLessons: completedLessonIds.length,
  });
}
