'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
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
  IconWand,
  IconDownload,
} from '@tabler/icons-react';
import { deleteQuestion, submitFeedback, evaluateStudentQuestions } from '@/actions/questions';
import { StorySurface } from '@/components/low-poly';
import classes from '../../teacher-pages.module.css';

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

  // AI 분석
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [aiModalOpened, { open: openAiModal, close: closeAiModal }] = useDisclosure(false);

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

  async function handleAiAnalysis() {
    setAiLoading(true);
    const result = await evaluateStudentQuestions(student.id, student.name);
    setAiLoading(false);
    if (result.success && result.result) {
      setAiResult(result.result);
      openAiModal();
    } else {
      setMessage({ type: 'error', text: result.error || '분석에 실패했습니다.' });
    }
  }

  async function handleDownloadPdf() {
    if (!aiResult) return;

    setDownloadingPdf(true);
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          summary: aiResult.summary,
          strengths: aiResult.strengths,
          areasForImprovement: aiResult.areas_for_improvement,
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${student.name}_질문진단결과.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'PDF 보고서를 만들지 못했습니다. 잠시 후 다시 시도해주세요.' });
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <Container size="md" className={classes.page}>
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

      <StorySurface tone="teacher" className={classes.hero} radius="xl">
        <Text className={classes.eyebrow} size="xs">오늘의 학생 관찰</Text>
        <Title order={1} className={classes.title} mb="md">학생 생각 성장 기록</Title>
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
          <Group gap="sm" ml="auto">
            <Badge color="green" variant="light" size="lg">
              질문 {questions.length}개
            </Badge>
            <Button
              leftSection={<IconWand size={16} />}
              variant="light"
              color="indigo"
              radius="md"
              onClick={handleAiAnalysis}
              loading={aiLoading}
              disabled={questions.length === 0}
            >
              AI 질문 진단
            </Button>
          </Group>
        </Group>
      </StorySurface>

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
        <StorySurface tone="teacher" p="xl" radius="lg" ta="center">
          <Text c="dimmed" size="lg">이 학생은 아직 질문을 작성하지 않았습니다.</Text>
        </StorySurface>
      ) : (
        <Stack gap="lg">
          {Object.values(bookGroups).map(({ book, questions: bookQuestions }) => (
            <StorySurface key={book.id} tone="teacher" radius="lg" p="lg" className={classes.listItem}>
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
                    <StorySurface key={q.id} tone="teacher" p="md" radius="md">
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
                              aria-label="피드백 작성"
                              variant="light"
                              color="indigo"
                              size="xl"
                              onClick={() => {
                                setSelectedQuestionId(q.id);
                                openFeedback();
                              }}
                            >
                              <IconMessagePlus size={20} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="질문 삭제">
                            <ActionIcon
                              aria-label="질문 삭제"
                              variant="light"
                              color="red"
                              size="xl"
                              onClick={() => handleDelete(q.id)}
                              loading={loading}
                            >
                              <IconTrash size={20} />
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
                            <Paper key={fb.id} p="xs" radius="sm" className={classes.feedback}>
                              <Text size="xs" c="green.7" fw={600} mb={2}>
                                ✏️ {fb.profiles?.name || '교사'} 피드백
                              </Text>
                              <Text size="xs" c="dark.5">{fb.feedback_text}</Text>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </StorySurface>
                  );
                })}
              </Stack>
            </StorySurface>
          ))}
        </Stack>
      )}

      {/* Feedback Modal */}
      <Modal
        opened={feedbackOpened}
        onClose={closeFeedback}
        title={<Title order={2} size="h3">📝 피드백 작성</Title>}
        radius="lg"
        centered
      >
        <StorySurface tone="teacher" p="md" radius="lg">
        <Stack gap="md">
          <Textarea
            aria-label="학생에게 전할 피드백"
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
        </StorySurface>
      </Modal>

      {/* AI AI Diagnosis Modal */}
      <Modal
        opened={aiModalOpened}
        onClose={closeAiModal}
        title={<Group gap="xs"><IconWand size={20} color="#7950f2"/><Title order={2} size="h3">AI 질문 수준 진단</Title></Group>}
        radius="lg"
        size="lg"
        centered
      >
        {aiResult && (
          <StorySurface tone="teacher" p="md" radius="lg">
          <Stack gap="md">
            <Box p="md" style={{ background: 'rgba(232,241,252,.82)', borderRadius: 12 }}>
              <Title order={3} size="h5" c="indigo.7" mb="xs">총평</Title>
              <Text size="sm" style={{ lineHeight: 1.6 }}>{aiResult.summary}</Text>
            </Box>
            <Box p="md" style={{ background: 'rgba(242,249,245,.82)', borderRadius: 12 }}>
              <Title order={3} size="h5" c="green.7" mb="xs">잘하고 있는 점</Title>
              <Text size="sm" style={{ lineHeight: 1.6 }}>{aiResult.strengths}</Text>
            </Box>
            <Box p="md" style={{ background: 'rgba(255,248,222,.82)', borderRadius: 12 }}>
              <Title order={3} size="h5" c="yellow.8" mb="xs">앞으로의 발전 방향</Title>
              <Text size="sm" style={{ lineHeight: 1.6 }}>{aiResult.areas_for_improvement}</Text>
            </Box>
            
            <Button
              mt="md"
              variant="light"
              color="indigo"
              leftSection={<IconDownload size={16} />}
              loading={downloadingPdf}
              onClick={handleDownloadPdf}
              fullWidth
            >
              📄 결과 보고서 다운로드 (PDF)
            </Button>
          </Stack>
          </StorySurface>
        )}
      </Modal>
    </Container>
  );
}
