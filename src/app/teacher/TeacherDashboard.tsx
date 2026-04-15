'use client';

import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Tabs,
  Card,
  SimpleGrid,
  Badge,
  Group,
  Avatar,
  Box,
  Paper,
  Stack,
} from '@mantine/core';
import {
  IconUsers,
  IconBooks,
  IconUser,
  IconBook,
  IconChevronRight,
  IconMessageCircle,
  IconChartBar,
  IconTrophy,
} from '@tabler/icons-react';
import { BarChart } from '@mantine/charts';
import '@mantine/charts/styles.css';

interface Student {
  id: string;
  name: string;
  class_name: string | null;
}

interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_image_url: string | null;
}

export default function TeacherDashboard({
  students,
  books,
  studentQuestionCounts,
  bookQuestionCounts,
  questionsData,
}: {
  students: Student[];
  books: Book[];
  studentQuestionCounts: Record<string, number>;
  bookQuestionCounts: Record<number, number>;
  questionsData?: { student_id: string; question_type: string }[];
}) {
  // Group students by class
  const classesByName: Record<string, Student[]> = {};
  students.forEach((s) => {
    const cls = s.class_name || '미지정';
    if (!classesByName[cls]) classesByName[cls] = [];
    classesByName[cls].push(s);
  });

  const totalQuestions = Object.values(studentQuestionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // 학급별 통계 데이터 준비
  const classQuestionMap: Record<string, { factual: number; inferential: number; evaluative: number }> = {};
  
  if (questionsData) {
    questionsData.forEach((q) => {
      const student = students.find((s) => s.id === q.student_id);
      if (!student) return;
      const cls = student.class_name || '미지정';
      
      if (!classQuestionMap[cls]) {
        classQuestionMap[cls] = { factual: 0, inferential: 0, evaluative: 0 };
      }
      
      if (q.question_type === 'factual') classQuestionMap[cls].factual++;
      else if (q.question_type === 'inferential') classQuestionMap[cls].inferential++;
      else if (q.question_type === 'evaluative') classQuestionMap[cls].evaluative++;
    });
  }

  const chartData = Object.entries(classQuestionMap)
    .map(([cls, counts]) => ({
      className: cls,
      '사실적 질문': counts.factual,
      '추론적 질문': counts.inferential,
      '평가적 질문': counts.evaluative,
    }))
    .sort((a, b) => a.className.localeCompare(b.className));

  // 질문 많이 한 학생 랭킹
  const topStudents = students
    .map((s) => ({
      ...s,
      qCount: studentQuestionCounts[s.id] || 0,
    }))
    .filter((s) => s.qCount > 0)
    .sort((a, b) => b.qCount - a.qCount)
    .slice(0, 10); // 상위 10명

  return (
    <Container size="lg" py="xl">
      <Title order={2} c="dark.7" mb="xs">
        📊 교사 대시보드
      </Title>
      <Text c="dimmed" mb="lg">
        학생 {students.length}명 · 책 {books.length}권 · 총 질문 {totalQuestions}개
      </Text>

      {/* Summary cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Paper shadow="sm" radius="lg" p="md" withBorder>
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4c6ef5, #5c7cfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconUsers size={20} color="white" />
            </Box>
            <Box>
              <Text size="xl" fw={700} c="dark.7">{students.length}</Text>
              <Text size="xs" c="dimmed">전체 학생</Text>
            </Box>
          </Group>
        </Paper>
        <Paper shadow="sm" radius="lg" p="md" withBorder>
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7950f2, #9775fa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBooks size={20} color="white" />
            </Box>
            <Box>
              <Text size="xl" fw={700} c="dark.7">{books.length}</Text>
              <Text size="xs" c="dimmed">등록된 책</Text>
            </Box>
          </Group>
        </Paper>
        <Paper shadow="sm" radius="lg" p="md" withBorder>
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #40c057, #69db7c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconMessageCircle size={20} color="white" />
            </Box>
            <Box>
              <Text size="xl" fw={700} c="dark.7">{totalQuestions}</Text>
              <Text size="xs" c="dimmed">총 질문</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      <Tabs defaultValue="students" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>
            학생별 보기
          </Tabs.Tab>
          <Tabs.Tab value="books" leftSection={<IconBooks size={16} />}>
            책별 보기
          </Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
            질문 현황 보기
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="students">
          <Stack gap="lg">
            {Object.entries(classesByName)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([className, classStudents]) => (
                <Box key={className}>
                  <Group mb="sm" gap="xs">
                    <Badge color="indigo" variant="light" size="lg">
                      {className}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {classStudents.length}명
                    </Text>
                  </Group>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                    {classStudents.map((student) => {
                      const qCount = studentQuestionCounts[student.id] || 0;
                      return (
                        <Card
                          key={student.id}
                          component={Link}
                          href={`/teacher/students/${student.id}`}
                          className="book-card"
                          shadow="xs"
                          padding="sm"
                          radius="md"
                          withBorder
                          style={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Group gap="sm" justify="space-between" wrap="nowrap">
                            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                              <Avatar size={32} radius="xl" color="indigo" variant="light">
                                <IconUser size={16} />
                              </Avatar>
                              <Box style={{ minWidth: 0 }}>
                                <Text size="sm" fw={500} truncate="end">
                                  {student.name}
                                </Text>
                                {qCount > 0 && (
                                  <Text size="xs" c="dimmed">
                                    질문 {qCount}개
                                  </Text>
                                )}
                              </Box>
                            </Group>
                            <IconChevronRight size={14} color="gray" />
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="books">
          {books.length === 0 ? (
            <Card p="xl" radius="lg" withBorder ta="center">
              <IconBook size={48} color="gray" style={{ opacity: 0.5 }} />
              <Text c="dimmed" mt="md">등록된 책이 없습니다</Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
              {books.map((book) => {
                const qCount = bookQuestionCounts[book.id] || 0;
                return (
                  <Card
                    key={book.id}
                    component={Link}
                    href={`/teacher/books/${book.id}`}
                    className="book-card"
                    shadow="sm"
                    padding="md"
                    radius="lg"
                    withBorder
                    style={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Box
                        w={60}
                        h={80}
                        style={{
                          borderRadius: 8,
                          background: book.cover_image_url
                            ? undefined
                            : 'linear-gradient(135deg, #dbe4ff, #e5dbff)',
                          backgroundImage: book.cover_image_url
                            ? `url(${book.cover_image_url})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {!book.cover_image_url && (
                          <IconBook size={24} color="#7950f2" style={{ opacity: 0.4 }} />
                        )}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} size="sm" lineClamp={2} c="dark.7">
                          {book.title}
                        </Text>
                        {book.author && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {book.author}
                          </Text>
                        )}
                        <Badge
                          color={qCount > 0 ? 'green' : 'gray'}
                          variant="light"
                          size="sm"
                          mt="xs"
                        >
                          질문 {qCount}개
                        </Badge>
                      </Box>
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="stats">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* 학급별 차트 */}
            <Paper shadow="sm" radius="lg" p="xl" withBorder>
              <Group mb="lg">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(76,110,245,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconChartBar size={18} color="#4c6ef5" />
                </Box>
                <Title order={4} c="dark.7">
                  학급별 질문 유형 통계
                </Title>
              </Group>

              {chartData.length > 0 ? (
                <BarChart
                  h={300}
                  data={chartData}
                  dataKey="className"
                  type="stacked"
                  withLegend
                  legendProps={{ verticalAlign: 'bottom', height: 40 }}
                  series={[
                    { name: '사실적 질문', color: 'blue.6' },
                    { name: '추론적 질문', color: 'violet.6' },
                    { name: '평가적 질문', color: 'orange.5' },
                  ]}
                />
              ) : (
                <Box py="xl" ta="center">
                  <Text c="dimmed">아직 작성된 질문이 없습니다.</Text>
                </Box>
              )}
            </Paper>

            {/* 명예의 전당 (상위 학생들) */}
            <Paper shadow="sm" radius="lg" p="xl" withBorder>
              <Group mb="lg">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fcc419, #f59f00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconTrophy size={18} color="white" />
                </Box>
                <Title order={4} c="dark.7">
                  가장 질문을 많이 한 학생 (Top 10)
                </Title>
              </Group>

              {topStudents.length > 0 ? (
                <Stack gap="md">
                  {topStudents.map((s, index) => (
                    <Group key={s.id} justify="space-between" wrap="nowrap"
                      style={{
                        background: index < 3 ? 'linear-gradient(90deg, rgba(255,212,59,0.15) 0%, transparent 100%)' : undefined,
                        padding: '8px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <Group gap="sm" wrap="nowrap">
                        <Badge
                          color={index === 0 ? 'yellow.6' : index === 1 ? 'gray.4' : index === 2 ? 'orange.7' : 'gray.2'}
                          variant="filled"
                          size="lg"
                          circle
                          c={index > 2 ? 'dark.4' : 'white'}
                        >
                          {index + 1}
                        </Badge>
                        <Box>
                          <Text fw={600} size="sm" c="dark.7">{s.name}</Text>
                          <Text size="xs" c="dimmed">{s.class_name}</Text>
                        </Box>
                      </Group>
                      <Badge color="indigo" variant="light" size="lg">
                        {s.qCount}개
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Box py="xl" ta="center">
                  <Text c="dimmed">아직 작성된 질문이 없습니다.</Text>
                </Box>
              )}
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
