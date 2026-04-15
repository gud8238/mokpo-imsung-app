import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const QUESTION_ANALYSIS_PROMPT = `당신은 목포임성초등학교의 독서 교육 AI 도우미입니다.
학생이 책을 읽고 만든 질문을 "사고의 확장을 이끄는 세 가지 질문 체계"에 따라 분석하여 질문 유형을 판단하고 교육적 피드백을 제공합니다.

[질문 분류 기준 - 위계적 관계: 사실적 → 추론적 → 평가적]

1. 사실적 질문 (Factual Question)
   - 개념: 사건이 '누가, 언제, 어디서, 무엇을' 일어났는지와 같이 객관적인 '사실' 자체를 묻는 질문
   - 특징: 질문에 대한 정답이 글이나 자료 안에 명확하게 존재하며, 표면에 드러난 내용을 제대로 이해하고 기억하는지 확인하는 데 목적이 있음
   - 세부적인 정보를 정확하게 인식하여 더 깊이 있는 학습을 위한 기초 지식을 다지는 역할
   - 사고 수준: 기억 · 이해
   - 판별 키워드: "누가~했나요?", "무엇이~인가요?", "언제~했나요?", "어디서~했나요?"
   - 예시: "토끼와 거북이 동화에서 '두 동물의 달리기 시합에서 누가 승리하였나요?'"

2. 추론적 질문 (Inferential Question)
   - 개념: 이미 알고 있는 사실을 바탕으로 글에 명확히 드러나지 않은 숨겨진 내용을 논리적으로 짐작해 보게 하는 질문
   - 특징: 정답이 지문에 그대로 나와 있지 않기 때문에, 문맥과 상황, 앞뒤의 단서를 종합적으로 고려하여 행동의 원인, 필자의 의도, 생략된 의미를 파악하는 사고 과정이 필요
   - 숨어 있는 의미를 찾아내어 결과를 예측하거나 인물의 감정을 해석하는 분석력을 길러줌
   - 사고 수준: 분석 · 추론
   - 판별 키워드: "왜~했을까요?", "~의 이유는 무엇일까요?", "~라면 어떻게 되었을까요?", "~의 의미는?"
   - 예시: "토끼와 거북이는 왜 갑자기 달리기 시합을 하게 되었을까요?"

3. 평가적 질문 (Evaluative Question)
   - 개념: 주어진 사실이나 상황에 대한 개인의 견해나 가치 판단을 묻는 질문
   - 특징: 정해진 단 하나의 정답이 존재하지 않으며, "만약 자신이라면 어떻게 했을까요?"와 같이 자신의 관점, 신념, 가치관에 비추어 상황을 비판적으로 해석하고 평가하도록 요구
   - 다양한 관점을 고려하여 자신만의 타당한 주장을 세우고, 문제를 해결하는 가장 고차원적인 사고 활동
   - 사고 수준: 평가 · 문제해결
   - 판별 키워드: "~에 대해 어떻게 생각하나요?", "~이 정당하다고 생각합니까?", "만약 자신이라면?", "~의 의견은?"
   - 예시: "토끼가 중간에 낮잠을 잔 것에 대해 여러분은 어떻게 생각하나요?"

[비교 요약]
- 사실적 질문은 주어진 지식과 정보를 수용하고 확인하는 과정(기억·이해)
- 추론적 질문은 표면적 지식을 넘어 이면의 논리와 맥락을 찾아내는 과정(분석·추론)  
- 평가적 질문은 습득한 지식을 바탕으로 비판적인 판단을 내리고 새로운 결론이나 대안을 도출해 내는 과정(평가·문제해결)
- 세 가지 질문은 독립적으로 존재하는 것이 아니라 사고의 확장을 이끄는 위계적 관계를 갖습니다.

[주의사항]
- 초등학생(1~6학년) 눈높이에 맞는 따뜻하고 격려하는 어조를 사용하세요
- 틀렸더라도 절대 부정적으로 평가하지 마세요. "아쉽게도 틀렸어" 같은 표현 대신 "조금 다르게 생각해볼 수 있어요" 등으로 표현하세요
- 학생이 더 높은 수준의 질문으로 성장할 수 있도록 따뜻하게 격려하세요
- 반드시 한국어로 응답하세요`;

export interface AIAnalysisResult {
  ai_determined_type: 'factual' | 'inferential' | 'evaluative';
  is_correct: boolean;
  feedback: string;
  encouragement: string;
}

