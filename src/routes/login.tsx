import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("karim@karim-assurances.fr");
  const [password, setPassword] = useState("nexa-demo-2026");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Bienvenue chez Nexa Assurances 👋");
      navigate({ to: "/dashboard" });
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 gradient-subtle" />
      <div className="absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(oklch(0.35_0.08_210)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-elegant backdrop-blur-xl md:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between gap-8 gradient-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Logo size={38} />
            </div>
            <div>
              <div className="font-display text-2xl leading-none">Nexa</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.24em] opacity-80">
                Assurances · IA
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-3xl leading-tight">
              Le cockpit IA qui qualifie, relance et convertit vos prospects WhatsApp.
            </h1>
            <p className="text-sm opacity-80">
              Séquences automatiques, reprise humaine intelligente, tableau de bord temps réel.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
              {[
                { k: "Réponse", v: "< 3 s" },
                { k: "Qualif.", v: "+38 %" },
                { k: "Conversion", v: "×2.4" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/10 p-3 backdrop-blur">
                  <div className="text-lg font-semibold">{s.v}</div>
                  <div className="opacity-80">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs opacity-70">© {new Date().getFullYear()} Nexa Assurances</div>
        </div>

        {/* Right panel — form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <Logo size={36} />
            <div className="font-display text-xl">Nexa Assurances</div>
          </div>
          <div className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
              Espace agence
            </div>
            <h2 className="mt-2 font-display text-3xl">Connexion</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Identifiants de démonstration pré-remplis.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast("Contactez votre administrateur.")}
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Démo :</span>{" "}
              karim@karim-assurances.fr · nexa-demo-2026
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary shadow-glow hover-lift"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Protégé par Nexa · Chiffrement WhatsApp de bout en bout
          </div>
        </div>
      </div>
    </div>
  );
}
