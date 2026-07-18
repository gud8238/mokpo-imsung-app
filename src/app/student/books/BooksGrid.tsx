'use client';

import Link from 'next/link';
import {
  Container,
  SimpleGrid,
  Image,
  Text,
  Title,
  Badge,
  Group,
  Box,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { LowPolyIcon, StorySurface } from '@/components/low-poly';
import classes from '../student-pages.module.css';

interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  description: string | null;
}

export default function BooksGrid({
  books,
  studentName,
}: {
  books: Book[];
  studentName: string;
}) {
  return (
    <Container size="lg" className={classes.page}>
      <StorySurface tone="student" className={classes.hero} radius="xl">
        <Text className={classes.eyebrow} size="xs">오늘의 독서 탐험</Text>
        <Title order={1} className={classes.title}>어떤 책에서 질문을 발견할까요?</Title>
        <Text c="dimmed">표지를 눌러 사실·궁금·라면 질문을 차근차근 만들어 봐요.</Text>
        <Text size="sm" c="dimmed" mt="sm">안녕하세요, {studentName}! 👋</Text>
      </StorySurface>

      {books.length === 0 ? (
        <StorySurface tone="student" p="xl" radius="lg" ta="center">
          <LowPolyIcon name="book" size={64} alt="" />
          <Text c="dimmed" mt="md" size="lg">
            아직 만날 수 있는 책이 없어요
          </Text>
          <Text c="dimmed" size="sm">
            선생님이 책을 등록해 주시면 여기에 나타나요!
          </Text>
        </StorySurface>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="lg">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/student/books/${book.id}`}
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <StorySurface
                tone="student"
                className={classes.gridCard}
                p="lg"
                radius="lg"
                style={{ cursor: 'pointer' }}
              >
              <Box mb="md">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    height={200}
                    alt={book.title}
                    fit="cover"
                    className={classes.bookCover}
                  />
                ) : (
                  <Box
                    h={200}
                    className={classes.bookCover}
                    style={{
                      background: 'linear-gradient(135deg, #e8f4fd, #f0e6ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LowPolyIcon name="book" size={64} alt="" />
                  </Box>
                )}
              </Box>

              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={600} size="md" lineClamp={1} c="dark.7">
                  {book.title}
                </Text>
              </Group>

              {book.author && (
                <Text size="sm" c="dimmed" mb="xs">
                  ✍️ {book.author}
                </Text>
              )}

              {book.description && (
                <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
                  {book.description}
                </Text>
              )}

              <Group justify="flex-end">
                <Badge
                  variant="light"
                  color="indigo"
                  rightSection={<IconArrowRight size={12} />}
                >
                  질문하기
                </Badge>
              </Group>
              </StorySurface>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
