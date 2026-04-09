import Link from "next/link";
import { Salad, LineChart, Target, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Connexion
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col px-5 py-12 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-accent-foreground">Coaching nutritionnel intelligent</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance leading-tight">
              Atteignez vos objectifs de sante
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Analysez vos repas, suivez vos calories et recevez des conseils personnalises pour une alimentation equilibree.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 h-14 px-8 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Aucune carte de credit requise
            </p>
          </div>

          {/* Features */}
          <div className="pt-8 space-y-3">
            <FeatureCard
              icon={<Salad className="w-5 h-5" />}
              title="Analyse IA"
              description="Decrivez votre repas et obtenez une estimation calorique instantanee"
              delay="0"
            />
            <FeatureCard
              icon={<LineChart className="w-5 h-5" />}
              title="Suivi quotidien"
              description="Visualisez vos apports et votre progression au fil du temps"
              delay="100"
            />
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="Objectifs personnels"
              description="Definissez vos objectifs et recevez des recommandations adaptees"
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
            <Salad className="w-3 h-3 text-primary" />
          </div>
          <span>Jarmy - Votre coach nutrition</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
        <span className="text-primary">{icon}</span>
      </div>
      <div className="space-y-0.5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
