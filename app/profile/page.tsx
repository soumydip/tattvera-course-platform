import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/get-base-url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import type { ProfileResponse } from "@/types/profile";

export default async function ProfilePage() {
  const cookieHeader = (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const response = await fetch(`${await getBaseUrl()}/api/profile`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (response.status === 401) redirect("/login");
  if (!response.ok) {
    return <p className="p-8 text-red-500">Failed to load profile</p>;
  }

  const { user, profile }: ProfileResponse = await response.json();

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-secondary-foreground">
          Account settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your profile
        </h1>
        <p className="mt-3 text-muted-foreground">
          Keep your learner details up to date.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm userEmail={user.email ?? null} profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
