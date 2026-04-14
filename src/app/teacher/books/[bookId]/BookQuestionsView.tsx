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
  Image,
  Accordion,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconTrash,
  IconMessagePlus,
  IconUser,
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
export default function BookQuestionsView({
  book,
  questions,
}: {
  book: any;
  questions: any[];
}) {
  const router = useRouter();
  const [feedbackOpened, { open: openFeedback, close: closeFeedback }] = useDisclosure(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Count by type
  const typeCounts = {
    factual: questions.filter((q) => q.question_type === 'factual').length,
    inferential: questions.filter((q) => q.question_type === 'inferential').length,
    evaluative: questions.filter((q) => q.question_type === 'evaluative').length,
  };

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

      {/* Book info */}
      <Paper shadow="sm" radius="lg" p="lg" mb="xl"
        style={{ background: 'linear-gradient(135deg, rgba(76,110,245,0.05), rgba(121,80,242,0.05))' }}>
        <Group align="flex-start" gap="lg">
          {book.cover_image_url ? (
            <Image src={book.cover_image_url} alt={book.title} w={100} h={140} radius="md" fit="cover" />
          ) : (
            <Box w={100} h={140} style={{ borderRadius: 8, background: '#e5dbff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📖
            </Box>
          )}
          <Box style={{ flex: 1 }}>
            <Title order={3} c="dark.7" mb={4}>{book.title}</Title>
            {book.author && <Text size="sm" c="dimmed" mb="xs">✍️ {book.author}</Text>}
            <Group gap="xs" mt="sm">
              <Badge color="blue" variant="light" size="sm">사실적 {typeCounts.factual}</Badge>
              <Badge color="violet" variant="light" size="sm">추론적 {typeCounts.inferential}</Badge>
              <Badge color="orange" variant="light" size="sm">평가적 {typeCounts.evaluative}</Badge>
            </Group>
          </Box>
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
          <Text c="dimmed" size="lg">이 책에 대한 질문이 아직 없습니다.</Text>
        </Card>
      ) : (
        <Stack gap="sm">
          {questions.map((q: any) => {
            let aiFeedback: any = null;
            try {
              if (q.ai_feedback) aiFeedback = JSON.parse(q.ai_feedback);
            } catch { /* ignore */ }

            return (
              <Paper key={q.id} shadow="xs" p="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <Tooltip label={q.profiles?.class_name}>
                      <Badge variant="outline" color="gray" size="sm"
                        leftSection={<IconUser size={10} />}>
                        {q.profiles?.name || '학생'}
                      </Badge>
                    </Tooltip>
                    <Badge color={TYPE_COLOR[q.question_type]} variant="light" size="sm">
                      {TYPE_LABEL[q.question_type]}
                    </Badge>
                    {aiFeedback && (
                      <Badge
                        color={aiFeedback.is_correct ? 'green' : 'yellow'}
                        variant="light"
                        size="xs"
                      >
                        {aiFeedback.is_correct ? '✅' : `AI: ${TYPE_LABEL[aiFeedback.ai_determined_type]}`}
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
