import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Welcome, admin! Manage MixxFactory below.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-2">
            <li><Link href="/admin/users" className="text-blue-600 hover:underline">Manage Users</Link></li>
            <li><Link href="/admin/categories" className="text-blue-600 hover:underline">Manage Categories</Link></li>
            <li><Link href="/admin/professionals" className="text-blue-600 hover:underline">Manage Professionals</Link></li>
            <li><Link href="/admin/events" className="text-blue-600 hover:underline">Manage Events</Link></li>
            <li><Link href="/admin/newsletter" className="text-blue-600 hover:underline">Newsletter</Link></li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Site Stats</h2>
          <ul className="space-y-2">
            <li>Professionals: <span className="font-mono">--</span></li>
            <li>Categories: <span className="font-mono">--</span></li>
            <li>Events: <span className="font-mono">--</span></li>
            <li>Users: <span className="font-mono">--</span></li>
            <li>Newsletter Subscribers: <span className="font-mono">--</span></li>
          </ul>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <p className="text-gray-500 dark:text-gray-400">No recent activity to show.</p>
      </div>
    </div>
  );
}
