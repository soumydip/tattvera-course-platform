export type Lesson = {
  id: string;
  position: number;
};

export type Chapter = {
  position: number;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  chapters: Chapter[];
};

export type Enrollment = {
  id: string;
  course: Course | null;
};
