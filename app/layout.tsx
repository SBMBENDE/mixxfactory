/**
 * Root layout for the application
 */

import type { Metadata, Viewport } from 'next';
import { ClientLayout } from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Afrobizz - Connecting African Businesses & Talent',
  description: 'Afrobizz — The professional platform connecting African businesses and talent worldwide',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Afrobizz',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
  },
  icons: [
    { rel: 'icon', url: '/afrobizz logo.png' },
    { rel: 'apple-touch-icon', url: '/afrobizz logo.png' },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
