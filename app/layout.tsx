import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'إدارة محل تليفونات',
  description: 'نظام إدارة محل تليفونات إلكتروني',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
