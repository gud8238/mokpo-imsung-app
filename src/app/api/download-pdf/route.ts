import { NextResponse } from 'next/server';
import {
  generateDiagnosisPdf,
  MAX_DIAGNOSIS_SECTION_LENGTH,
  MAX_DIAGNOSIS_TOTAL_LENGTH,
  sanitizePdfFilename,
} from '@/lib/diagnosis-pdf';
import { createClient } from '@/lib/supabase/server';

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_ID_LENGTH = 128;

interface DiagnosisRequest {
  studentId: string;
  summary: string;
  strengths: string;
  areasForImprovement: string;
}

function parseDiagnosisRequest(body: unknown): { input?: DiagnosisRequest; status?: 400 | 413 } {
  if (!body || typeof body !== 'object') return { status: 400 };
  const value = body as Record<string, unknown>;
  const fields = [value.summary, value.strengths, value.areasForImprovement];

  if (
    typeof value.studentId !== 'string' || !value.studentId.trim() || value.studentId.length > MAX_ID_LENGTH ||
    fields.some((field) => typeof field !== 'string' || !field.trim())
  ) {
    return { status: 400 };
  }

  const texts = fields as string[];
  if (
    texts.some((text) => text.length > MAX_DIAGNOSIS_SECTION_LENGTH) ||
    texts.reduce((sum, text) => sum + text.length, 0) > MAX_DIAGNOSIS_TOTAL_LENGTH
  ) {
    return { status: 413 };
  }

  return {
    input: {
      studentId: value.studentId.trim(),
      summary: texts[0].trim(),
      strengths: texts[1].trim(),
      areasForImprovement: texts[2].trim(),
    },
  };
}

async function readRequestBody(request: Request) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return { status: 413 as const };
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return { status: 413 as const };
  }

  try {
    return parseDiagnosisRequest(JSON.parse(rawBody));
  } catch {
    return { status: 400 as const };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (viewerProfile?.role !== 'teacher') {
      return NextResponse.json({ error: '교사만 PDF 보고서를 만들 수 있습니다.' }, { status: 403 });
    }

    const parsed = await readRequestBody(request);
    if (!parsed.input) {
      const status = parsed.status ?? 400;
      const error = status === 413
        ? '진단 내용이 너무 깁니다.'
        : '진단 결과를 확인해주세요.';
      return NextResponse.json({ error }, { status });
    }

    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, name, class_name')
      .eq('id', parsed.input.studentId)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: '학생 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('question_type')
      .eq('student_id', student.id);

    if (questionsError) {
      return NextResponse.json({ error: '질문 통계를 불러오지 못했습니다.' }, { status: 500 });
    }

    const typeCounts = { factual: 0, inferential: 0, evaluative: 0 };
    for (const question of questions ?? []) {
      const type = question.question_type as keyof typeof typeCounts;
      if (type in typeCounts) typeCounts[type] += 1;
    }

    const pdfBytes = await generateDiagnosisPdf({
      studentName: student.name,
      className: student.class_name,
      summary: parsed.input.summary,
      strengths: parsed.input.strengths,
      areasForImprovement: parsed.input.areasForImprovement,
      questionCount: questions?.length ?? 0,
      typeCounts,
    });
    const filename = encodeURIComponent(sanitizePdfFilename(student.name));
    const responseBody = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(responseBody).set(pdfBytes);

    return new Response(responseBody, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
        'Content-Length': pdfBytes.byteLength.toString(),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'PDF 파일을 만들지 못했습니다.' }, { status: 500 });
  }
}
