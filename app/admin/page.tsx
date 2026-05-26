
import Link from 'next/link';
import { connectDB } from '@/lib/db/connection';
import {
  BookingModel,
  EventModel,
  ProfessionalModel,
  TicketPurchaseModel,
  UserModel,
} from '@/lib/db/models';

export const dynamic = 'force-dynamic';

type SalesSummary = {
  totalRevenue: number;
  ticketsSold: number;
  confirmedPurchases: number;
  monthRevenue: number;
  monthTicketsSold: number;
  pendingPurchases: number;
};

type RecentPurchase = {
  _id: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  createdAt: Date;
};

async function getDashboardData() {
  await connectDB();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalProfessionals,
    activeBookings,
    totalEvents,
    pendingPurchases,
    confirmedSalesAgg,
    monthSalesAgg,
    recentPurchases,
  ] = await Promise.all([
    UserModel.countDocuments(),
    ProfessionalModel.countDocuments({ active: true }),
    BookingModel.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
    EventModel.countDocuments(),
    TicketPurchaseModel.countDocuments({ status: 'pending' }),
    TicketPurchaseModel.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: '$quantity' },
          confirmedPurchases: { $sum: 1 },
        },
      },
    ]),
    TicketPurchaseModel.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          monthRevenue: { $sum: '$totalAmount' },
          monthTicketsSold: { $sum: '$quantity' },
        },
      },
    ]),
    TicketPurchaseModel.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('eventTitle ticketType quantity totalAmount currency customerEmail status createdAt')
      .lean(),
  ]);

  const confirmedSales = confirmedSalesAgg[0] || {
    totalRevenue: 0,
    ticketsSold: 0,
    confirmedPurchases: 0,
  };

  const monthSales = monthSalesAgg[0] || {
    monthRevenue: 0,
    monthTicketsSold: 0,
  };

  const salesSummary: SalesSummary = {
    totalRevenue: confirmedSales.totalRevenue || 0,
    ticketsSold: confirmedSales.ticketsSold || 0,
    confirmedPurchases: confirmedSales.confirmedPurchases || 0,
    monthRevenue: monthSales.monthRevenue || 0,
    monthTicketsSold: monthSales.monthTicketsSold || 0,
    pendingPurchases,
  };

  return {
    platformStats: {
      totalUsers,
      totalProfessionals,
      activeBookings,
      totalEvents,
    },
    salesSummary,
    recentPurchases: recentPurchases as unknown as RecentPurchase[],
  };
}

function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function getStatusStyle(status: RecentPurchase['status']) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'refunded':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

const quickLinks = [
  { label: 'Manage Blog Posts', href: '/admin/blog' },
  { label: 'Manage Blog Comments', href: '/admin/blog/comments' },
  { label: 'Manage News Flashes', href: '/admin/news-flash' },
  { label: 'Manage Events', href: '/admin/events' },
  { label: 'Manage Featured', href: '/admin/featured' },
  { label: 'Manage Users', href: '/admin/users' },
  { label: 'Manage Professionals', href: '/admin/professionals' },
  { label: 'Manage Categories', href: '/admin/categories' },
  { label: 'Manage Reviews', href: '/admin/reviews' },
  { label: 'View Bookings', href: '/admin/bookings' },
  { label: 'SOS Support Tickets', href: '/admin/sos-support' },
  { label: 'Manage Contact Messages', href: '/admin/contact-messages' },
];

function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-gray-900 text-white py-8 px-4 border-r border-gray-800">
      <div className="mb-8">
        <span className="text-2xl font-bold tracking-tight">Afrobizz</span>
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
  const dataPromise = getDashboardData();

  return <AdminDashboardContent dataPromise={dataPromise} />;
}

async function AdminDashboardContent({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof getDashboardData>;
}) {
  const { platformStats, salesSummary, recentPurchases } = await dataPromise;

  const stats = [
    { label: 'Total Users', value: platformStats.totalUsers },
    { label: 'Total Professionals', value: platformStats.totalProfessionals },
    { label: 'Active Bookings', value: platformStats.activeBookings },
    { label: 'Total Events', value: platformStats.totalEvents },
  ];

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
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-5 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Ticket Sales</h2>
              <Link href="/admin/events" className="text-sm text-blue-600 hover:underline">
                Manage events
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(salesSummary.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Confirmed purchases only</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <p className="text-sm text-gray-500 mb-1">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{salesSummary.ticketsSold}</p>
                <p className="text-xs text-gray-500 mt-2">From {salesSummary.confirmedPurchases} purchases</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <p className="text-sm text-gray-500 mb-1">Pending Purchases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{salesSummary.pendingPurchases}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting payment confirmation</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last 30 Days Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(salesSummary.monthRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tickets Sold (30d)</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{salesSummary.monthTicketsSold}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Ticket Purchases</h2>
              <a
                href="/api/admin/tickets/export"
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              >
                Export CSV
              </a>
            </div>
            <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left font-semibold">Event</th>
                    <th className="px-4 py-2 text-left font-semibold">Customer</th>
                    <th className="px-4 py-2 text-left font-semibold">Ticket</th>
                    <th className="px-4 py-2 text-left font-semibold">Amount</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={6}>
                        No ticket purchases yet.
                      </td>
                    </tr>
                  ) : (
                    recentPurchases.map((purchase) => (
                      <tr key={purchase._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-2">{purchase.eventTitle}</td>
                        <td className="px-4 py-2">{purchase.customerEmail}</td>
                        <td className="px-4 py-2">
                          {purchase.ticketType} x{purchase.quantity}
                        </td>
                        <td className="px-4 py-2">{formatCurrency(purchase.totalAmount, purchase.currency)}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusStyle(
                              purchase.status
                            )}`}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{new Date(purchase.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
