/**
 * Client-side layout wrapper for language and navbar
 */

'use client';

import { LanguageProvider } from '@/hooks/useLanguage';
import { Navbar } from '@/components/layout/Navbar';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main>{children}</main>
      <PWAInstallPrompt />
    </LanguageProvider>
  );
}
