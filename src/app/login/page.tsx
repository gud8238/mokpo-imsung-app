'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { login } from '@/actions/auth';
import { LowPolyBackdrop, LowPolyIcon, StorySurface } from '@/components/low-poly';
import classes from './login.module.css';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <LowPolyBackdrop variant="login" scene>
      <Box className={classes.schoolMark} visibleFrom="sm">
        <LowPolyIcon name="question" size={42} alt="" />
        <Text fw={800} c="white">목포임성초등학교</Text>
      </Box>

      <Container size={440} className={classes.center}>
        <StorySurface tone="warm" radius="xl" className={classes.card} data-testid="login-card">
          <Center mb="md"><LowPolyIcon name="book" size={84} alt="" /></Center>
          <Title order={1} ta="center" className={classes.title}>생각의 숲으로 들어가요</Title>
          <Text ta="center" className={classes.subtitle}>책을 읽고 나만의 질문을 발견해요</Text>

          <form action={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  radius="md"
                >
                  {error}
                </Alert>
              )}

              <TextInput
                name="email"
                label="아이디 (이메일)"
                placeholder="예: st0101@imsung.school"
                type="email"
                autoComplete="username"
                spellCheck={false}
                required
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 4, color: '#333' },
                  input: { background: '#f8f7ff', border: '1px solid #e0daf0' },
                }}
              />

              <PasswordInput
                name="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 4, color: '#333' },
                  input: { background: '#f8f7ff', border: '1px solid #e0daf0' },
                }}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                radius="md"
                loading={loading}
                leftSection={<IconLogin size={20} />}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  marginTop: 8,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  boxShadow: '0 4px 20px rgba(100,60,200,0.3)',
                }}
              >
                탐험 시작하기
              </Button>
            </Stack>
          </form>

          <Box mt="lg" ta="center">
            <Text size="xs" c="dimmed" lh={1.8}>학생: st학년번호@imsung.school</Text>
            <Text size="xs" c="dimmed" lh={1.8}>교사: teacher번호@imsung.school</Text>
          </Box>
        </StorySurface>
      </Container>

      <Text className={classes.footer}>
        Copyright© 목포임성초 서찬아. All rights reserved.
      </Text>
    </LowPolyBackdrop>
  );
}
