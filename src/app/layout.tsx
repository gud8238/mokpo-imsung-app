import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  defaultRadius: 'lg',
  colors: {
    indigo: [
      '#edf2ff', '#dbe4ff', '#bac8ff', '#91a7ff', '#748ffc',
      '#5c7cfa', '#4c6ef5', '#4263eb', '#3b5bdb', '#364fc7',
    ],
  },
});

export const metadata = {
  title: '목포임성초 독서 질문',
  description: '목포임성초등학교 학생들을 위한 독서 질문 활동 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
