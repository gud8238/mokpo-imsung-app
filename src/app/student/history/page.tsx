import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HistoryView from './HistoryView';

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      ai_feedback,
      created_at,
      books (id, title, author, cover_image_url),
      teacher_feedbacks (id, feedback_text, created_at, profiles:teacher_id (name))
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  return <HistoryView questions={questions || []} />;
}
