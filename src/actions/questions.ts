'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeQuestion, type AIAnalysisResult } from '@/lib/gemini';

export async function submitQuestion(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  aiResult?: AIAnalysisResult;
  questionId?: number;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const bookId = parseInt(formData.get('bookId') as string);
  const questionText = formData.get('questionText') as string;
  const questionType = formData.get('questionType') as string;

  if (!questionText || !questionType) {
    return { success: false, error: '질문과 질문 유형을 모두 입력해주세요.' };
  }

  // Get book title for AI analysis
  const { data: book } = await supabase
    .from('books')
    .select('title')
    .eq('id', bookId)
    .single();

  if (!book) {
    return { success: false, error: '책을 찾을 수 없습니다.' };
  }

  // Analyze with Gemini AI
  const aiResult = await analyzeQuestion(book.title, questionText, questionType);

  // Save question with AI feedback
  const { data: question, error } = await supabase
    .from('questions')
    .insert({
      student_id: user.id,
      book_id: bookId,
      question_text: questionText,
      question_type: questionType,
      ai_feedback: JSON.stringify(aiResult),
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: '질문 저장에 실패했습니다: ' + error.message };
  }

  return { success: true, aiResult, questionId: question.id };
}

export async function deleteQuestion(questionId: number) {
  const supabase = await createClient();

  // First delete associated feedbacks
  await supabase
    .from('teacher_feedbacks')
    .delete()
    .eq('question_id', questionId);

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const questionId = parseInt(formData.get('questionId') as string);
  const feedbackText = formData.get('feedbackText') as string;

  if (!feedbackText) {
    return { success: false, error: '피드백 내용을 입력해주세요.' };
  }

  const { error } = await supabase
    .from('teacher_feedbacks')
    .insert({
      question_id: questionId,
      teacher_id: user.id,
      feedback_text: feedbackText,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteFeedback(feedbackId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('teacher_feedbacks')
    .delete()
    .eq('id', feedbackId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function evaluateStudentQuestions(studentId: string, studentName: string) {
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from('questions')
    .select('question_text, question_type, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true }); // chronological order

  if (!questions || questions.length === 0) {
    return { success: false, error: '분석할 질문 기록이 부족합니다.' };
  }

  const typeLabelMap: Record<string, string> = {
    factual: '사실적 질문',
    inferential: '추론적 질문',
    evaluative: '평가적 질문',
  };

  const formattedQuestions = questions.map((q) => ({
    text: q.question_text,
    type: typeLabelMap[q.question_type] || q.question_type,
    date: new Date(q.created_at).toLocaleDateString('ko-KR'),
  }));

  const { analyzeStudentProgress } = await import('@/lib/gemini');
  const result = await analyzeStudentProgress(studentName, formattedQuestions);

  return { success: true, result };
}
