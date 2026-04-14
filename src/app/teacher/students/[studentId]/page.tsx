import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import StudentQuestionsView from './StudentQuestionsView';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get student profile
  const { data: student } = await supabase
    .from('profiles')
    .select('id, name, class_name')
    .eq('id', studentId)
    .single();

  if (!student) notFound();

  // Get student's questions with books and feedbacks
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      ai_feedback,
      created_at,
      book_id,
      books (id, title, author, cover_image_url),
      teacher_feedbacks (id, feedback_text, created_at, teacher_id, profiles:teacher_id (name))
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  return (
    <StudentQuestionsView
      student={student}
      questions={questions || []}
    />
  );
}
