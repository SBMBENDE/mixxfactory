
import Link from 'next/link';

const stats = [
  { label: 'Total Users', value: 1243 },
  { label: 'Total Professionals', value: 312 },
  { label: 'Active Bookings', value: 27 },
  { label: 'Platform Activity', value: 'High' },
];

const quickLinks = [
  { label: 'Manage News Flashes', href: '/admin/news-flash' },
  { label: 'Manage Events', href: '/admin/events' },
  { label: 'Manage Featured', href: '/admin/featured' },
  { label: 'Manage Users', href: '/admin/users' },
  { label: 'Manage Professionals', href: '/admin/professionals' },
  { label: 'View Bookings', href: '/admin/bookings' },
];

const recentActivity = [
  { id: 1, type: 'Professional Registered', detail: 'DJ Coolio', time: '2 min ago' },
  { id: 2, type: 'Booking Created', detail: 'Event Hall - Jan 2026', time: '10 min ago' },
  { id: 3, type: 'User Joined', detail: 'jane.doe@email.com', time: '30 min ago' },
  { id: 4, type: 'Event Published', detail: 'New Year Bash', time: '1 hr ago' },
];

function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-gray-900 text-white py-8 px-4 border-r border-gray-800">
      <div className="mb-8">
        <span className="text-2xl font-bold tracking-tight">MixxFactory</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {quickLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="w-full h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 justify-between">
      <div className="text-lg font-semibold tracking-tight">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm">System Status: <span className="text-green-600 font-semibold">Online</span></span>
        <span className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">A</span>
      </div>
    </header>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <section className="px-6 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Platform overview / system status</p>
          </header>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">CRUD Operations</h2>
            <div className="flex flex-wrap gap-4">
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href} className="px-5 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Detail</th>
                    <th className="px-4 py-2 text-left font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2">{item.type}</td>
                      <td className="px-4 py-2">{item.detail}</td>
                      <td className="px-4 py-2 text-gray-500">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
