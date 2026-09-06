"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "../auth/sign-out-button";

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: { id: string } | null } | null) => {
        if (active) setIsLoggedIn(!!data?.user);
      })
      .catch(() => {
        if (active) setIsLoggedIn(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-[family-name:var(--font-rajdhani)] text-xl font-semibold tracking-tight"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground shadow-sm transition-transform group-hover:rotate-3">
            T
          </span>
          <span>Tattvera<span className="text-secondary-foreground">.</span></span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <nav className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-x-4 top-[4.5rem] flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          <Link
            href="/courses"
            onClick={() => setIsMenuOpen(false)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground md:px-0 md:py-1 md:hover:bg-transparent ${pathname.startsWith("/courses") ? "font-medium text-foreground" : "text-muted-foreground"}`}
          >
            Courses
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground md:px-0 md:py-1 md:hover:bg-transparent ${pathname === "/dashboard" ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                Dashboard
              </Link>
              <span className="hidden h-4 w-px bg-border md:block" />
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="md:ml-1">
              <Button variant="outline" size="sm" className="w-full md:w-auto">
                Log in <ArrowUpRight className="size-3.5" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
