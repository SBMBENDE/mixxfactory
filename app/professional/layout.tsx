/**
 * Professional Dashboard Layout
 */

'use client';

import { usePathname } from "next/navigation";
import ProfessionalSidebar from "@/components/layout/ProfessionalSidebar";
import { DashboardGuard } from "@/components/DashboardGuard";

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Profile page is accessible to all tiers, other pages require paid subscription
  const isProfilePage = pathname === '/professional/profile';
  
  return (
    <div className="min-h-screen md:flex bg-gray-50 dark:bg-gray-900">
      <div className="md:w-56 md:flex-shrink-0">
        <ProfessionalSidebar />
      </div>
      <main className="flex-1 pb-16 md:pb-0 md:pl-0">
        {isProfilePage ? (
          children
        ) : (
          <DashboardGuard>{children}</DashboardGuard>
        )}
      </main>
    </div>
  );
}
