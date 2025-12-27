import React from "react";

export default function ProfessionalDashboardMetrics({
  name = "Professional",
  status = "active",
  jobsCompleted = 0,
  jobsActive = 0,
  earningsThisMonth = 0,
  leadsReceived = 0,
  appointmentsToday = 0,
  notifications = [],
}: {
  name?: string;
  status?: "active" | "pending" | "suspended";
  jobsCompleted?: number;
  jobsActive?: number;
  earningsThisMonth?: number;
  leadsReceived?: number;
  appointmentsToday?: number;
  notifications?: { id: string; message: string; type?: string }[];
}) {
  const statusColor =
    status === "active"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">👋 Welcome, {name}!</h2>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400">Today</span>
          <span className="text-lg font-bold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Jobs Completed" value={jobsCompleted} icon="✅" />
        <MetricCard label="Active Jobs" value={jobsActive} icon="🟢" />
        <MetricCard label="Earnings (This Month)" value={`€${earningsThisMonth}`} icon="💶" />
        <MetricCard label="Leads Received" value={leadsReceived} icon="📥" />
        <MetricCard label="Appointments Today" value={appointmentsToday} icon="📅" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">🔔 Notifications</h3>
        {notifications.length === 0 ? (
          <div className="text-gray-400 text-sm">No new notifications.</div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="bg-white dark:bg-gray-800 rounded px-3 py-2 shadow border border-gray-100 dark:border-gray-800 flex items-center">
                <span className="mr-2">{n.type === "job" ? "💼" : n.type === "message" ? "💬" : "🔔"}</span>
                <span>{n.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col items-center border border-gray-100 dark:border-gray-800">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}
