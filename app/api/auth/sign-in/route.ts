import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = getSafeNextPath(searchParams.get("next"));
  const redirectTo = new URL("/api/auth/callback", origin);
  redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: redirectTo.toString() },
  });

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to start sign-in" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.url });
}
