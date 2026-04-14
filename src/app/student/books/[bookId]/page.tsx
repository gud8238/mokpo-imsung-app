import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import QuestionForm from './QuestionForm';

export default async function BookQuestionPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', parseInt(bookId))
    .single();

  if (!book) notFound();

  // Get previous questions for this book by this student
  const { data: previousQuestions } = await supabase
    .from('questions')
    .select('id, question_text, question_type, ai_feedback, created_at')
    .eq('student_id', user.id)
    .eq('book_id', book.id)
    .order('created_at', { ascending: false });

  return (
    <QuestionForm
      book={book}
      previousQuestions={previousQuestions || []}
    />
  );
}
