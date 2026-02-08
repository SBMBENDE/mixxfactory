/**
 * Admin Access Page
 * Sets the admin cookie to bypass Coming Soon page
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;
  const key = params.key;

  // Check if the provided key matches
  if (key === process.env.ADMIN_ACCESS_KEY) {
    // Set the admin cookie
    const cookieStore = await cookies();
    cookieStore.set('afrobizz_admin', key, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Redirect to home
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the access key to bypass Coming Soon page
          </p>
        </div>

        <form action="/admin-access" method="get" className="space-y-4">
          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Access Key
            </label>
            <input
              type="password"
              id="key"
              name="key"
              placeholder="Enter access key"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {key && key !== process.env.ADMIN_ACCESS_KEY && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Invalid access key. Please try again.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Access Site
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This page is for authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
