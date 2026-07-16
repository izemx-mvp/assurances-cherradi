import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock, Copy, MoreHorizontal, Pause, Play, Plus, Send, Target, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCampaigns, useAuth, useProspects } from "@/stores";
import { can } from "@/lib/permissions";
import { dayLabels, defaultSchedule } from "@/lib/types";
import type { Campaign, CampaignStep, CampaignTargetMode, WeeklySchedule } from "@/lib/types";

export const Route = createFileRoute("/_app/campaigns")({
  component: CampaignsPage,
});

const products = ["Auto", "Habitation", "Santé", "Vie", "Pro", "Moto", "Voyage", "Emprunteur"];

const emptyCampaign: Omit<Campaign, "id" | "stats"> = {
  nom: "",
  produit: "Auto",
  status: "brouillon",
  noReply: false,
  stopOnClick: true,
  stopOnReply: true,
  steps: [{ id: "s1", delayDays: 0, message: "", buttons: [] }],
  initialDelayHours: 0,
  betweenDelayHours: 72,
  schedule: defaultSchedule,
  targetMode: "product",
  targetProduct: "Auto",
  prospectIds: [],
};

function CampaignsPage() {
  const { items, create, update, duplicate, remove } = useCampaigns();
  const prospects = useProspects((s) => s.items);
  const role = useAuth((s) => s.currentRole);
  const canCreate = can(role, "campaigns", "create");
  const canUpdate = can(role, "campaigns", "update");
  const canDelete = can(role, "campaigns", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Omit<Campaign, "id" | "stats">>(emptyCampaign);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Campaign | null>(null);
  const [prospectSearch, setProspectSearch] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCampaign);
    setOpen(true);
  };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      nom: c.nom,
      produit: c.produit,
      status: c.status,
      noReply: c.noReply,
      stopOnClick: c.stopOnClick,
      stopOnReply: c.stopOnReply,
      steps: c.steps,
      initialDelayHours: c.initialDelayHours,
      betweenDelayHours: c.betweenDelayHours,
      schedule: c.schedule ?? defaultSchedule,
      targetMode: c.targetMode ?? "product",
      targetProduct: c.targetProduct ?? c.produit,
      prospectIds: c.prospectIds ?? [],
    });
    setOpen(true);
  };
  const addStep = () => {
    setForm({
      ...form,
      steps: [
        ...form.steps,
        {
          id: `s${form.steps.length + 1}`,
          delayDays: Math.round((form.betweenDelayHours / 24) * form.steps.length) || form.steps.length * 3,
          message: "",
          buttons: [],
        },
      ],
    });
  };
  const updateStep = (i: number, patch: Partial<CampaignStep>) => {
    const steps = [...form.steps];
    steps[i] = { ...steps[i], ...patch };
    setForm({ ...form, steps });
  };
  const removeStep = (i: number) => {
    setForm({ ...form, steps: form.steps.filter((_, idx) => idx !== i) });
  };
  const setDay = (day: number, patch: Partial<WeeklySchedule[number]>) => {
    setForm({ ...form, schedule: { ...form.schedule, [day]: { ...form.schedule[day], ...patch } } });
  };
  const toggleProspect = (id: string) => {
    const set = new Set(form.prospectIds ?? []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setForm({ ...form, prospectIds: Array.from(set) });
  };

  const filteredProspects = useMemo(() => {
    const q = prospectSearch.trim().toLowerCase();
    return prospects.filter((p) =>
      !q ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.produit.toLowerCase().includes(q),
    );
  }, [prospects, prospectSearch]);

  const submit = () => {
    if (!form.nom.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (form.targetMode === "manual" && (form.prospectIds ?? []).length === 0) {
      toast.error("Sélectionnez au moins un prospect");
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success("Campagne mise à jour");
    } else {
      create(form);
      toast.success("Campagne créée");
    }
    setOpen(false);
  };

  const targetCount = (c: Campaign) => {
    if (c.targetMode === "manual") return c.prospectIds?.length ?? 0;
    if (c.targetMode === "product") return prospects.filter((p) => p.produit === (c.targetProduct ?? c.produit)).length;
    return prospects.length;
  };

  return (
    <div>
      <PageHeader
        title="Campagnes de relance"
        description="Séquences WhatsApp automatiques pilotées par l'IA"
        actions={
          canCreate && (
            <Button onClick={openCreate} className="gradient-primary shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle campagne
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="group relative overflow-hidden shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary-glow" />
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="min-w-0">
                <CardTitle className="truncate">{c.nom}</CardTitle>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{c.produit}</Badge>
                  {c.noReply && <Badge className="bg-info/20 text-info-foreground border-info/30" variant="outline">No-Reply</Badge>}
                  <Badge
                    variant="outline"
                    className={
                      c.status === "actif"
                        ? "border-success/30 bg-success/15 text-success-foreground"
                        : c.status === "pause"
                          ? "border-warning/30 bg-warning/15 text-warning-foreground"
                          : "border-muted-foreground/30 bg-muted"
                    }
                  >
                    {c.status === "actif" ? "Actif" : c.status === "pause" ? "En pause" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreview(c)}>
                    <Send className="mr-2 h-4 w-4" /> Aperçu
                  </DropdownMenuItem>
                  {canUpdate && (
                    <DropdownMenuItem onClick={() => openEdit(c)}>
                      <Pencil className="mr-2 h-4 w-4" /> Modifier
                    </DropdownMenuItem>
                  )}
                  {canCreate && (
                    <DropdownMenuItem
                      onClick={() => {
                        duplicate(c.id);
                        toast.success("Campagne dupliquée");
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Dupliquer
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="font-semibold">{c.stats.sent}</div>
                  <div className="text-muted-foreground">Envoyés</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="font-semibold">{c.stats.opened}</div>
                  <div className="text-muted-foreground">Ouverts</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="font-semibold">{c.stats.clicked}</div>
                  <div className="text-muted-foreground">Clics</div>
                </div>
                <div className="rounded-md bg-primary/10 p-2">
                  <div className="font-semibold text-primary">{c.stats.converted}</div>
                  <div className="text-muted-foreground">Convertis</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> J+{c.initialDelayHours ? (c.initialDelayHours / 24).toFixed(1) : "0"} → {Math.round((c.betweenDelayHours ?? 72) / 24)}j entre relances</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> {targetCount(c)} prospect(s)</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {c.steps.length} étape{c.steps.length > 1 ? "s" : ""} · J+
                {c.steps.map((s) => s.delayDays).join(", J+")}
              </div>
            </CardContent>
            {canUpdate && (
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const next = c.status === "actif" ? "pause" : "actif";
                    update(c.id, { status: next });
                    toast.success(next === "actif" ? "Campagne activée" : "Campagne mise en pause");
                  }}
                >
                  {c.status === "actif" ? (
                    <><Pause className="mr-2 h-4 w-4" /> Mettre en pause</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Activer</>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la campagne" : "Nouvelle campagne"}</DialogTitle>
            <DialogDescription>Contenu, ciblage, timing et créneaux d'envoi.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="targeting">Ciblage</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="sequence">Séquence</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nom</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <Label>Produit / segment</Label>
                  <Select value={form.produit} onValueChange={(v) => setForm({ ...form, produit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-2 text-sm font-medium">Règles</div>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <div>
                      <div>Mode No-Reply</div>
                      <div className="text-xs text-muted-foreground">Le prospect ne peut pas répondre en texte libre</div>
                    </div>
                    <Switch checked={form.noReply} onCheckedChange={(v) => setForm({ ...form, noReply: v })} />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <div>Arrêt sur clic</div>
                    <Switch checked={form.stopOnClick} onCheckedChange={(v) => setForm({ ...form, stopOnClick: v })} />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <div>Arrêt sur réponse</div>
                    <Switch checked={form.stopOnReply} onCheckedChange={(v) => setForm({ ...form, stopOnReply: v })} />
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              <div>
                <Label>Cibler</Label>
                <Select
                  value={form.targetMode}
                  onValueChange={(v) => setForm({ ...form, targetMode: v as CampaignTargetMode })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les prospects</SelectItem>
                    <SelectItem value="product">Par produit</SelectItem>
                    <SelectItem value="manual">Sélection manuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.targetMode === "product" && (
                <div>
                  <Label>Produit ciblé</Label>
                  <Select value={form.targetProduct} onValueChange={(v) => setForm({ ...form, targetProduct: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {prospects.filter((p) => p.produit === form.targetProduct).length} prospect(s) correspondent.
                  </div>
                </div>
              )}
              {form.targetMode === "manual" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Prospects sélectionnés ({(form.prospectIds ?? []).length})</Label>
                    <Input
                      placeholder="Rechercher…"
                      value={prospectSearch}
                      onChange={(e) => setProspectSearch(e.target.value)}
                      className="h-8 max-w-56"
                    />
                  </div>
                  <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-2">
                    {filteredProspects.map((p) => {
                      const checked = form.prospectIds?.includes(p.id) ?? false;
                      return (
                        <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
                          <Checkbox checked={checked} onCheckedChange={() => toggleProspect(p.id)} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium">{p.prenom} {p.nom}</div>
                            <div className="truncate text-xs text-muted-foreground">{p.phone} · {p.produit}</div>
                          </div>
                        </label>
                      );
                    })}
                    {filteredProspects.length === 0 && (
                      <div className="p-3 text-center text-xs text-muted-foreground">Aucun prospect</div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Délai avant 1re relance (heures)</Label>
                  <Input
                    type="number" min={0}
                    value={form.initialDelayHours}
                    onChange={(e) => setForm({ ...form, initialDelayHours: Number(e.target.value) })}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Temps entre l'entrée du prospect et le 1er message.
                  </div>
                </div>
                <div>
                  <Label>Délai entre chaque relance (heures)</Label>
                  <Input
                    type="number" min={1}
                    value={form.betweenDelayHours}
                    onChange={(e) => setForm({ ...form, betweenDelayHours: Number(e.target.value) })}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Ex : 72h = 3 jours. Peut être redéfini par étape.
                  </div>
                </div>
              </div>
              <div className="rounded-lg border">
                <div className="border-b px-3 py-2 text-sm font-medium">
                  Jours & créneaux d'envoi autorisés
                </div>
                <div className="divide-y">
                  {[0,1,2,3,4,5,6].map((d) => {
                    const w = form.schedule[d];
                    return (
                      <div key={d} className="flex items-center gap-3 px-3 py-2">
                        <div className="flex w-28 items-center gap-2">
                          <Switch checked={w.enabled} onCheckedChange={(v) => setDay(d, { enabled: v })} />
                          <span className="text-sm">{dayLabels[d]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={w.start}
                            onChange={(e) => setDay(d, { start: e.target.value })}
                            className="h-8 w-28"
                            disabled={!w.enabled}
                          />
                          <span className="text-xs text-muted-foreground">à</span>
                          <Input
                            type="time"
                            value={w.end}
                            onChange={(e) => setDay(d, { end: e.target.value })}
                            className="h-8 w-28"
                            disabled={!w.enabled}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sequence" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Séquence de messages</Label>
                <Button size="sm" variant="outline" onClick={addStep}>
                  <Plus className="mr-1 h-3 w-3" /> Étape
                </Button>
              </div>
              <div className="space-y-3">
                {form.steps.map((s, i) => (
                  <div key={s.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-semibold">Étape {i + 1}</span>
                      <span className="text-xs text-muted-foreground">J+</span>
                      <Input
                        type="number"
                        value={s.delayDays}
                        onChange={(e) => updateStep(i, { delayDays: Number(e.target.value) })}
                        className="h-7 w-16"
                      />
                      {form.steps.length > 1 && (
                        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={() => removeStep(i)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Bonjour {{prenom}}, votre devis est prêt…"
                      value={s.message}
                      onChange={(e) => updateStep(i, { message: e.target.value })}
                    />
                    <Input
                      className="mt-2"
                      placeholder="Boutons interactifs (séparés par virgule)"
                      value={s.buttons.join(", ")}
                      onChange={(e) =>
                        updateStep(i, { buttons: e.target.value.split(",").map((b) => b.trim()).filter(Boolean) })
                      }
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} className="gradient-primary">
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aperçu WhatsApp — {preview?.nom}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 rounded-lg bg-[oklch(0.95_0.02_155)] p-4 dark:bg-[oklch(0.2_0.02_155)]">
            {preview?.steps.map((s, i) => (
              <div key={s.id}>
                <div className="mb-1 text-center text-[10px] text-muted-foreground">
                  {i === 0 ? "J+0" : `Relance J+${s.delayDays}`}
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white p-3 text-sm shadow-sm dark:bg-card">
                  <div>{s.message || <span className="text-muted-foreground">(message vide)</span>}</div>
                  {s.buttons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.buttons.map((b) => (
                        <span key={b} className="rounded-full border border-primary/40 bg-primary/5 px-2.5 py-0.5 text-xs text-primary">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette campagne ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  remove(deleteId);
                  toast.success("Campagne supprimée");
                  setDeleteId(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
