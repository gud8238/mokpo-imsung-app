import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherDashboard from './TeacherDashboard';

export default async function TeacherPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get all students
  const { data: students } = await supabase
    .from('profiles')
    .select('id, name, class_name')
    .eq('role', 'student')
    .order('class_name')
    .order('name');

  // Get all books
  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, cover_image_url')
    .order('title');

  // Get question counts per student
  const { data: questionsByStudent } = await supabase
    .from('questions')
    .select('student_id');

  // Get question counts per book
  const { data: questionsByBook } = await supabase
    .from('questions')
    .select('book_id');

  // Count questions per student
  const studentQuestionCounts: Record<string, number> = {};
  questionsByStudent?.forEach((q) => {
    studentQuestionCounts[q.student_id] = (studentQuestionCounts[q.student_id] || 0) + 1;
  });

  // Count questions per book
  const bookQuestionCounts: Record<number, number> = {};
  questionsByBook?.forEach((q) => {
    bookQuestionCounts[q.book_id] = (bookQuestionCounts[q.book_id] || 0) + 1;
  });

  return (
    <TeacherDashboard
      students={students || []}
      books={books || []}
      studentQuestionCounts={studentQuestionCounts}
      bookQuestionCounts={bookQuestionCounts}
    />
  );
}
