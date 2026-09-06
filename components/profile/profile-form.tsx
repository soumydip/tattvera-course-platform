"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile, ProfileResponse } from "@/types/profile";

type ProfileFormProps = {
  userEmail: string | null;
  profile: Profile | null;
};

export function ProfileForm({ userEmail, profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
        }),
      });

      if (!response.ok) throw new Error("Profile update failed");

      const data = (await response.json()) as ProfileResponse;
      setFullName(data.profile?.full_name ?? "");
      setBio(data.profile?.bio ?? "");
      setAvatarUrl(data.profile?.avatar_url ?? "");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={userEmail ?? ""} disabled />
        <p className="text-xs text-muted-foreground">
          Your email is managed by sign-in.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full-name">Full name</Label>
        <Input
          id="full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={100}
          placeholder="How should we call you?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Tell us a little about yourself."
          className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-url">Avatar URL</Label>
        <Input
          id="avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          maxLength={500}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? <Loader2 className="animate-spin" /> : null}
          Save profile
        </Button>
        {status === "saved" ? (
          <span className="flex items-center gap-1.5 text-sm text-secondary-foreground">
            <Check className="size-4" /> Saved
          </span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm text-destructive">
            Could not save changes.
          </span>
        ) : null}
      </div>
    </form>
  );
}
