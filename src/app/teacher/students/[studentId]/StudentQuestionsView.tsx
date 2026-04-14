'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Button,
  Textarea,
  Modal,
  ActionIcon,
  Tooltip,
  Avatar,
  Accordion,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconUser,
  IconTrash,
  IconMessagePlus,
  IconBook,
} from '@tabler/icons-react';
import { deleteQuestion, submitFeedback } from '@/actions/questions';

const TYPE_LABEL: Record<string, string> = {
  factual: '사실적 질문',
  inferential: '추론적 질문',
  evaluative: '평가적 질문',
};

const TYPE_COLOR: Record<string, string> = {
  factual: 'blue',
  inferential: 'violet',
  evaluative: 'orange',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function StudentQuestionsView({
  student,
  questions,
}: {
  student: { id: string; name: string; class_name: string | null };
  questions: any[];
}) {
  const router = useRouter();
  const [feedbackOpened, { open: openFeedback, close: closeFeedback }] = useDisclosure(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  async function handleDelete(questionId: number) {
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;
    setLoading(true);
    const result = await deleteQuestion(questionId);
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: '질문이 삭제되었습니다.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error || '삭제에 실패했습니다.' });
    }
  }

  async function handleFeedbackSubmit() {
    if (!selectedQuestionId || !feedbackText.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set('questionId', selectedQuestionId.toString());
    formData.set('feedbackText', feedbackText.trim());
    const result = await submitFeedback(formData);
    setLoading(false);
    if (result.success) {
      closeFeedback();
      setFeedbackText('');
      setSelectedQuestionId(null);
      setMessage({ type: 'success', text: '피드백이 등록되었습니다.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error || '피드백 등록에 실패했습니다.' });
    }
  }

  return (
    <Container size="md" py="xl">
      <Button
        component={Link}
        href="/teacher"
        variant="subtle"
        color="gray"
        leftSection={<IconArrowLeft size={16} />}
        mb="lg"
      >
        대시보드로
      </Button>

      {/* Student info */}
      <Paper shadow="sm" radius="lg" p="lg" mb="xl"
        style={{ background: 'linear-gradient(135deg, rgba(76,110,245,0.05), rgba(121,80,242,0.05))' }}>
        <Group gap="md">
          <Avatar size={56} radius="xl" color="indigo" variant="light">
            <IconUser size={28} />
          </Avatar>
          <Box>
            <Text fw={700} size="xl" c="dark.7">{student.name}</Text>
            {student.class_name && (
              <Badge color="indigo" variant="light" size="sm" mt={2}>
                {student.class_name}
              </Badge>
            )}
          </Box>
          <Badge color="green" variant="light" size="lg" ml="auto">
            질문 {questions.length}개
          </Badge>
        </Group>
      </Paper>

      {message && (
        <Alert
          color={message.type === 'success' ? 'green' : 'red'}
          variant="light"
          radius="md"
          mb="md"
          withCloseButton
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {questions.length === 0 ? (
        <Card p="xl" radius="lg" withBorder ta="center">
          <Text c="dimmed" size="lg">이 학생은 아직 질문을 작성하지 않았습니다.</Text>
        </Card>
      ) : (
        <Stack gap="lg">
          {Object.values(bookGroups).map(({ book, questions: bookQuestions }) => (
            <Card key={book.id} shadow="sm" radius="lg" p="lg" withBorder>
              <Group mb="md" gap="sm">
                <IconBook size={20} color="#7950f2" />
                <Text fw={600} size="lg" c="dark.7">{book.title}</Text>
                <Badge color="indigo" variant="light" size="sm">
                  {bookQuestions.length}개
                </Badge>
              </Group>

              <Stack gap="sm">
                {bookQuestions.map((q: any) => {
                  let aiFeedback: any = null;
                  try {
                    if (q.ai_feedback) aiFeedback = JSON.parse(q.ai_feedback);
                  } catch { /* ignore */ }

                  return (
                    <Paper key={q.id} p="md" radius="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <Badge color={TYPE_COLOR[q.question_type]} variant="light" size="sm">
                            {TYPE_LABEL[q.question_type]}
                          </Badge>
                          {aiFeedback && (
                            <Badge
                              color={aiFeedback.is_correct ? 'green' : 'yellow'}
                              variant="light"
                              size="xs"
                            >
                              AI: {aiFeedback.is_correct ? '✅ 정확' : TYPE_LABEL[aiFeedback.ai_determined_type]}
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed">
                            {new Date(q.created_at).toLocaleDateString('ko-KR')}
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <Tooltip label="피드백 작성">
                            <ActionIcon
                              variant="light"
                              color="indigo"
                              size="sm"
                              onClick={() => {
                                setSelectedQuestionId(q.id);
                                openFeedback();
                              }}
                            >
                              <IconMessagePlus size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="질문 삭제">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => handleDelete(q.id)}
                              loading={loading}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>

                      <Text size="sm" c="dark.6" style={{ lineHeight: 1.8 }} mb="xs">
                        {q.question_text}
                      </Text>

                      {aiFeedback && (
                        <Accordion variant="contained" radius="sm">
                          <Accordion.Item value="ai">
                            <Accordion.Control>
                              <Text size="xs" c="indigo.6" fw={600}>🤖 AI 피드백</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Text size="xs" c="dark.5" mb={4}>{aiFeedback.feedback}</Text>
                              <Text size="xs" c="indigo.5">🌟 {aiFeedback.encouragement}</Text>
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}

                      {q.teacher_feedbacks?.length > 0 && (
                        <Stack gap={4} mt="xs">
                          {q.teacher_feedbacks.map((fb: any) => (
                            <Paper key={fb.id} p="xs" radius="sm"
                              style={{ background: 'rgba(64,192,87,0.06)' }}>
                              <Text size="xs" c="green.7" fw={600} mb={2}>
                                ✏️ {fb.profiles?.name || '교사'} 피드백
                              </Text>
                              <Text size="xs" c="dark.5">{fb.feedback_text}</Text>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* Feedback Modal */}
      <Modal
        opened={feedbackOpened}
        onClose={closeFeedback}
        title="📝 피드백 작성"
        radius="lg"
        centered
      >
        <Stack gap="md">
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="학생에게 따뜻한 피드백을 작성해주세요..."
            minRows={4}
            autosize
            radius="md"
          />
          <Button
            onClick={handleFeedbackSubmit}
            loading={loading}
            radius="md"
            style={{ background: 'linear-gradient(135deg, #4c6ef5, #7950f2)' }}
            disabled={!feedbackText.trim()}
          >
            피드백 등록
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
