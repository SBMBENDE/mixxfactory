/**
 * Reusable Navbar component with authentication
 * TODO: Will be updated to support localized routes (/en/..., /fr/...)
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslations } from '@/hooks/useTranslations';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-xs">MF</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">MixxFactory</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/directory" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
              {t.nav.directory}
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
              {t.nav.contact}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold transition">
                📊 {t.nav.dashboard}
              </Link>
            )}
          </div>

          {/* Language Toggle Switch */}
          <div className="hidden md:flex items-center px-4 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className={clsx(
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                language === 'en'
                  ? 'bg-blue-600'
                  : 'bg-purple-600'
              )}
              title={`Switch to ${language === 'en' ? 'Français' : 'English'}`}
            >
              <span className={clsx(
                'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform',
                language === 'en' ? 'translate-x-1' : 'translate-x-7'
              )} />
              <span className="absolute left-2 text-xs font-bold text-white">EN</span>
              <span className="absolute right-2 text-xs font-bold text-white">FR</span>
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                    >
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      {t.nav.login}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className={clsx(
              'md:hidden relative inline-flex h-7 w-12 items-center rounded-full transition-colors mr-2',
              language === 'en'
                ? 'bg-blue-600'
                : 'bg-purple-600'
            )}
            title={`Switch to ${language === 'en' ? 'Français' : 'English'}`}
          >
            <span className={clsx(
              'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform',
              language === 'en' ? 'translate-x-1' : 'translate-x-6'
            )} />
            <span className="absolute left-1.5 text-xs font-bold text-white">EN</span>
            <span className="absolute right-1.5 text-xs font-bold text-white">FR</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className={clsx('w-6 h-6 text-gray-700 dark:text-white transition', isOpen && 'hidden')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={clsx('w-6 h-6 text-gray-700 dark:text-white transition', !isOpen && 'hidden')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/directory" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t.nav.directory}
            </Link>
            <Link href="/about" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t.nav.contact}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/dashboard" className="block py-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700">
                📊 {t.nav.dashboard}
              </Link>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              {!loading && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {user.email}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                      >
                        {t.nav.logout}
                      </button>
                    </>
                  ) : (
                    <Link href="/auth/login" className="block">
                      <Button variant="primary" size="sm" className="w-full">
                        {t.nav.login}
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
