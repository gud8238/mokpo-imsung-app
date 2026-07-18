import { createTheme } from '@mantine/core';

export const LOW_POLY_TOKENS = {
  student: {
    accent: '#7259d9',
    deep: '#3f2b83',
    foliage: '#5c9f72',
    mist: '#f4f0ff',
  },
  teacher: {
    accent: '#356b9e',
    deep: '#183d69',
    slate: '#6b7fa3',
    mist: '#edf5ff',
  },
  warm: {
    sun: '#ffd45d',
    coral: '#ef876d',
  },
  surface: {
    opaque: 'rgba(255,255,255,0.82)',
    glass: 'rgba(255,255,255,0.74)',
    border: 'rgba(255,255,255,0.58)',
  },
} as const;

export const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily:
    '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  defaultRadius: 'lg',
  focusRing: 'auto',
  respectReducedMotion: true,
  cursorType: 'pointer',
  defaultGradient: { from: '#7259d9', to: '#4c6ef5', deg: 135 },
  colors: {
    indigo: [
      '#f3f0ff', '#e8e1ff', '#d2c4ff', '#b49cff', '#9575e7',
      '#7259d9', '#6249c6', '#523caf', '#443294', '#382a79',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { minHeight: 44, fontWeight: 800 } },
    },
    TextInput: {
      defaultProps: { radius: 'md', size: 'md' },
    },
    PasswordInput: {
      defaultProps: { radius: 'md', size: 'md' },
    },
    Modal: {
      defaultProps: { centered: true, radius: 'xl', overlayProps: { blur: 4 } },
    },
  },
});
