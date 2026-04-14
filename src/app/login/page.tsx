'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Box,
  Center,
} from '@mantine/core';
import { IconBook2, IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { login } from '@/actions/auth';

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
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <Box
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          top: -80,
          left: -80,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          bottom: -40,
          right: -40,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          top: '40%',
          right: '20%',
        }}
      />

      <Container size={420} style={{ position: 'relative', zIndex: 1 }}>
        <Paper
          withBorder
          shadow="xl"
          p={40}
          radius="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Center mb="lg">
            <Box
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4c6ef5, #7950f2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBook2 size={36} color="white" stroke={2} />
            </Box>
          </Center>

          <Title order={2} ta="center" mb={4} c="dark.7">
            📚 독서 질문 활동
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            목포임성초등학교
          </Text>

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
                required
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 4 },
                }}
              />

              <PasswordInput
                name="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                required
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 4 },
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
                  background: 'linear-gradient(135deg, #4c6ef5, #7950f2)',
                  marginTop: 8,
                }}
              >
                로그인
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="xs" ta="center" mt="lg">
            학생: st학년번호@imsung.school / 교사: teacher번호@imsung.school
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
