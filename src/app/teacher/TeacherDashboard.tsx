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
} from '@tabler/icons-react';

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
}: {
  students: Student[];
  books: Book[];
  studentQuestionCounts: Record<string, number>;
  bookQuestionCounts: Record<number, number>;
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
      </Tabs>
    </Container>
  );
}
