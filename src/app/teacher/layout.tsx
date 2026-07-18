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
import { LowPolyBackdrop, LowPolyIcon } from '@/components/low-poly';
import { ROLE_PRESENTATION } from '@/components/low-poly/role-presentation';
import classes from '@/components/low-poly/role-shell.module.css';

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
      <AppShell.Header className={`${classes.header} ${classes.teacherHeader}`}>
        <Group h="100%" px="xl" justify="space-between">
          {/* 좌측 로고 */}
          <Group gap={8}>
            <LowPolyIcon name="question" size={30} alt="" />
            <Text size="lg" fw={900} c="white">
              {ROLE_PRESENTATION.teacher.title}
            </Text>
          </Group>

          {/* 우측 네비 + 프로필 */}
          <Group gap="sm">
            <UnstyledButton
              component={Link}
              href="/teacher"
              className={`${classes.navItem} ${pathname === '/teacher' ? classes.navItemActive : ''}`}
            >
              <IconLayoutDashboard size={16} />
              <Text size="sm">대시보드</Text>
            </UnstyledButton>

            {/* 교사 프로필 드롭다운 */}
            <Menu shadow="xl" width={200} radius="md">
              <Menu.Target>
                <UnstyledButton
                  className={classes.profile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px 4px 6px',
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

      <AppShell.Main>
        <LowPolyBackdrop variant="teacher" scene={false}>
          {children}
        </LowPolyBackdrop>
      </AppShell.Main>
    </AppShell>
  );
}
