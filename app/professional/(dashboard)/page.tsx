import ProfessionalDashboardMetrics from "@/components/dashboard/ProfessionalDashboardMetrics";

export default function ProfessionalDashboardHome() {
  // fallback mock data
  const name = "Professional";
  const status = "active";
  const jobsCompleted = 24, jobsActive = 3, earningsThisMonth = 1200, leadsReceived = 7, appointmentsToday = 2, notifications = [
    { id: "1", message: "You have a new job request from John Smith.", type: "job" },
    { id: "2", message: "Client Anna sent you a message.", type: "message" },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <ProfessionalDashboardMetrics
        name={name}
        status={status}
        jobsCompleted={jobsCompleted}
        jobsActive={jobsActive}
        earningsThisMonth={earningsThisMonth}
        leadsReceived={leadsReceived}
        appointmentsToday={appointmentsToday}
        notifications={notifications}
      />
    </div>
  );
}
