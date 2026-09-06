
-- COURSE 1: Web Development
with course_1 as (
  insert into public.courses (title, description, price)
  values (
    'Full Stack Web Development with Next.js',
    'Learn to build modern, production-grade web apps using Next.js, TypeScript, and Postgres — from routing and server components to auth and deployment.',
    2999
  )
  returning id
),
chapter_1_1 as (
  insert into public.chapters (course_id, title, position)
  select id, 'Getting Started', 1 from course_1
  returning id
),
chapter_1_2 as (
  insert into public.chapters (course_id, title, position)
  select id, 'Working with Data', 2 from course_1
  returning id
)
insert into public.lessons (chapter_id, title, content, position)
select id, title, content, position from (
  select chapter_1_1.id as chapter_id, 'Installing Next.js' as title,
         'Set up a new Next.js project with TypeScript and Tailwind CSS.' as content, 1 as position from chapter_1_1
  union all
  select chapter_1_1.id, 'Understanding the App Router',
         'Learn how file-based routing works with layouts, pages, and route groups.', 2 from chapter_1_1
  union all
  select chapter_1_1.id, 'Server vs Client Components',
         'When to use each, and how they affect performance and bundle size.', 3 from chapter_1_1
  union all
  select chapter_1_2.id, 'Connecting to Postgres',
         'Set up a Supabase project and connect it to your Next.js app.', 1 from chapter_1_2
  union all
  select chapter_1_2.id, 'Fetching Data in Server Components',
         'Query your database directly inside server-rendered pages.', 2 from chapter_1_2
) t;

-- COURSE 2: Machine Learning
with course_2 as (
  insert into public.courses (title, description, price)
  values (
    'Machine Learning for Beginners',
    'A hands-on introduction to machine learning using Python and Scikit-learn, covering classification, regression, and model evaluation.',
    1999
  )
  returning id
),
chapter_2_1 as (
  insert into public.chapters (course_id, title, position)
  select id, 'ML Fundamentals', 1 from course_2
  returning id
)
insert into public.lessons (chapter_id, title, content, position)
select id, title, content, position from (
  select chapter_2_1.id as chapter_id, 'What is Machine Learning?' as title,
         'An overview of supervised, unsupervised, and reinforcement learning.' as content, 1 as position from chapter_2_1
  union all
  select chapter_2_1.id, 'Training Your First Model',
         'Build a simple classifier using Scikit-learn on a sample dataset.', 2 from chapter_2_1
  union all
  select chapter_2_1.id, 'Evaluating Model Performance',
         'Understand accuracy, precision, recall, and confusion matrices.', 3 from chapter_2_1
) t;

-- COURSE 3: DSA
with course_3 as (
  insert into public.courses (title, description, price)
  values (
    'Data Structures & Algorithms in TypeScript',
    'Master arrays, linked lists, trees, graphs, and common algorithm patterns — with problems solved step by step in TypeScript.',
    1499
  )
  returning id
),
chapter_3_1 as (
  insert into public.chapters (course_id, title, position)
  select id, 'Arrays & Strings', 1 from course_3
  returning id
)
insert into public.lessons (chapter_id, title, content, position)
select id, title, content, position from (
  select chapter_3_1.id as chapter_id, 'Two Pointer Technique' as title,
         'Solve array problems efficiently using the two pointer pattern.' as content, 1 as position from chapter_3_1
  union all
  select chapter_3_1.id, 'Sliding Window',
         'Optimize substring and subarray problems with the sliding window technique.', 2 from chapter_3_1
) t;