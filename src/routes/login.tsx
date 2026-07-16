import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
      toast.success("Bienvenue 👋");
      navigate({ to: "/dashboard" });
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 -z-10 gradient-subtle" />
      <div className="absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 -z-10 h-[36rem] w-[36rem] rounded-full bg-accent/30 blur-3xl" />

      <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card/80 p-10 shadow-elegant backdrop-blur-xl sm:p-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow ring-1 ring-white/10">
            <Logo size={44} />
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl">Nexa Assurances</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-12 text-base"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-12 text-base"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full gradient-primary text-base shadow-glow hover-lift"
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
      </div>
    </div>
  );
}
