import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './Providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
