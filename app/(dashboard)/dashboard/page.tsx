/**
 * Dashboard home page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Professionals', value: '0', icon: '👥' },
    { label: 'Total Categories', value: '0', icon: '🏷️' },
    { label: 'Featured Listings', value: '0', icon: '⭐' },
    { label: 'Active Professionals', value: '0', icon: '✅' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profsRes, catsRes] = await Promise.all([
          fetch('/api/admin/professionals?limit=1000', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' }),
        ]);

        const profsData = profsRes.ok ? await profsRes.json() : null;
        const catsData = catsRes.ok ? await catsRes.json() : null;

        const professionals = profsData?.data?.data || [];
        const categories = catsData?.data || [];

        const totalProfessionals = professionals.length;
        const totalCategories = categories.length;
        const featuredCount = professionals.filter((p: any) => p.featured).length;
        const activeCount = professionals.filter((p: any) => p.active).length;

        setStats([
          { label: 'Total Professionals', value: totalProfessionals.toString(), icon: '👥' },
          { label: 'Total Categories', value: totalCategories.toString(), icon: '🏷️' },
          { label: 'Featured Listings', value: featuredCount.toString(), icon: '⭐' },
          { label: 'Active Professionals', value: activeCount.toString(), icon: '✅' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">Welcome back! Manage your platform here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow hover:shadow-md transition-shadow"
          >
            <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quick Access</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your content and settings</p>
        </div>
        
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Link 
            href="/dashboard/blog" 
            className="flex flex-col items-center justify-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-center"
          >
            <span className="text-2xl sm:text-3xl mb-2">📝</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Blog Posts</span>
          </Link>

          <Link 
            href="/dashboard/news-flashes" 
            className="flex flex-col items-center justify-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-center"
          >
            <span className="text-2xl sm:text-3xl mb-2">📢</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">News Flashes</span>
          </Link>

          <Link 
            href="/dashboard/categories" 
            className="flex flex-col items-center justify-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-center"
          >
            <span className="text-2xl sm:text-3xl mb-2">🏷️</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Categories</span>
          </Link>

          <Link 
            href="/dashboard/professionals" 
            className="flex flex-col items-center justify-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-center"
          >
            <span className="text-2xl sm:text-3xl mb-2">👥</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Professionals</span>
          </Link>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <Link 
          href="/dashboard/analytics" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base"
        >
          View detailed analytics →
        </Link>
      </div>
    </div>
  );
}
