'use client';

import { MantineProvider } from '@mantine/core';
import { MotionConfig } from 'motion/react';
import { theme } from '@/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
        {children}
      </MotionConfig>
    </MantineProvider>
  );
}
