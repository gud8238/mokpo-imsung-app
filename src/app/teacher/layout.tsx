'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AppShell,
  Group,
  Text,
  UnstyledButton,
  Box,
  Menu,
  Loader,
  Center,
} from '@mantine/core';
import { IconLayoutDashboard, IconLogout } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/actions/auth';
import { ASSETS } from '@/lib/assets';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #0f2557 0%, #1e3a8a 60%, #1d4ed8 100%)',
          border: 'none',
          boxShadow: '0 2px 20px rgba(15,37,87,0.25)',
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          {/* 좌측 로고 */}
          <Group gap={8}>
            <Image src={ASSETS.question} alt="logo" width={28} height={28} />
            <Text size="lg" fw={800} c="white" style={{ letterSpacing: -0.5 }}>
              교사 관리
            </Text>
          </Group>

          {/* 우측 네비 + 프로필 */}
          <Group gap="sm">
            <UnstyledButton
              component={Link}
              href="/teacher"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                color: 'white',
                fontWeight: pathname === '/teacher' ? 700 : 400,
                background: pathname === '/teacher'
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.07)',
                border: pathname === '/teacher'
                  ? '1.5px solid rgba(255,255,255,0.35)'
                  : '1.5px solid transparent',
                transition: 'all 0.18s',
              }}
            >
              <IconLayoutDashboard size={16} />
              <Text size="sm">대시보드</Text>
            </UnstyledButton>

            {/* 교사 프로필 드롭다운 */}
            <Menu shadow="xl" width={200} radius="md">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px 4px 6px',
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    color: 'white',
                    transition: 'background 0.18s',
                  }}
                >
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image src={ASSETS.student} alt="teacher" width={22} height={22} />
                  </Box>
                  <Text size="sm" fw={600}>
                    {profile?.name || '교사'}
                  </Text>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{profile?.name}</Menu.Label>
                <Menu.Divider />
                <form action={logout}>
                  <Menu.Item
                    component="button"
                    type="submit"
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    style={{ width: '100%' }}
                  >
                    로그아웃
                  </Menu.Item>
                </form>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main
        style={{
          background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #e0e7ff 100%)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
