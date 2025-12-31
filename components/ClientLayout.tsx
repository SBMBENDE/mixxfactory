/**
 * Client-side layout wrapper for language, auth, and navbar
 */

'use client';


import { AuthProvider } from '@/components/AuthProvider';
import { LanguageProvider } from '@/hooks/useLanguage';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useGlobal401Handler } from '@/hooks/useGlobal401Handler';

function Global401Handler() {
  useGlobal401Handler();
  return null;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Global401Handler />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <PWAInstallPrompt />
      </LanguageProvider>
    </AuthProvider>
  );
}
