/**
 * Professional Dashboard Layout
 */


import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/verify";
import ProfessionalSidebar from "@/components/layout/ProfessionalSidebar";

export default async function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "professional") {
    redirect("/login");
  }
  return (
    <div className="min-h-screen md:flex bg-gray-50 dark:bg-gray-900">
      <div className="md:w-56 md:flex-shrink-0">
        <ProfessionalSidebar />
      </div>
      <main className="flex-1 pb-16 md:pb-0 md:pl-0">
        {children}
      </main>
    </div>
  );
}
