import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Pause, Play, Plus, Send, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { useCampaigns, useAuth } from "@/stores";
import { can } from "@/lib/permissions";
import type { Campaign, CampaignStep } from "@/lib/types";

export const Route = createFileRoute("/_app/campaigns")({
  component: CampaignsPage,
});

const emptyCampaign: Omit<Campaign, "id" | "stats"> = {
  nom: "",
  produit: "Auto",
  status: "brouillon",
  noReply: false,
  stopOnClick: true,
  stopOnReply: true,
  steps: [{ id: "s1", delayDays: 0, message: "", buttons: [] }],
};

function CampaignsPage() {
  const { items, create, update, duplicate, remove } = useCampaigns();
  const role = useAuth((s) => s.currentRole);
  const canCreate = can(role, "campaigns", "create");
  const canUpdate = can(role, "campaigns", "update");
  const canDelete = can(role, "campaigns", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyCampaign);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Campaign | null>(null);

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
    });
    setOpen(true);
  };
  const addStep = () => {
    setForm({
      ...form,
      steps: [
        ...form.steps,
        { id: `s${form.steps.length + 1}`, delayDays: form.steps.length * 3, message: "", buttons: [] },
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
  const submit = () => {
    if (!form.nom.trim()) {
      toast.error("Nom requis");
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
                    <>
                      <Pause className="mr-2 h-4 w-4" /> Mettre en pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> Activer
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la campagne" : "Nouvelle campagne"}</DialogTitle>
            <DialogDescription>
              Définissez le contenu et les règles de relance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nom</Label>
                <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div>
                <Label>Produit / segment</Label>
                <Input value={form.produit} onChange={(e) => setForm({ ...form, produit: e.target.value })} />
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Règles</div>
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <div>
                    <div>Mode No-Reply</div>
                    <div className="text-xs text-muted-foreground">
                      Le prospect ne peut pas répondre en texte libre
                    </div>
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
            <div>
              <div className="mb-2 flex items-center justify-between">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-7 w-7"
                          onClick={() => removeStep(i)}
                        >
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
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
                        <span
                          key={b}
                          className="rounded-full border border-primary/40 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                        >
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
