'use client';

import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  Paper,
  Box,
  Accordion,
} from '@mantine/core';
import { IconHistory, IconBook, IconMessageCircle } from '@tabler/icons-react';

const TYPE_LABEL_MAP: Record<string, string> = {
  factual: '사실적 질문',
  inferential: '추론적 질문',
  evaluative: '평가적 질문',
};

const TYPE_COLOR_MAP: Record<string, string> = {
  factual: 'blue',
  inferential: 'violet',
  evaluative: 'orange',
};

interface AIFeedback {
  ai_determined_type: string;
  is_correct: boolean;
  feedback: string;
  encouragement: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function HistoryView({ questions }: { questions: any[] }) {
  if (questions.length === 0) {
    return (
      <Container size="md" py="xl">
        <Card p="xl" radius="lg" withBorder ta="center">
          <IconHistory size={48} color="gray" style={{ opacity: 0.5 }} />
          <Title order={3} c="dimmed" mt="md">
            아직 질문이 없어요
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            책을 선택하고 첫 질문을 만들어 보세요! 📚
          </Text>
        </Card>
      </Container>
    );
  }

  // Group by book
  const bookGroups: Record<number, { book: any; questions: any[] }> = {};
  for (const q of questions) {
    const bookId = q.books?.id;
    if (!bookId) continue;
    if (!bookGroups[bookId]) {
      bookGroups[bookId] = { book: q.books, questions: [] };
    }
    bookGroups[bookId].questions.push(q);
  }

  return (
    <Container size="md" py="xl">
      <Group mb="xl" gap="sm">
        <IconHistory size={28} color="#4c6ef5" />
        <Title order={2} c="dark.7">
          내 질문 기록
        </Title>
      </Group>

      <Text c="dimmed" mb="lg">
        총 {questions.length}개의 질문을 만들었어요! 🎉
      </Text>

      <Stack gap="lg">
        {Object.values(bookGroups).map(({ book, questions: bookQuestions }) => (
          <Card key={book.id} shadow="sm" radius="lg" p="lg" withBorder>
            <Group mb="md" gap="sm">
              <IconBook size={20} color="#7950f2" />
              <Text fw={600} size="lg" c="dark.7">
                {book.title}
              </Text>
              <Badge color="indigo" variant="light" size="sm">
                {bookQuestions.length}개 질문
              </Badge>
            </Group>

            <Accordion variant="separated" radius="md">
              {bookQuestions.map((q: any) => {
                let aiFeedback: AIFeedback | null = null;
                try {
                  if (q.ai_feedback) aiFeedback = JSON.parse(q.ai_feedback);
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
                        {aiFeedback && !aiFeedback.is_correct && (
                          <Badge color="yellow" variant="light" size="xs">
                            AI: {TYPE_LABEL_MAP[aiFeedback.ai_determined_type]}
                          </Badge>
                        )}
                        <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                          {q.question_text}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(q.created_at).toLocaleDateString('ko-KR')}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        <Text size="sm" style={{ lineHeight: 1.8 }}>
                          {q.question_text}
                        </Text>

                        {aiFeedback && (
                          <Paper p="sm" radius="md"
                            style={{ background: 'rgba(76,110,245,0.05)' }}>
                            <Group gap="xs" mb={4}>
                              <Text size="xs" c="indigo.6" fw={600}>
                                🤖 AI 피드백
                              </Text>
                              {aiFeedback.is_correct ? (
                                <Badge color="green" size="xs" variant="light">정확히 분류! ✅</Badge>
                              ) : (
                                <Badge color="yellow" size="xs" variant="light">
                                  AI 판단: {TYPE_LABEL_MAP[aiFeedback.ai_determined_type]}
                                </Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dark.5" mb={4}>
                              {aiFeedback.feedback}
                            </Text>
                            <Text size="xs" c="indigo.5" fw={500}>
                              🌟 {aiFeedback.encouragement}
                            </Text>
                          </Paper>
                        )}

                        {q.teacher_feedbacks && q.teacher_feedbacks.length > 0 && (
                          <Box>
                            {q.teacher_feedbacks.map((fb: any) => (
                              <Paper key={fb.id} p="sm" radius="md" mb="xs"
                                style={{ background: 'rgba(64,192,87,0.05)' }}>
                                <Group gap="xs" mb={4}>
                                  <IconMessageCircle size={14} color="#40c057" />
                                  <Text size="xs" c="green.7" fw={600}>
                                    선생님 피드백 ({fb.profiles?.name || '교사'})
                                  </Text>
                                </Group>
                                <Text size="xs" c="dark.5">
                                  {fb.feedback_text}
                                </Text>
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
