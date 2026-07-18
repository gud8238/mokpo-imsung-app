import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
} from 'pdf-lib';

export interface DiagnosisPdfInput {
  studentName: string;
  className?: string | null;
  summary: string;
  strengths: string;
  areasForImprovement: string;
  questionCount: number;
  typeCounts: {
    factual: number;
    inferential: number;
    evaluative: number;
  };
  generatedAt?: Date;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const FOOTER_Y = 28;
const BODY_SIZE = 10.5;
const BODY_LINE_HEIGHT = 16.5;
const MAX_PDF_PAGES = 12;

export const MAX_DIAGNOSIS_SECTION_LENGTH = 8_000;
export const MAX_DIAGNOSIS_TOTAL_LENGTH = 16_000;

const palette = {
  ink: rgb(0.12, 0.16, 0.25),
  muted: rgb(0.39, 0.44, 0.53),
  student: rgb(0.45, 0.35, 0.85),
  teacher: rgb(0.21, 0.42, 0.62),
  sun: rgb(1, 0.83, 0.36),
  paper: rgb(0.97, 0.98, 1),
  white: rgb(1, 1, 1),
  summary: rgb(0.91, 0.94, 1),
  strength: rgb(0.91, 0.97, 0.93),
  growth: rgb(1, 0.97, 0.86),
};

let fontBytesPromise: Promise<Buffer> | null = null;

function loadFonts() {
  if (!fontBytesPromise) {
    fontBytesPromise = readFile(join(process.cwd(), 'public', 'fonts', 'Pretendard-Regular.ttf'));
  }
  return fontBytesPromise;
}

export function sanitizePdfFilename(studentName: string) {
  const safeName = studentName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_') || '학생';
  return `${safeName}_질문진단결과.pdf`;
}

function splitLongToken(token: string, font: PDFFont, size: number, maxWidth: number) {
  const pieces: string[] = [];
  let current = '';

  for (const character of Array.from(token)) {
    const candidate = current + character;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      pieces.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }

  if (current) pieces.push(current);
  return pieces;
}

export function wrapPdfText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];

  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const tokens = paragraph.split(/(\s+)/).filter(Boolean);
    let line = '';

    for (const token of tokens) {
      const tokenParts = font.widthOfTextAtSize(token, size) > maxWidth
        ? splitLongToken(token, font, size, maxWidth)
        : [token];

      for (const part of tokenParts) {
        const candidate = line + part;
        if (line.trim() && font.widthOfTextAtSize(candidate, size) > maxWidth) {
          lines.push(line.trimEnd());
          line = part.trimStart();
        } else {
          line = candidate;
        }
      }
    }

    if (line.trim() || lines.length === 0) lines.push(line.trimEnd());
  }

  return lines;
}

function drawPolygonDecoration(page: PDFPage) {
  page.drawSvgPath('M 0 0 L 150 0 L 105 68 Z', {
    x: PAGE_WIDTH - 126,
    y: PAGE_HEIGHT - 32,
    color: palette.student,
    opacity: 0.24,
  });
  page.drawSvgPath('M 0 0 L 82 0 L 112 72 L 28 58 Z', {
    x: PAGE_WIDTH - 86,
    y: PAGE_HEIGHT - 118,
    color: palette.sun,
    opacity: 0.32,
  });
}

function drawPageBase(page: PDFPage, isFirstPage: boolean, boldFont: PDFFont) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: palette.paper });
  page.drawRectangle({
    x: 0,
    y: isFirstPage ? PAGE_HEIGHT - 190 : PAGE_HEIGHT - 72,
    width: PAGE_WIDTH,
    height: isFirstPage ? 190 : 72,
    color: isFirstPage ? palette.ink : palette.teacher,
  });
  drawPolygonDecoration(page);

  if (!isFirstPage) {
    page.drawText('BOOK돋움 질문도감 · AI 질문 진단', {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 45,
      size: 12,
      font: boldFont,
      color: palette.white,
    });
  }
}

function drawStatCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent: ReturnType<typeof rgb>,
  regularFont: PDFFont,
  boldFont: PDFFont,
) {
  page.drawRectangle({ x, y, width, height: 62, color: palette.white, opacity: 0.88 });
  page.drawRectangle({ x: x + 12, y: y + 13, width: 36, height: 36, color: accent, opacity: 0.92 });
  page.drawText(value, { x: x + 59, y: y + 31, size: 15, font: boldFont, color: palette.ink });
  page.drawText(label, { x: x + 59, y: y + 15, size: 8.5, font: regularFont, color: palette.muted });
}

