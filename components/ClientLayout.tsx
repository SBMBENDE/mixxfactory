/**
 * Client-side layout wrapper for language, auth, and navbar
 */

'use client';

import { AuthProvider } from '@/components/AuthProvider';
import { LanguageProvider } from '@/hooks/useLanguage';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <PWAInstallPrompt />
      </LanguageProvider>
    </AuthProvider>
  );
}