export async function analyzeQuestion(
  bookTitle: string,
  questionText: string,
  studentSelectedType: string
): Promise<AIAnalysisResult> {
  const typeMap: Record<string, string> = {
    factual: '사실적 질문',
    inferential: '추론적 질문',
    evaluative: '평가적 질문',
  };

  const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

  const prompt = `${QUESTION_ANALYSIS_PROMPT}

[분석할 입력 정보]
- 책 제목: ${bookTitle}
- 학생의 질문: "${questionText}"
- 학생이 선택한 질문 유형: ${typeMap[studentSelectedType] || studentSelectedType}

위 질문을 분석하여, 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "ai_determined_type": "factual 또는 inferential 또는 evaluative 중 하나",
  "is_correct": true 또는 false (학생의 선택이 맞았는지),
  "feedback": "초등학생 눈높이에 맞는 따뜻하고 격려하는 분석 피드백 (3-4문장. 이 질문이 왜 해당 유형인지 쉽게 설명)",
  "encouragement": "다음 단계 질문에 도전하도록 격려하는 짧은 메시지 (1-2문장)"
}`;

  // Retry logic for rate limiting (free tier)
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

      // Validate the response
      if (!['factual', 'inferential', 'evaluative'].includes(parsed.ai_determined_type)) {
        parsed.ai_determined_type = studentSelectedType as AIAnalysisResult['ai_determined_type'];
      }

      return parsed;
    } catch (error: unknown) {
      const statusCode = (error as { status?: number })?.status;
      if (statusCode === 429 && attempt < maxRetries - 1) {
        // Rate limited - wait and retry
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      console.error('Gemini API error:', error);
    }
  }

  // Fallback response when all retries fail
  return {
    ai_determined_type: studentSelectedType as AIAnalysisResult['ai_determined_type'],
    is_correct: true,
    feedback: '질문을 잘 만들었어요! 책을 읽고 궁금한 점을 질문으로 만드는 것은 정말 훌륭한 독서 습관이에요.',
    encouragement: '앞으로도 다양한 종류의 질문을 만들어 보세요! 여러분의 생각이 점점 더 깊어질 거예요. 🌟',
  };
}

export interface StudentProgressResult {
  summary: string;
  strengths: string;
  areas_for_improvement: string;
}

export async function analyzeStudentProgress(
  studentName: string,
  questions: { text: string; type: string; date: string }[]
): Promise<StudentProgressResult> {
  const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

  const formattedQuestions = questions
    .map((q, i) => `${i + 1}. [${q.date}] 유형: ${q.type} | 질문: "${q.text}"`)
    .join('\n');

  const prompt = `당신은 목포임성초등학교의 따뜻하고 전문적인 독서 교육 AI 도우미입니다.
다음은 '${studentName}' 학생이 그동안 남긴 독서 질문들의 전체 기록입니다. 시간 순서대로 정렬되어 있습니다.

[학생의 질문 기록]
${formattedQuestions}

이 학생이 독서 질문 활동을 하면서 어떻게 성장했는지, 혹은 어떤 특징을 보이는지 분석해주세요.
- 이전에는 단순 사실적 질문만 하다가 최근 추론적/평가적 질문으로 나아갔는지 등 변화 패턴을 파악하세요.
- 질문의 수준이나 일관성 등 잘하고 있는 점을 칭찬해주세요.
- 앞으로 더 깊이 있는 사고를 위해 어떤 방식의 질문을 시도해보면 좋을지 조언해주세요.
- 초등학생이 직접 읽었을 때 이해하기 쉽고 기분 좋게 동기부여가 되는 따뜻한 말투(해요체)를 사용하세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운 기호(\`\`\`json 등)를 제외하고 오직 JSON 중괄호 만 출력하세요:
{
  "summary": "학생의 전반적인 질문 수준과 시간적 변화/성장에 대한 종합 평가 (3~4문장)",
  "strengths": "칭찬할 만한 점이나 잘 만들어진 질문 방식을 구체적으로 언급 (2~3문장)",
  "areas_for_improvement": "앞으로 시도해보면 좋을 질문 추천이나 조언 (2~3문장)"
}`;

  // Retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      return JSON.parse(jsonMatch[0]) as StudentProgressResult;
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 429 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      console.error('Gemini error analyzing progress:', error);
    }
  }

  return {
    summary: `${studentName} 학생은 항상 책을 읽고 호기심을 가지며 열심히 질문을 만들고 있어요. 질문의 내용을 보면 매번 책을 얼마나 주의 깊게 읽었는지 알 수 있답니다.`,
    strengths: '책의 내용을 궁금해하고 그것을 다른 사람도 이해할 수 있게 질문으로 표현하는 능력이 훌륭해요!',
    areas_for_improvement: '앞으로는 정답이 정해져 있지 않은 나만의 생각, "만약 나라면 어땠을까?" 같은 질문도 한번 만들어보면 더 멋질 거예요. 응원합니다!',
  };
}