export async function generateDiagnosisPdf(input: DiagnosisPdfInput) {
  const diagnosisTexts = [input.summary, input.strengths, input.areasForImprovement];
  if (
    diagnosisTexts.some((text) => text.length > MAX_DIAGNOSIS_SECTION_LENGTH) ||
    diagnosisTexts.reduce((sum, text) => sum + text.length, 0) > MAX_DIAGNOSIS_TOTAL_LENGTH
  ) {
    throw new Error('Diagnosis text limit exceeded');
  }

  const regularBytes = await loadFonts();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const regularFont = await pdf.embedFont(regularBytes);
  const boldFont = regularFont;

  const generatedAt = input.generatedAt ?? new Date();
  const generatedDate = generatedAt.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  pdf.setTitle(`${input.studentName} 질문 진단 결과`);
  pdf.setAuthor('목포임성초 BOOK돋움 질문도감');
  pdf.setSubject(`전체 ${input.questionCount}개 질문의 AI 독서 질문 진단`);
  pdf.setKeywords([
    `사실 질문 ${input.typeCounts.factual}개`,
    `궁금 질문 ${input.typeCounts.inferential}개`,
    `라면 질문 ${input.typeCounts.evaluative}개`,
  ]);
  pdf.setCreationDate(generatedAt);
  pdf.setModificationDate(generatedAt);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageBase(page, true, boldFont);

  page.drawText('AI QUESTION DIAGNOSIS', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 52,
    size: 8.5,
    font: boldFont,
    color: palette.sun,
  });
  page.drawText('질문으로 자란 생각을', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 92,
    size: 24,
    font: boldFont,
    color: palette.white,
  });
  page.drawText('한눈에 살펴봐요', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 123,
    size: 24,
    font: boldFont,
    color: palette.white,
  });
  page.drawText('BOOK돋움 질문도감이 정리한 독서 질문 성장 리포트', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 154,
    size: 9.5,
    font: regularFont,
    color: rgb(0.82, 0.86, 0.94),
  });

  page.drawText(input.studentName, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 229,
    size: 20,
    font: boldFont,
    color: palette.ink,
  });
  page.drawText(`${input.className ? `${input.className} · ` : ''}${generatedDate}`, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 250,
    size: 9,
    font: regularFont,
    color: palette.muted,
  });

  const cardGap = 10;
  const cardWidth = (CONTENT_WIDTH - cardGap * 2) / 3;
  const statY = PAGE_HEIGHT - 332;
  drawStatCard(page, PAGE_MARGIN, statY, cardWidth, '사실 질문', `${input.typeCounts.factual}개`, palette.teacher, regularFont, boldFont);
  drawStatCard(page, PAGE_MARGIN + cardWidth + cardGap, statY, cardWidth, '궁금 질문', `${input.typeCounts.inferential}개`, palette.student, regularFont, boldFont);
  drawStatCard(page, PAGE_MARGIN + (cardWidth + cardGap) * 2, statY, cardWidth, '라면 질문', `${input.typeCounts.evaluative}개`, palette.sun, regularFont, boldFont);

  let cursorY = statY - 36;

  const newContinuationPage = () => {
    if (pdf.getPageCount() >= MAX_PDF_PAGES) {
      throw new Error('PDF page limit exceeded');
    }
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageBase(page, false, boldFont);
    cursorY = PAGE_HEIGHT - 106;
  };

  const drawSection = (label: string, text: string, fill: ReturnType<typeof rgb>, accent: ReturnType<typeof rgb>) => {
    const lines = wrapPdfText(text || '내용이 없습니다.', regularFont, BODY_SIZE, CONTENT_WIDTH - 42);
    let offset = 0;
    let continued = false;

    while (offset < lines.length) {
      const availableHeight = cursorY - 66;
      const maxLines = Math.max(1, Math.floor((availableHeight - 52) / BODY_LINE_HEIGHT));
      if (maxLines < 2) {
        newContinuationPage();
        continue;
      }

      const chunk = lines.slice(offset, offset + maxLines);
      const cardHeight = 48 + chunk.length * BODY_LINE_HEIGHT;
      page.drawRectangle({
        x: PAGE_MARGIN,
        y: cursorY - cardHeight,
        width: CONTENT_WIDTH,
        height: cardHeight,
        color: fill,
        opacity: 0.94,
      });
      page.drawRectangle({
        x: PAGE_MARGIN,
        y: cursorY - cardHeight,
        width: 6,
        height: cardHeight,
        color: accent,
      });
      page.drawText(continued ? `${label} (계속)` : label, {
        x: PAGE_MARGIN + 22,
        y: cursorY - 29,
        size: 12,
        font: boldFont,
        color: palette.ink,
      });
      page.drawText(chunk.join('\n'), {
        x: PAGE_MARGIN + 22,
        y: cursorY - 51,
        size: BODY_SIZE,
        lineHeight: BODY_LINE_HEIGHT,
        font: regularFont,
        color: palette.ink,
        maxWidth: CONTENT_WIDTH - 42,
      });

      offset += chunk.length;
      cursorY -= cardHeight + 16;
      continued = true;
      if (offset < lines.length) newContinuationPage();
    }
  };

  drawSection('한눈에 보는 총평', input.summary, palette.summary, palette.teacher);
  drawSection('잘하고 있는 점', input.strengths, palette.strength, rgb(0.25, 0.68, 0.4));
  drawSection('앞으로의 성장 방향', input.areasForImprovement, palette.growth, rgb(0.93, 0.62, 0.12));

  for (const [index, currentPage] of pdf.getPages().entries()) {
    currentPage.drawText('목포임성초 BOOK돋움 질문도감', {
      x: PAGE_MARGIN,
      y: FOOTER_Y,
      size: 7.5,
      font: regularFont,
      color: palette.muted,
    });
    const pageNumber = `${index + 1} / ${pdf.getPageCount()}`;
    currentPage.drawText(pageNumber, {
      x: PAGE_WIDTH - PAGE_MARGIN - regularFont.widthOfTextAtSize(pageNumber, 7.5),
      y: FOOTER_Y,
      size: 7.5,
      font: regularFont,
      color: palette.muted,
    });
  }

  return pdf.save();
}
