"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/professional", label: "Home", icon: "🏠" },
  { href: "/professional/profile", label: "Profile", icon: "👤" },
  { href: "/professional/calendar", label: "Calendar", icon: "📅", proBadge: true },
  { href: "/professional/jobs", label: "Jobs", icon: "💼" },
  { href: "/professional/messages", label: "Messages", icon: "💬" },
  { href: "/professional/schedule", label: "Schedule", icon: "🗓️" },
  { href: "/professional/earnings", label: "Earnings", icon: "💰" },
  { href: "/professional/reviews", label: "Reviews", icon: "⭐" },
  { href: "/professional/settings", label: "Settings", icon: "⚙️" },
  { href: "/professional/help", label: "Help", icon: "🆘" },
];

export default function ProfessionalSidebar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-white border-t border-gray-200 shadow md:static md:shadow-none md:border-t-0 md:border-r md:w-56 md:h-full md:flex-col dark:bg-gray-900 dark:border-gray-800">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 md:py-3 md:px-4 text-xs md:text-base font-medium transition-colors duration-150 relative ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-300"}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-lg md:text-xl mb-0.5">{item.icon}</span>
            <span className="hidden md:inline flex items-center gap-1">
              {item.label}
              {item.proBadge && (
                <span className="inline-block text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-semibold">
                  PRO
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
