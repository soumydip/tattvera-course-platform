import { headers } from "next/headers";

// Server Components can't call fetch("/api/...") with a relative path —
// fetch on the server needs an absolute URL. This builds one from the
// incoming request headers (works in dev, preview, and prod on Vercel)
// with an env var override if you set one.
export async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}
