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
import { IconLogout } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/actions/auth';
import { ASSETS } from '@/lib/assets';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; class_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name, class_name')
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
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  const navItems = [
    { href: '/student/books', label: '책 목록', icon: ASSETS.books },
    { href: '/student/history', label: '내 기록', icon: ASSETS.book },
  ];

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)',
          border: 'none',
          boxShadow: '0 2px 20px rgba(80,30,180,0.18)',
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          {/* 좌측 로고 */}
          <Group gap={8}>
            <Image src={ASSETS.question} alt="logo" width={28} height={28} />
            <Text size="lg" fw={800} c="white" visibleFrom="xs" style={{ letterSpacing: -0.5 }}>
              독서 질문
            </Text>
          </Group>

          {/* 우측 네비 + 프로필 */}
          <Group gap="sm">
            {navItems.map((item) => (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 10,
                  color: 'white',
                  fontWeight: pathname.startsWith(item.href) ? 700 : 400,
                  background: pathname.startsWith(item.href)
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.07)',
                  border: pathname.startsWith(item.href)
                    ? '1.5px solid rgba(255,255,255,0.35)'
                    : '1.5px solid transparent',
                  transition: 'all 0.18s',
                }}
              >
                <Image src={item.icon} alt={item.label} width={18} height={18} />
                <Text size="sm" visibleFrom="xs">{item.label}</Text>
              </UnstyledButton>
            ))}

            {/* 프로필 드롭다운 */}
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
                    <Image src={ASSETS.student} alt="student" width={22} height={22} />
                  </Box>
                  <Box visibleFrom="xs">
                    <Text size="xs" fw={600} lh={1.2}>{profile?.name || '학생'}</Text>
                    <Text size="xs" opacity={0.75} lh={1.2}>{profile?.class_name}</Text>
                  </Box>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{profile?.class_name} {profile?.name}</Menu.Label>
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
          background: 'linear-gradient(160deg, #f0ebff 0%, #ede9fe 40%, #e8e0ff 100%)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
