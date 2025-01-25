import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';

// react-queryを使うため
import { QueryProvider } from '@/components/query-provider';
import { Toaster } from '@/components/ui/sonner';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Task Flow',
  description: 'Task Management Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      {/* フォントを使うための設定。
      antialiasedはフォントを滑らかにするためのクラス。 */}
      <body className={cn(inter.className, 'antialiased min-h-screen')}>
        {/* Toasterはエラーメッセージを表示するためのコンポーネント */}
        <Toaster />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
