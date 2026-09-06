import { getBaseUrl } from "@/lib/get-base-url";
import { CourseCatalog } from "@/components/course-catalog";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
};

export default async function CoursesPage() {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/courses`, {
    cache: "no-store", // always fetch fresh course data
  });

  if (!res.ok) {
    return (
      <p className="p-8 text-red-500">
        Failed to load courses. Please try again later.
      </p>
    );
  }

  const { courses }: { courses: Course[] } = await res.json();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-secondary-foreground">
            The catalogue
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Learn something that lasts.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Focused courses that explain the principle behind the practice.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {courses?.length ?? 0} courses
        </p>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground">
          No courses available yet.
        </div>
      ) : (
        <CourseCatalog courses={courses} />
      )}
    </div>
  );
}
