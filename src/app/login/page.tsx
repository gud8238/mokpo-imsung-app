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
  Group,
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
    <Box style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
          background: 'linear-gradient(135deg, rgba(30,20,60,0.55) 0%, rgba(60,30,90,0.45) 100%)',
          zIndex: 1,
        }}
      />

      {/* 우측 상단 학교 로고 (모바일 숨김) */}
      <Box
        visibleFrom="sm"
        style={{
          position: 'absolute',
          top: 20,
          right: 28,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Image src={ASSETS.imsung} alt="목포임성초" width={36} height={36} style={{ objectFit: 'contain' }} />
        </Box>
        <Text fw={700} size="md" style={{ color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
          목포임성초등학교
        </Text>
      </Box>

      {/* 로그인 카드 - 가운데 */}
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container size={420}>
          <Paper
            shadow="xl"
            p={44}
            radius="xl"
            style={{
              background: '#ffffff',
              boxShadow: '0 8px 48px 0 rgba(60,20,120,0.18)',
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
                  boxShadow: '0 4px 24px rgba(100,60,200,0.25)',
                  background: '#f4f0ff',
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
              <Title order={2} style={{ color: '#1a1a2e', fontWeight: 800, letterSpacing: -0.5 }}>
                독서 질문 활동
              </Title>
            </Center>
            <Text size="sm" ta="center" mb="xl" c="dimmed">
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
                    label: { fontWeight: 600, marginBottom: 4, color: '#333' },
                    input: {
                      background: '#f8f7ff',
                      border: '1px solid #e0daf0',
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
                    label: { fontWeight: 600, marginBottom: 4, color: '#333' },
                    input: {
                      background: '#f8f7ff',
                      border: '1px solid #e0daf0',
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
                    boxShadow: '0 4px 20px rgba(100,60,200,0.3)',
                  }}
                >
                  로그인
                </Button>
              </Stack>
            </form>

            {/* 계정 안내 - 2줄로 분리 */}
            <Box mt="lg" ta="center">
              <Text size="xs" c="dimmed" lh={1.8}>
                학생: st학년번호@imsung.school
              </Text>
              <Text size="xs" c="dimmed" lh={1.8}>
                교사: teacher번호@imsung.school
              </Text>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 하단 Footer */}
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '16px 0 20px',
          textAlign: 'center',
        }}
      >
        <Text
          size="xs"
          style={{
            color: '#ffffff',
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            fontWeight: 500,
          }}
        >
          Copyright© 목포임성초 서찬아. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}
