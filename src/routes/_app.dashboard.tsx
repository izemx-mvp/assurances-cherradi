import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProspects, useCampaigns, useConversations } from "@/stores";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Send, Target, TrendingUp, Users } from "lucide-react";
import { StatusBadge, statusLabels } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const weekly = [
  { j: "Lun", leads: 12 },
  { j: "Mar", leads: 18 },
  { j: "Mer", leads: 22 },
  { j: "Jeu", leads: 15 },
  { j: "Ven", leads: 28 },
  { j: "Sam", leads: 9 },
  { j: "Dim", leads: 6 },
];

function DashboardPage() {
  const prospects = useProspects((s) => s.items);
  const campaigns = useCampaigns((s) => s.items);
  const conversations = useConversations((s) => s.items);

  const total = prospects.length;
  const qualified = prospects.filter((p) => p.statut === "qualifie" || p.statut === "converti").length;
  const converted = prospects.filter((p) => p.statut === "converti").length;
  const conversionRate = total ? Math.round((converted / total) * 100) : 0;
  const messages7d = campaigns.reduce((acc, c) => acc + c.stats.sent, 0);

  const campaignPerf = campaigns.slice(0, 5).map((c) => ({
    nom: c.nom.length > 18 ? c.nom.slice(0, 18) + "…" : c.nom,
    envoyés: c.stats.sent,
    cliqués: c.stats.clicked,
  }));

  const recent = [...prospects]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  const kpis = [
    { label: "Prospects totaux", value: total, icon: Users, color: "from-primary to-primary-glow" },
    { label: "Qualifiés", value: qualified, icon: Target, color: "from-success to-accent" },
    { label: "Taux de conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "from-warning to-primary-glow" },
    { label: "Messages envoyés", value: messages7d.toLocaleString("fr-FR"), icon: Send, color: "from-info to-primary" },
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos prospects et campagnes WhatsApp"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${k.color}`} />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{k.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Nouveaux prospects — 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="j" stroke="currentColor" fontSize={12} />
                  <YAxis stroke="currentColor" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusLabels).map(([k, label]) => {
              const n = prospects.filter((p) => p.statut === k).length;
              const pct = total ? (n / total) * 100 : 0;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance des campagnes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerf}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="nom" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="envoyés" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cliqués" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Prospects récents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div>
                  <div className="font-medium">
                    {p.prenom} {p.nom}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.produit} · {p.phone}
                  </div>
                </div>
                <StatusBadge status={p.statut} />
              </div>
            ))}
            {conversations.slice(0, 0)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
