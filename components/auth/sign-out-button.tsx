"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    const response = await fetch("/api/auth/sign-out", { method: "POST" });
    if (!response.ok) {
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
    >
      Log out
    </Button>
  );
}
