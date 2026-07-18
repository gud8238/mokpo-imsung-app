// @vitest-environment node

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { generateDiagnosisPdf, sanitizePdfFilename } from './diagnosis-pdf';

const baseInput = {
  studentName: '1학년 1번',
  className: '1학년 1반',
  summary: '책의 중요한 내용을 기억하고 자신의 궁금증을 질문으로 잘 표현하고 있습니다.',
  strengths: '사실 질문에서 출발해 인물의 마음과 사건의 까닭을 생각하는 질문으로 넓혀 갑니다.',
  areasForImprovement: '라면 질문을 조금 더 자주 만들어 자신의 생각과 생활 경험을 연결해 보세요.',
  questionCount: 6,
  typeCounts: { factual: 3, inferential: 2, evaluative: 1 },
  generatedAt: new Date('2026-07-19T00:00:00+09:00'),
};

describe('diagnosis PDF', () => {
  it('creates a safe Korean PDF filename', () => {
    expect(sanitizePdfFilename(' 1학년/1반:김별* ')).toBe('1학년_1반_김별__질문진단결과.pdf');
    expect(sanitizePdfFilename('   ')).toBe('학생_질문진단결과.pdf');
  });

  it('creates a loadable A4 PDF with diagnosis metadata and question statistics', async () => {
    const bytes = await generateDiagnosisPdf(baseInput);

    expect(new TextDecoder('latin1').decode(bytes.slice(0, 5))).toBe('%PDF-');

    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(document.getTitle()).toBe('1학년 1번 질문 진단 결과');
    expect(document.getSubject()).toContain('전체 6개');
    expect(document.getKeywords()).toContain('사실 질문 3개');
    expect(document.getKeywords()).toContain('궁금 질문 2개');
    expect(document.getKeywords()).toContain('라면 질문 1개');
  });

  it('adds pages instead of clipping long Korean diagnosis text', async () => {
    const longParagraph = '질문을 만들며 책 속 장면과 인물의 마음을 차근차근 연결해 생각하고 있습니다. '.repeat(40);
    const bytes = await generateDiagnosisPdf({
      ...baseInput,
      summary: longParagraph,
      strengths: longParagraph,
      areasForImprovement: longParagraph,
    });

    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBeGreaterThan(1);
  }, 15_000);

  it('refuses unbounded diagnosis text before allocating PDF pages', async () => {
    const enormousParagraph = '질문의 깊이를 계속 살펴봅니다. '.repeat(1_000);

    await expect(generateDiagnosisPdf({
      ...baseInput,
      summary: enormousParagraph,
      strengths: enormousParagraph,
      areasForImprovement: enormousParagraph,
    })).rejects.toThrow('Diagnosis text limit exceeded');
  }, 15_000);
});
