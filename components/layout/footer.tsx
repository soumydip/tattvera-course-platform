import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <span>Tattvera</span>
        <div className="flex gap-5">
          <Link href="/courses" className="hover:text-foreground">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <a
            href="https://github.com/soumydip/tattvera-course-platform"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
