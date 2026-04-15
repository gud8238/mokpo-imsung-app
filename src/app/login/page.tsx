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
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { login } from '@/actions/auth';
import { ASSETS } from '@/lib/assets';
import Image from 'next/image';

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
    <Box style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 배경 영상 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={ASSETS.intro} type="video/mp4" />
      </video>

      {/* 영상 위 어두운 오버레이 */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(30,20,60,0.72) 0%, rgba(60,30,90,0.65) 100%)',
          zIndex: 1,
        }}
      />

      {/* 로그인 카드 */}
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container size={420}>
          <Paper
            withBorder={false}
            shadow="2xl"
            p={44}
            radius="xl"
            style={{
              background: 'rgba(255,255,255,0.13)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(255,255,255,0.22)',
              boxShadow: '0 8px 48px 0 rgba(60,20,120,0.28)',
            }}
          >
            {/* 책 표지 이미지 */}
            <Center mb="md">
              <Box
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(100,60,200,0.4)',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src={ASSETS.bookcover}
                  alt="bookcover"
                  width={90}
                  height={90}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
            </Center>

            {/* 타이틀 */}
            <Center mb={4}>
              <Image src={ASSETS.question} alt="question icon" width={28} height={28} style={{ marginRight: 8 }} />
              <Title order={2} style={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5 }}>
                독서 질문 활동
              </Title>
            </Center>
            <Text size="sm" ta="center" mb="xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
                    label: { color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 4 },
                    input: {
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#fff',
                    },
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
                    label: { color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 4 },
                    input: {
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#fff',
                    },
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
                    boxShadow: '0 4px 20px rgba(100,60,200,0.4)',
                  }}
                >
                  로그인
                </Button>
              </Stack>
            </form>

            <Text size="xs" ta="center" mt="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              학생: st학년번호@imsung.school &nbsp;|&nbsp; 교사: teacher번호@imsung.school
            </Text>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
