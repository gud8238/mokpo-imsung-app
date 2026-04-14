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
import { IconLayoutDashboard, IconLogout, IconUser, IconSchool } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/actions/auth';

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
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 64 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2b5797)',
          border: 'none',
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="sm">
            <IconSchool size={24} color="white" />
            <Text size="xl" fw={700} c="white">
              교사 관리
            </Text>
          </Group>

          <Group gap="md">
            <UnstyledButton
              component={Link}
              href="/teacher"
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                color: 'white',
                fontWeight: pathname === '/teacher' ? 700 : 400,
                background: pathname === '/teacher' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Group gap={6}>
                <IconLayoutDashboard size={16} />
                <Text size="sm">대시보드</Text>
              </Group>
            </UnstyledButton>

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
                  <Avatar size={28} radius="xl" color="blue" variant="filled">
                    <IconUser size={16} />
                  </Avatar>
                  <Text size="sm" fw={500}>
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

      <AppShell.Main style={{ background: 'transparent' }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
