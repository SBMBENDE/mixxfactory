/**
 * Root layout for the application
 */

import type { Metadata, Viewport } from 'next';
import { ClientLayout } from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'MixxFactory - Discover Professionals & Venues',
  description: 'Browse and discover DJs, event halls, stylists, restaurants, and more professionals',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MixxFactory',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
  },
  icons: [
    { rel: 'icon', url: '/icons/icon-192.png' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192.png' },
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
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
