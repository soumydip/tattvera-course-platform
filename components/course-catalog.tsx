"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
};

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return courses;
    return courses.filter((course) =>
      `${course.title} ${course.description ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [courses, query]);

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses..."
          aria-label="Search courses"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 font-medium">No courses match that search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different title or topic.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group">
              <Card className="h-full border-border/80 bg-card transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
                <CardHeader className="gap-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <BookOpen className="size-5" />
                    </span>
                    <Badge variant="secondary">₹{course.price}</Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-3">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {course.description}
                  </p>
                  <ArrowRight className="mb-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
