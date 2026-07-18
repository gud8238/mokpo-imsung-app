// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: supabaseMocks.getUser },
    from: supabaseMocks.from,
  }),
}));

import { POST } from './route';

const validBody = {
  studentId: 'student-1',
  summary: '책의 내용을 질문으로 잘 표현합니다.',
  strengths: '궁금한 점을 구체적으로 찾습니다.',
  areasForImprovement: '평가 질문을 더 만들어 보세요.',
};

function request(body: unknown) {
  return new Request('http://localhost/api/download-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockTeacherData(role = 'teacher') {
  const viewerProfile = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  };
  const studentProfile = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 'student-1', name: '1학년 1번', class_name: '1학년 1반' },
      error: null,
    }),
  };
  const questions = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({
      data: [
        { question_type: 'factual' },
        { question_type: 'inferential' },
        { question_type: 'evaluative' },
      ],
      error: null,
    }),
  };

  let profileCall = 0;
  supabaseMocks.from.mockImplementation((table: string) => {
    if (table === 'profiles') return profileCall++ === 0 ? viewerProfile : studentProfile;
    if (table === 'questions') return questions;
    throw new Error(`Unexpected table: ${table}`);
  });
}

describe('POST /api/download-pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.getUser.mockResolvedValue({ data: { user: { id: 'teacher-1' } } });
    mockTeacherData();
  });

  it('requires an authenticated teacher', async () => {
    supabaseMocks.getUser.mockResolvedValueOnce({ data: { user: null } });
    expect((await POST(request(validBody))).status).toBe(401);

    vi.clearAllMocks();
    supabaseMocks.getUser.mockResolvedValue({ data: { user: { id: 'student-2' } } });
    mockTeacherData('student');
    expect((await POST(request(validBody))).status).toBe(403);
  });

  it('rejects incomplete or oversized diagnosis data', async () => {
    expect((await POST(request({ studentId: 'student-1' }))).status).toBe(400);

    mockTeacherData();
    expect((await POST(request({ ...validBody, summary: '가'.repeat(8_001) }))).status).toBe(413);
  });

  it('rebuilds identity and statistics server-side and returns a Korean PDF', async () => {
    const response = await POST(request(validBody));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(decodeURIComponent(response.headers.get('Content-Disposition') || '')).toContain('1학년 1번_질문진단결과.pdf');
    expect(new TextDecoder('latin1').decode((await response.arrayBuffer()).slice(0, 5))).toBe('%PDF-');
    expect(supabaseMocks.from).toHaveBeenCalledWith('questions');
  }, 15_000);
});
