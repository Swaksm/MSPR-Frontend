import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy</span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
            Votre nutrition, simplifiee
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Suivez vos repas, analysez vos apports caloriques et atteignez vos objectifs de sante.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground font-medium rounded-xl transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Commencer
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">Jarmy</p>
      </footer>
    </main>
  );
}
