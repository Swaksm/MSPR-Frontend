import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin — Jarmy",
  description: "Panneau d'administration Jarmy. Acces restreint.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
