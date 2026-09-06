import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBaseUrl } from "@/lib/get-base-url";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
};

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
    if (!res.ok) return [];
    const { courses } = await res.json();
    return (courses ?? []).slice(0, 3);
  } catch {
    return [];
  }
}

// Illustrative chapter stack for the hero — not live data, just the shape
// of what a course actually looks like once you open it.
const PRINCIPLES = [
  { n: "01", label: "Why arrays are contiguous", width: 92 },
  { n: "02", label: "Indexes: how lookups get fast", width: 76 },
  { n: "03", label: "Rendering, from DOM to pixels", width: 64 },
  { n: "04", label: "What a session actually guards", width: 50 },
  { n: "05", label: "Concurrency without the jargon", width: 36 },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a course",
    body: "Every course page shows the full chapter and lesson breakdown before you enroll — no surprises once you're in.",
  },
  {
    n: "02",
    title: "Work through it, chapter by chapter",
    body: "Each lesson ends by asking why it works, not just how to reproduce it. That's the part tutorials usually skip.",
  },
  {
    n: "03",
    title: "Track exactly where you are",
    body: "Your dashboard shows lessons complete out of total, per course — so picking back up never means starting over.",
  },
];

export default async function Home() {
  const courses = await getFeaturedCourses();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Learn the tattva,
              <br />
              not the tutorial.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
              Tattva means the essential nature of a thing. Our courses are
              built the same way — chapter by chapter, from the underlying
              principle to the working code — so what you learn still holds up a
              year from now.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses">
                <Button size="lg" className="h-11 px-6">
                  Browse courses
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" size="lg" className="h-11 px-6">
                  How it works
                </Button>
              </Link>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {PRINCIPLES.map((p, i) => (
              <li key={p.n} className="flex items-center gap-3">
                <span className="w-6 shrink-0 font-mono text-xs text-[#223B5C]">
                  {p.n}
                </span>
                <div className="h-8 flex-1 border border-border bg-muted/40">
                  <div
                    className="animate-tattvera-grow h-full border-r-2 border-[#223B5C] bg-[#223B5C]/[0.06]"
                    style={
                      {
                        "--target-width": `${p.width}%`,
                        animationDelay: `${i * 120}ms`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block sm:w-40">
                  {p.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="font-mono text-xs text-[#223B5C]">
                  {step.n}
                </span>
                <h3 className="mt-2 text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-semibold tracking-tight">
              Courses
            </h2>
            <Link
              href="/courses"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {courses.length === 0 ? (
            <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Courses are being added — check back soon, or{" "}
              <Link href="/courses" className="underline underline-offset-2">
                see the catalogue
              </Link>
              .
            </p>
          ) : (
            <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">{course.title}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      ₹{course.price}
                    </Badge>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {course.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-lg leading-8 text-foreground">
            Most tutorials teach you to reproduce an outcome. We&apos;d rather
            you understand a thing well enough to rebuild it differently — with
            a different stack, a different constraint, a different bug staring
            back at you.
          </p>
        </div>
      </section>
    </>
  );
}
