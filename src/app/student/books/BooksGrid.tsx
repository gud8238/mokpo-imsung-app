'use client';

import Link from 'next/link';
import {
  Container,
  SimpleGrid,
  Card,
  Image,
  Text,
  Title,
  Badge,
  Group,
  Box,
} from '@mantine/core';
import { IconBook, IconArrowRight } from '@tabler/icons-react';

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
    <Container size="lg" py="xl">
      <Box mb="xl">
        <Title order={2} c="dark.7" mb={4}>
          안녕하세요, {studentName}! 👋
        </Title>
        <Text c="dimmed" size="lg">
          읽은 책을 선택하고 질문을 만들어 보세요
        </Text>
      </Box>

      {books.length === 0 ? (
        <Card p="xl" radius="lg" withBorder ta="center">
          <IconBook size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text c="dimmed" mt="md" size="lg">
            아직 등록된 책이 없어요
          </Text>
          <Text c="dimmed" size="sm">
            선생님이 책을 등록해 주시면 여기에 나타나요!
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="lg">
          {books.map((book) => (
            <Card
              key={book.id}
              component={Link}
              href={`/student/books/${book.id}`}
              className="book-card"
              shadow="sm"
              padding="lg"
              radius="lg"
              withBorder
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.9)',
              }}
            >
              <Card.Section>
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    height={200}
                    alt={book.title}
                    fit="cover"
                  />
                ) : (
                  <Box
                    h={200}
                    style={{
                      background: 'linear-gradient(135deg, #e8f4fd, #f0e6ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBook size={64} color="#7950f2" style={{ opacity: 0.4 }} />
                  </Box>
                )}
              </Card.Section>

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
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
