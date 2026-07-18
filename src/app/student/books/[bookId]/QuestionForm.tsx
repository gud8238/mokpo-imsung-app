'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  Group,
  Stack,
  Image,
  Box,
  Card,
  Badge,
  Alert,
  Loader,
  Tooltip,
  Accordion,
  SimpleGrid,
} from '@mantine/core';
import {
  IconSend,
  IconArrowLeft,
  IconBulb,
  IconSearch,
  IconMessage,
  IconSparkles,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { submitQuestion } from '@/actions/questions';
import type { AIAnalysisResult } from '@/lib/gemini';
import { StorySurface } from '@/components/low-poly';
import classes from '../../student-pages.module.css';

interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  description: string | null;
}

interface PreviousQuestion {
  id: number;
  question_text: string;
  question_type: string;
  ai_feedback: string | null;
  created_at: string;
}

const QUESTION_TYPES = [
  {
    value: 'factual',
    label: '📘 사실 질문',
    shortLabel: '사실',
    description: '책 속에서 답을 찾을 수 있는 질문',
    detail: '누가, 언제, 어디서, 무엇을 했는지 등 글에 나와있는 사실을 묻는 질문',
    color: 'blue',
    icon: IconSearch,
  },
  {
    value: 'inferential',
    label: '🔍 궁금 질문',
    shortLabel: '궁금',
    description: '책 속의 단서를 모아 숨은 뜻을 짐작하는 질문',
    detail: '글에 직접 나와있지 않은 내용을 생각해보는 질문. 왜 그랬을까? 어떤 의미일까?',
    color: 'violet',
    icon: IconBulb,
  },
  {
    value: 'evaluative',
    label: '💭 라면 질문',
    shortLabel: '라면',
    description: '새로운 상황을 상상하며 생각을 넓히는 질문',
    detail: '정해진 답이 없고 나의 생각이나 의견을 묻는 질문. 어떻게 생각하나요?',
    color: 'orange',
    icon: IconMessage,
  },
];

const TYPE_LABEL_MAP: Record<string, string> = {
  factual: '사실 질문',
  inferential: '궁금 질문',
  evaluative: '라면 질문',
};

const TYPE_COLOR_MAP: Record<string, string> = {
  factual: 'blue',
  inferential: 'violet',
  evaluative: 'orange',
};

