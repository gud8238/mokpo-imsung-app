'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppShell,
  Group,
  Text,
  UnstyledButton,
  Box,
  Avatar,
  Menu,
  Loader,
  Center,
} from '@mantine/core';
import { IconBook2, IconHistory, IconLogout, IconUser } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/actions/auth';

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
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  const navItems = [
    { href: '/student/books', label: '📚 책 목록', icon: IconBook2 },
    { href: '/student/history', label: '📋 내 기록', icon: IconHistory },
  ];

  return (
    <AppShell
      header={{ height: 64 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #4c6ef5, #7950f2)',
          border: 'none',
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="sm">
            <Text size="xl" fw={700} c="white">
              📚 독서 질문
            </Text>
          </Group>

          <Group gap="md">
            {navItems.map((item) => (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: pathname.startsWith(item.href) ? 700 : 400,
                  background: pathname.startsWith(item.href)
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Text size="sm">{item.label}</Text>
              </UnstyledButton>
            ))}

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                  }}
                >
                  <Avatar size={28} radius="xl" color="white" variant="filled">
                    <IconUser size={16} />
                  </Avatar>
                  <Box>
                    <Text size="xs" fw={600} lh={1.2}>
                      {profile?.name || '학생'}
                    </Text>
                    <Text size="xs" opacity={0.8} lh={1.2}>
                      {profile?.class_name}
                    </Text>
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

      <AppShell.Main style={{ background: 'transparent' }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
