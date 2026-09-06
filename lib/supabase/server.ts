import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this client inside Server Components, API routes, and Server
// Actions. It reads/writes the session from Next.js cookies, which is
// what makes auth.uid() available to RLS policies on the DB side.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignore errors when setting cookies, as this can happen if the user has disabled cookies in their browser.
          }
        },
      },
    },
  );
}
