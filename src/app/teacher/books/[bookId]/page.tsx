import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import BookQuestionsView from './BookQuestionsView';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get book info
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', parseInt(bookId))
    .single();

  if (!book) notFound();

  // Get all questions for this book with student profiles and feedbacks
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      ai_feedback,
      created_at,
      student_id,
      profiles:student_id (id, name, class_name),
      teacher_feedbacks (id, feedback_text, created_at, teacher_id, profiles:teacher_id (name))
    `)
    .eq('book_id', parseInt(bookId))
    .order('created_at', { ascending: false });

  return (
    <BookQuestionsView
      book={book}
      questions={questions || []}
    />
  );
}
