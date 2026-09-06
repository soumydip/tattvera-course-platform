import type { Enrollment } from "@/types/course";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  // Get user's enrolled courses
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        course:courses (
          id,
          title,
          description,
          chapters (
            position,
            lessons (
              id,
              position
            )
          )
        )
      `,
    )
    .eq("user_id", user.id)
    .returns<Enrollment[]>();

  if (enrollmentError) {
    return Response.json({ error: enrollmentError.message }, { status: 500 });
  }

  // Get user's completed lessons
  const { data: progressRows, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (progressError) {
    return Response.json({ error: progressError.message }, { status: 500 });
  }

  const completedLessonIds = progressRows?.map((row) => row.lesson_id) ?? [];

  return Response.json({
    enrollments,
    completedLessonIds,
  });
}
