import { NextResponse } from 'next/server';
// @ts-ignore
import { convertMarkdownToHwp } from 'md2hwp';

export async function POST(request: Request) {
  try {
    let studentName, summary, strengths, areas_for_improvement;
    const contentType = request.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      ({ studentName, summary, strengths, areas_for_improvement } = body);
    } else {
      const formData = await request.formData();
      studentName = formData.get('studentName') as string;
      summary = formData.get('summary') as string;
      strengths = formData.get('strengths') as string;
      areas_for_improvement = formData.get('areas_for_improvement') as string;
    }

    // HWP 표 생성을 위한 Markdown 조합
    const cleanSummary = (summary || '').replace(/\n/g, ' ');
    const cleanStrengths = (strengths || '').replace(/\n/g, ' ');
    const cleanAreas = (areas_for_improvement || '').replace(/\n/g, ' ');

    const md = `
# 학생 질문 수준 종합 진단 보고서 - ${studentName}

| 항목 | 내용 |
| --- | --- |
| 총평 | ${cleanSummary} |
| 잘하고 있는 점 | ${cleanStrengths} |
| 앞으로의 발전 방향 | ${cleanAreas} |
`;

    const buffer = await convertMarkdownToHwp(md);

    // Node.js Buffer를 Uint8Array로 명확히 변환하여 Next.js 응답 시 손상 방지
    const uint8Array = new Uint8Array(buffer);

    const fileName = encodeURIComponent(`${studentName}_질문진단결과.hwpx`);

    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.hancom.hwpx',
        'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
        'Content-Length': uint8Array.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('HWPX generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HWPX file' },
      { status: 500 }
    );
  }
}
