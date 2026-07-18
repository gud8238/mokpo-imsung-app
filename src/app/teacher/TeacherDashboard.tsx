'use client';

import Link from 'next/link';
import {
  Container, Title, Text, Tabs, SimpleGrid, Badge, Group, Avatar, Box, Stack,
} from '@mantine/core';
import {
  IconUsers, IconBooks, IconUser, IconBook, IconChevronRight, IconMessageCircle, IconChartBar, IconTrophy,
} from '@tabler/icons-react';
import { BarChart } from '@mantine/charts';
import '@mantine/charts/styles.css';
import { StorySurface } from '@/components/low-poly';
import classes from './teacher-pages.module.css';

interface Student { id: string; name: string; class_name: string | null; }
interface Book { id: number; title: string; author: string | null; cover_image_url: string | null; }

export default function TeacherDashboard({
  students, books, studentQuestionCounts, bookQuestionCounts, questionsData,
}: {
  students: Student[];
  books: Book[];
  studentQuestionCounts: Record<string, number>;
  bookQuestionCounts: Record<number, number>;
  questionsData?: { student_id: string; question_type: string }[];
}) {
  const classesByName: Record<string, Student[]> = {};
  students.forEach((student) => {
    const className = student.class_name || '미지정';
    if (!classesByName[className]) classesByName[className] = [];
    classesByName[className].push(student);
  });

  const totalQuestions = Object.values(studentQuestionCounts).reduce((sum, count) => sum + count, 0);
  const classQuestionMap: Record<string, { factual: number; inferential: number; evaluative: number }> = {};
  questionsData?.forEach((question) => {
    const student = students.find((item) => item.id === question.student_id);
    if (!student) return;
    const className = student.class_name || '미지정';
    if (!classQuestionMap[className]) classQuestionMap[className] = { factual: 0, inferential: 0, evaluative: 0 };
    if (question.question_type === 'factual') classQuestionMap[className].factual++;
    else if (question.question_type === 'inferential') classQuestionMap[className].inferential++;
    else if (question.question_type === 'evaluative') classQuestionMap[className].evaluative++;
  });

  const chartData = Object.entries(classQuestionMap)
    .map(([className, counts]) => ({ className, '사실적 질문': counts.factual, '추론적 질문': counts.inferential, '평가적 질문': counts.evaluative }))
    .sort((a, b) => a.className.localeCompare(b.className));
  const topStudents = students.map((student) => ({ ...student, qCount: studentQuestionCounts[student.id] || 0 }))
    .filter((student) => student.qCount > 0).sort((a, b) => b.qCount - a.qCount).slice(0, 10);

  const statCards = [
    { label: '전체 학생', value: students.length, icon: <IconUsers size={20} color="white" />, background: 'linear-gradient(135deg, #4c6ef5, #5c7cfa)' },
    { label: '등록된 책', value: books.length, icon: <IconBooks size={20} color="white" />, background: 'linear-gradient(135deg, #7950f2, #9775fa)' },
    { label: '전체 질문', value: totalQuestions, icon: <IconMessageCircle size={20} color="white" />, background: 'linear-gradient(135deg, #40c057, #69db7c)' },
  ];

  return (
    <Container size="lg" className={classes.page}>
      <StorySurface tone="teacher" className={classes.hero} radius="xl">
        <Text className={classes.eyebrow} size="xs">오늘의 질문 관찰</Text>
        <Title order={1} className={classes.title}>학생들의 생각이 이렇게 자랐어요</Title>
        <Text c="dimmed">질문 분포와 최근 활동을 살펴보고 따뜻한 피드백을 남겨요.</Text>
      </StorySurface>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        {statCards.map((stat) => (
          <StorySurface key={stat.label} tone="teacher" className={classes.stat} radius="lg" p="md">
            <Group gap="sm">
              <Box w={40} h={40} style={{ borderRadius: '50%', background: stat.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </Box>
              <Box><Text size="xl" fw={700} c="dark.7">{stat.value}</Text><Text size="xs" c="dimmed">{stat.label}</Text></Box>
            </Group>
          </StorySurface>
        ))}
      </SimpleGrid>

      <Tabs defaultValue="students" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>학생별 보기</Tabs.Tab>
          <Tabs.Tab value="books" leftSection={<IconBooks size={16} />}>책별 보기</Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>질문 현황 보기</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="students">
          <Stack gap="lg">
            {Object.entries(classesByName).sort(([a], [b]) => a.localeCompare(b)).map(([className, classStudents]) => (
              <Box key={className}>
                <Group mb="sm" gap="xs"><Badge color="indigo" variant="light" size="lg">{className}</Badge><Text size="sm" c="dimmed">{classStudents.length}명</Text></Group>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                  {classStudents.map((student) => {
                    const questionCount = studentQuestionCounts[student.id] || 0;
                    return <Link key={student.id} href={`/teacher/students/${student.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <StorySurface tone="teacher" className={classes.listItem} shadow="xs" p="sm" radius="md" style={{ cursor: 'pointer' }}>
                        <Group gap="sm" justify="space-between" wrap="nowrap"><Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}><Avatar size={32} radius="xl" color="indigo" variant="light"><IconUser size={16} /></Avatar><Box style={{ minWidth: 0 }}><Text size="sm" fw={500} truncate="end">{student.name}</Text>{questionCount > 0 && <Text size="xs" c="dimmed">질문 {questionCount}개</Text>}</Box></Group><IconChevronRight size={14} color="gray" /></Group>
                      </StorySurface>
                    </Link>;
                  })}
                </SimpleGrid>
              </Box>
            ))}
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="books">
          {books.length === 0 ? <StorySurface tone="teacher" p="xl" radius="lg" ta="center"><IconBook size={48} color="gray" style={{ opacity: 0.5 }} /><Text c="dimmed" mt="md">등록된 책이 없습니다</Text></StorySurface> : (
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
              {books.map((book) => {
                const questionCount = bookQuestionCounts[book.id] || 0;
                return <Link key={book.id} href={`/teacher/books/${book.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <StorySurface tone="teacher" className={classes.listItem} p="md" radius="lg" style={{ cursor: 'pointer' }}>
                    <Group gap="sm" wrap="nowrap"><Box w={60} h={80} style={{ borderRadius: 8, background: book.cover_image_url ? undefined : 'linear-gradient(135deg, #dbe4ff, #e5dbff)', backgroundImage: book.cover_image_url ? `url(${book.cover_image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{!book.cover_image_url && <IconBook size={24} color="#7950f2" style={{ opacity: 0.4 }} />}</Box><Box style={{ flex: 1, minWidth: 0 }}><Text fw={600} size="sm" lineClamp={2} c="dark.7">{book.title}</Text>{book.author && <Text size="xs" c="dimmed" mt={2}>{book.author}</Text>}<Badge color={questionCount > 0 ? 'green' : 'gray'} variant="light" size="sm" mt="xs">질문 {questionCount}개</Badge></Box></Group>
                  </StorySurface>
                </Link>;
              })}
            </SimpleGrid>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="stats">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <StorySurface tone="teacher" className={classes.chart} radius="lg" p="xl"><Group mb="lg"><Box w={32} h={32} style={{ borderRadius: '50%', background: 'rgba(76,110,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconChartBar size={18} color="#4c6ef5" /></Box><Title order={2} size="h4" className={classes.title}>학급별 질문 유형 통계</Title></Group>{chartData.length > 0 ? <BarChart h={300} data={chartData} dataKey="className" type="stacked" withLegend legendProps={{ verticalAlign: 'bottom', height: 40 }} series={[{ name: '사실적 질문', color: 'blue.6' }, { name: '추론적 질문', color: 'violet.6' }, { name: '평가적 질문', color: 'orange.5' }]} /> : <Box py="xl" ta="center"><Text c="dimmed">아직 작성된 질문이 없습니다.</Text></Box>}</StorySurface>
            <StorySurface tone="teacher" className={classes.chart} radius="lg" p="xl"><Group mb="lg"><Box w={32} h={32} style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #fcc419, #f59f00)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrophy size={18} color="white" /></Box><Title order={2} size="h4" className={classes.title}>가장 질문을 많이 한 학생 (Top 10)</Title></Group>{topStudents.length > 0 ? <Stack gap="md">{topStudents.map((student, index) => <Group key={student.id} justify="space-between" wrap="nowrap" style={{ background: index < 3 ? 'linear-gradient(90deg, rgba(255,212,59,0.15) 0%, transparent 100%)' : undefined, padding: '8px 12px', borderRadius: 8 }}><Group gap="sm" wrap="nowrap"><Badge color={index === 0 ? 'yellow.6' : index === 1 ? 'gray.4' : index === 2 ? 'orange.7' : 'gray.2'} variant="filled" size="lg" circle c={index > 2 ? 'dark.4' : 'white'}>{index + 1}</Badge><Box><Text fw={600} size="sm" c="dark.7">{student.name}</Text><Text size="xs" c="dimmed">{student.class_name}</Text></Box></Group><Badge color="indigo" variant="light" size="lg">{student.qCount}개</Badge></Group>)}</Stack> : <Box py="xl" ta="center"><Text c="dimmed">아직 작성된 질문이 없습니다.</Text></Box>}</StorySurface>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
