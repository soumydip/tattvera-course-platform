import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatar_url: z.string().trim().url().max(500).nullable().optional(),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, name:full_name, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Unable to load profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? null },
    profile,
  });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please check the profile fields." },
      { status: 400 },
    );
  }

  const updates = {
    id: user.id,
    name: result.data.full_name ?? null,
    bio: result.data.bio ?? null,
    avatar_url: result.data.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error } = await supabase
    .from("users")
    .upsert(updates)
    .select("id, name:full_name, bio, avatar_url")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Unable to save profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? null },
    profile,
  });
}
