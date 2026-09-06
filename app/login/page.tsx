"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    const next = new URLSearchParams(window.location.search).get("next");
    const query = next ? `?next=${encodeURIComponent(next)}` : "";
    const response = await fetch(`/api/auth/sign-in${query}`);
    const data: { url?: string } = await response.json();

    if (response.ok && data.url) {
      window.location.assign(data.url);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute left-1/2 top-1/2 -z-10 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/70 blur-3xl" />
      <Card className="w-full max-w-sm border-border/80 shadow-xl shadow-primary/5">
        <CardHeader className="gap-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary font-[family-name:var(--font-rajdhani)] text-xl font-semibold text-primary-foreground">
            T
          </div>
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>
            Log in with GitHub to enroll in courses and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGitHubLogin} className="h-11 w-full">
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
