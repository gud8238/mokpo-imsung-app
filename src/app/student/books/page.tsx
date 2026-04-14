import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BooksGrid from './BooksGrid';

export default async function BooksPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  return <BooksGrid books={books || []} studentName={profile?.name || '학생'} />;
}
