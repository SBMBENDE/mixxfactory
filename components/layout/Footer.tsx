'use client';

import { useTranslations } from '@/hooks/useTranslations';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Mobile First - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* About Section */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4 text-white">MixxFactory</h3>
            <p className="text-sm text-gray-400 mb-6">
              {t.footer?.description || 'Connecting professionals and venues with event organizers worldwide.'}
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.322a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                </svg>
              </a>
              
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                aria-label="Twitter/X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9.5 5M3 20l15-15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-base font-semibold mb-4 text-white">{t.footer?.quickLinks || 'Quick Links'}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.home || 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.directory || 'Directory'}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.categories || 'Categories'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.about || 'About Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h4 className="text-base font-semibold mb-4 text-white">{t.footer?.legal || 'Legal'}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.privacy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.terms || 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.cookies || 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div className="col-span-1">
            <h4 className="text-base font-semibold mb-4 text-white">{t.footer?.forPros || 'For Professionals'}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/register" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.joinUs || 'Join Us'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.dashboard || 'Dashboard'}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.support || 'Support'}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  {t.footer?.blog || 'Blog'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800"></div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} MixxFactory. {t.footer?.allRightsReserved || 'All rights reserved.'}
          </p>
          
          {/* Bottom Links - Mobile Hidden */}
          <div className="hidden md:flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
              {t.footer?.sitemap || 'Sitemap'}
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
              {t.footer?.accessibility || 'Accessibility'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
