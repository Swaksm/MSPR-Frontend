"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    router.replace(userId ? "/dashboard" : "/login")
  }, [router])

  return null
}
