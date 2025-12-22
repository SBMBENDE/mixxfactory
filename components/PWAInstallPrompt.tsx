/**
 * PWA Install Prompt Component
 * Displays app installation prompt for mobile users
 */

'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed') === 'true';
    if (isDismissed) {
      console.log('[PWAInstallPrompt] Prompt was dismissed in this session');
      setDismissed(true);
      return;
    }

    console.log('[PWAInstallPrompt] Listening for beforeinstallprompt event...');

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar or install dialog
      e.preventDefault();
      console.log('[PWAInstallPrompt] beforeinstallprompt event fired');
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show custom install prompt
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWAInstallPrompt] App installed');
      // Hide prompt after app is installed
      setShowPrompt(false);
      setDeferredPrompt(null);
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if dismissed or no prompt available
  if (!showPrompt || !deferredPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-md rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 shadow-lg dark:border-sky-900 dark:from-sky-950 dark:to-blue-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Install MixxFactory
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Install our app for the best mobile experience with offline access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="inline-flex items-center justify-center rounded p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
