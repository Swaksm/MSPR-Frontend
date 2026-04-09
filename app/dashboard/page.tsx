"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.replace("/login");
      return;
    }
    const name = localStorage.getItem("user_name") || "Utilisateur";
    setUserName(name);
  }, [router]);

  if (!mounted) return null;

  function handleLogout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy</span>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Deconnexion
        </button>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Greeting */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Bonjour, {userName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Que souhaitez-vous faire aujourd&apos;hui ?
            </p>
          </div>

          {/* Actions */}
          <nav className="space-y-3">
            <Link
              href="/dashboard/add-meal"
              className="flex items-center justify-between w-full h-14 px-5 bg-primary text-primary-foreground rounded-xl font-medium transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <span>Analyser un repas</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <Link
              href="/dashboard/manual-meal"
              className="flex items-center justify-between w-full h-14 px-5 bg-secondary text-secondary-foreground rounded-xl font-medium border border-border transition-colors hover:bg-muted active:scale-[0.99]"
            >
              <span>Ajouter manuellement</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <Link
              href="/dashboard/meals"
              className="flex items-center justify-between w-full h-14 px-5 bg-secondary text-secondary-foreground rounded-xl font-medium border border-border transition-colors hover:bg-muted active:scale-[0.99]"
            >
              <span>Mes repas</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
