"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Target, User, Activity } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("nav_journal") },
    { href: "/dashboard/stats", icon: BarChart2, label: t("nav_stats") },
    { href: "/dashboard/objectives", icon: Target, label: t("nav_goals") },
    { href: "/dashboard/health", icon: Activity, label: t("nav_health") },
    { href: "/dashboard/profiles", icon: User, label: t("nav_profile") },
  ];

  const isFormPage =
    pathname?.includes("/add-meal") ||
    pathname?.includes("/manual-meal") ||
    pathname?.includes("/subscribe");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-20">{children}</div>

      {!isFormPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 ${
                    isActive
                      ? "text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
