import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          DevNexus
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          A visually immersive, local-first development workstation
        </p>
        <div className="pt-4">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/50 transition-all hover:scale-105 hover:shadow-primary/70"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
