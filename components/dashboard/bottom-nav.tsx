"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Accueil",
  },
  {
    href: "/dashboard/meals",
    icon: Calendar,
    label: "Repas",
  },
  {
    href: "/dashboard/add-meal",
    icon: Plus,
    label: "Ajouter",
    primary: true,
  },
  {
    href: "/dashboard/stats",
    icon: BarChart3,
    label: "Stats",
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg -mt-4">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
