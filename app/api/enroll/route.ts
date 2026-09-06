import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Validate the request body
  const body = await request.json();
  const parsed = enrollSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { courseId } = parsed.data;

  // Confirm the course actually exists before enrolling
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Insert enrollment — RLS ensures user_id must match auth.uid()
  const { data: enrollment, error: insertError } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId })
    .select()
    .single();

  if (insertError) {
    // Unique constraint violation = already enrolled
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ enrollment }, { status: 201 });
}