export default function QuestionForm({
  book,
  previousQuestions,
}: {
  book: Book;
  previousQuestions: PreviousQuestion[];
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedType || !questionText.trim()) {
      setError('질문과 질문 유형을 모두 입력해주세요!');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('bookId', book.id.toString());
    formData.set('questionText', questionText.trim());
    formData.set('questionType', selectedType);

    const result = await submitQuestion(formData);

    setLoading(false);

    if (result.success && result.aiResult) {
      setAiResult(result.aiResult);
      setSubmitted(true);
    } else if (result.error) {
      setError(result.error);
    }
  }

  function handleReset() {
    setSelectedType(null);
    setQuestionText('');
    setAiResult(null);
    setSubmitted(false);
    setError(null);
  }

  return (
    <Container size="md" className={classes.page}>
      {/* Back button */}
      <Button
        component={Link}
        href="/student/books"
        variant="subtle"
        color="gray"
        leftSection={<IconArrowLeft size={16} />}
        mb="lg"
      >
        책 목록으로
      </Button>

      {/* Book info card */}
      <StorySurface
        tone="student"
        radius="lg"
        p="lg"
        mb="xl"
      >
        <Group align="flex-start" gap="lg">
          {book.cover_image_url ? (
            <Image
              src={book.cover_image_url}
              alt={book.title}
              w={120}
              h={160}
              radius="md"
              fit="cover"
            />
          ) : (
            <Box
              w={120}
              h={160}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #dbe4ff, #e5dbff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSearch size={40} color="#7950f2" style={{ opacity: 0.4 }} />
            </Box>
          )}
          <Box style={{ flex: 1 }}>
            <Title order={1} size="h3" c="dark.7" mb={4}>
              {book.title}
            </Title>
            {book.author && (
              <Text size="sm" c="dimmed" mb="xs">
                ✍️ {book.author}
              </Text>
            )}
            {book.description && (
              <Text size="sm" c="dimmed">
                {book.description}
              </Text>
            )}
          </Box>
        </Group>
      </StorySurface>

      {/* Question form */}
      {!submitted ? (
        <Stack gap="lg">
          <StorySurface tone="student" radius="lg" p="xl" className={classes.questionStage}>
            <Text className={classes.eyebrow} size="xs">질문 씨앗 1</Text>
            <Title order={2} size="h3" className={classes.title} mb={4}>
              어떤 질문을 만들지 골라요
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              아래에서 질문 유형을 선택해주세요
            </Text>

            <SimpleGrid
              cols={{ base: 1, xs: 3 }}
              spacing="md"
              role="radiogroup"
              aria-label="질문 유형"
            >
              {QUESTION_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                return (
                  <Tooltip
                    key={type.value}
                    label={type.detail}
                    multiline
                    w={260}
                    position="bottom"
                    withArrow
                  >
                    <Card
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`question-type-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedType(type.value)}
                      padding="md"
                      radius="lg"
                      withBorder
                      style={{
                        borderColor: isSelected
                          ? `var(--mantine-color-${type.color}-5)`
                          : undefined,
                        background: isSelected
                          ? `var(--mantine-color-${type.color}-0)`
                          : 'white',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Stack align="center" gap="xs">
                        <Box
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: isSelected
                              ? `var(--mantine-color-${type.color}-1)`
                              : '#f1f3f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                          }}
                        >
                          <Icon
                            size={24}
                            color={
                              isSelected
                                ? `var(--mantine-color-${type.color}-6)`
                                : '#868e96'
                            }
                          />
                        </Box>
                        <Text fw={600} size="sm" c={isSelected ? `${type.color}.7` : 'dark'}>
                          {type.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {type.description}
                        </Text>
                        {isSelected && (
                          <Badge color={type.color} variant="light" size="sm">
                            선택됨 ✓
                          </Badge>
                        )}
                      </Stack>
                    </Card>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </StorySurface>

          <StorySurface tone="student" radius="lg" p="xl" className={classes.questionStage}>
            <Text className={classes.eyebrow} size="xs">질문 씨앗 2</Text>
            <Title order={2} size="h3" className={classes.title} mb="md">
              책을 떠올리며 질문을 적어요
            </Title>
            <Textarea
              aria-label="질문 내용"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="이 책에 대해 궁금한 것을 질문으로 만들어 보세요!"
              minRows={4}
              maxRows={8}
              radius="md"
              size="md"
              autosize
              styles={{
                input: {
                  fontSize: '16px',
                  lineHeight: 1.6,
                },
              }}
            />
          </StorySurface>

          {error && (
            <Alert color="red" variant="light" radius="md" icon={<IconInfoCircle size={16} />}>
              {error}
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            loading={loading}
            size="lg"
            radius="md"
            fullWidth
            leftSection={loading ? undefined : <IconSend size={20} />}
            style={{
              background: selectedType && questionText.trim()
                ? 'linear-gradient(135deg, #4c6ef5, #7950f2)'
                : undefined,
            }}
            disabled={!selectedType || !questionText.trim()}
          >
            {loading ? '🤖 AI 선생님이 분석하고 있어요...' : '📤 질문 제출하기'}
          </Button>

          {loading && (
            <StorySurface tone="student" p="lg" radius="lg" ta="center" className="loading-pulse">
              <Loader size="sm" color="indigo" mb="sm" />
              <Text size="sm" c="dimmed">
                AI 선생님이 여러분의 질문을 열심히 분석하고 있어요! 잠시만 기다려주세요... 🔍
              </Text>
            </StorySurface>
          )}
        </Stack>
      ) : (
        /* AI Result display */
        <Stack gap="lg" className="ai-feedback-enter">
          {aiResult && (
            <StorySurface
              tone="student"
              radius="lg"
              p="xl"
              className={`${classes.feedback} ${classes.questionStage}`}
              style={{
                borderColor: aiResult.is_correct
                  ? 'var(--mantine-color-green-3)'
                  : 'var(--mantine-color-yellow-3)',
                background: aiResult.is_correct
                  ? 'linear-gradient(135deg, #f0fff4, #f8fff9)'
                  : 'linear-gradient(135deg, #fff9db, #fffdf4)',
              }}
            >
              <Text className={classes.eyebrow} size="xs">생각이 자랐어요</Text>
              <Title order={3} className={classes.title} mb="md">AI 친구의 따뜻한 피드백</Title>
              <Group mb="md" gap="sm">
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4c6ef5, #7950f2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSparkles size={20} color="white" />
                </Box>
                <Title order={4} c="dark.7">
                  🤖 AI 선생님의 분석
                </Title>
              </Group>

              {/* Correct/Incorrect badge */}
              <Group mb="md" gap="sm">
                {aiResult.is_correct ? (
                  <Badge
                    size="lg"
                    color="green"
                    variant="light"
                    leftSection={<IconCheck size={14} />}
                  >
                    잘 분류했어요! ✨
                  </Badge>
                ) : (
                  <Badge size="lg" color="yellow" variant="light" leftSection={<IconBulb size={14} />}>
                    조금 다르게 생각해볼 수 있어요 💡
                  </Badge>
                )}
              </Group>

              {/* Type comparison */}
              <Paper p="md" radius="md" mb="md"
                style={{ background: 'rgba(255,255,255,0.7)' }}>
                <Group gap="md">
                  <Box>
                    <Text size="xs" c="dimmed" mb={2}>내가 선택한 유형</Text>
                    <Badge color={TYPE_COLOR_MAP[selectedType!]} variant="light" size="lg">
                      {TYPE_LABEL_MAP[selectedType!]}
                    </Badge>
                  </Box>
                  <Text size="lg" c="dimmed">→</Text>
                  <Box>
                    <Text size="xs" c="dimmed" mb={2}>AI 판단 유형</Text>
                    <Badge color={TYPE_COLOR_MAP[aiResult.ai_determined_type]} variant="filled" size="lg">
                      {TYPE_LABEL_MAP[aiResult.ai_determined_type]}
                    </Badge>
                  </Box>
                </Group>
              </Paper>

              {/* Feedback */}
              <Paper p="md" radius="md" mb="md"
                style={{ background: 'rgba(255,255,255,0.7)' }}>
                <Text size="sm" c="dark.6" style={{ lineHeight: 1.8 }}>
                  💬 {aiResult.feedback}
                </Text>
              </Paper>

              {/* Encouragement */}
              <Paper p="md" radius="md"
                style={{
                  background: 'linear-gradient(135deg, rgba(76,110,245,0.08), rgba(121,80,242,0.08))',
                }}>
                <Text size="sm" c="indigo.7" fw={500} style={{ lineHeight: 1.8 }}>
                  🌟 {aiResult.encouragement}
                </Text>
              </Paper>
            </StorySurface>
          )}

          {/* My question summary */}
          <StorySurface tone="student" radius="lg" p="lg">
            <Text size="sm" c="dimmed" mb="xs">내가 작성한 질문</Text>
            <Text size="md" c="dark.7" style={{ lineHeight: 1.8 }}>
              &ldquo;{questionText}&rdquo;
            </Text>
          </StorySurface>

          <Group grow>
            <Button
              onClick={handleReset}
              variant="light"
              color="indigo"
              size="lg"
              radius="md"
            >
              ✏️ 새로운 질문 작성하기
            </Button>
            <Button
              component={Link}
              href="/student/books"
              variant="outline"
              color="gray"
              size="lg"
              radius="md"
            >
              📚 책 목록으로
            </Button>
          </Group>
        </Stack>
      )}

      {/* Previous questions for this book */}
      {previousQuestions.length > 0 && (
        <StorySurface tone="student" mt="xl" p="lg">
          <Title order={4} c="dark.7" mb="md">
            📝 이 책에 대한 내 이전 질문들
          </Title>
          <Accordion variant="separated" radius="lg">
            {previousQuestions.map((q) => {
              let parsedFeedback: AIAnalysisResult | null = null;
              try {
                if (q.ai_feedback) parsedFeedback = JSON.parse(q.ai_feedback);
              } catch { /* ignore */ }

              return (
                <Accordion.Item key={q.id} value={q.id.toString()}>
                  <Accordion.Control>
                    <Group gap="sm">
                      <Badge
                        color={TYPE_COLOR_MAP[q.question_type]}
                        variant="light"
                        size="sm"
                      >
                        {TYPE_LABEL_MAP[q.question_type]}
                      </Badge>
                      <Text size="sm" lineClamp={1}>
                        {q.question_text}
                      </Text>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      <Text size="sm" style={{ lineHeight: 1.8 }}>
                        {q.question_text}
                      </Text>
                      {parsedFeedback && (
                        <Paper p="sm" radius="md" className={classes.feedback}>
                          <Text size="xs" c="indigo.6" fw={600} mb={4}>
                            🤖 AI 피드백
                          </Text>
                          <Text size="xs" c="dark.5">
                            {parsedFeedback.feedback}
                          </Text>
                        </Paper>
                      )}
                      <Text size="xs" c="dimmed">
                        {new Date(q.created_at).toLocaleDateString('ko-KR')}
                      </Text>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </StorySurface>
      )}
    </Container>
  );
}
