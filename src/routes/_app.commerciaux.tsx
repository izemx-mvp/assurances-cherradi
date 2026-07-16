import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useAuth, useCommerciaux, useProspects } from "@/stores";
import { can } from "@/lib/permissions";
import type { Commercial } from "@/lib/types";

export const Route = createFileRoute("/_app/commerciaux")({
  component: CommerciauxPage,
});

const empty: Omit<Commercial, "id"> = {
  nom: "",
  email: "",
  phone: "",
  actif: true,
  closingRate: 30,
};

function CommerciauxPage() {
  const { items, create, update, remove } = useCommerciaux();
  const prospects = useProspects((s) => s.items);
  const role = useAuth((s) => s.currentRole);
  const canCreate = can(role, "commerciaux", "create");
  const canUpdate = can(role, "commerciaux", "update");
  const canDelete = can(role, "commerciaux", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Commercial | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: Commercial) => {
    setEditing(c);
    setForm({ nom: c.nom, email: c.email, phone: c.phone, actif: c.actif, closingRate: c.closingRate });
    setOpen(true);
  };
  const submit = () => {
    if (!form.nom || !form.email) {
      toast.error("Nom et email requis");
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success("Commercial mis à jour");
    } else {
      create(form);
      toast.success("Commercial ajouté");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Commerciaux"
        description="Équipe humaine qui reprend les prospects qualifiés"
        actions={
          canCreate && (
            <Button onClick={openCreate} className="gradient-primary shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Nouveau commercial
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const count = prospects.filter((p) => p.commercialId === c.id).length;
          const initials = c.nom
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("");
          return (
            <Card key={c.id} className="shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-lg font-semibold text-primary-foreground shadow-glow">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{c.nom}</div>
                        <Badge
                          variant="outline"
                          className={
                            c.actif
                              ? "mt-1 border-success/30 bg-success/15 text-success-foreground"
                              : "mt-1 border-muted-foreground/30 bg-muted"
                          }
                        >
                          {c.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      {(canUpdate || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canUpdate && (
                              <DropdownMenuItem onClick={() => openEdit(c)}>
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(c.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {c.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md bg-muted/50 p-2">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">Prospects</div>
                  </div>
                  <div className="rounded-md bg-primary/10 p-2">
                    <div className="text-lg font-semibold text-primary">{c.closingRate}%</div>
                    <div className="text-xs text-muted-foreground">Taux closing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le commercial" : "Nouveau commercial"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nom</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Taux de closing (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.closingRate}
                onChange={(e) => setForm({ ...form, closingRate: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="mb-0">Actif</Label>
              <Switch checked={form.actif} onCheckedChange={(v) => setForm({ ...form, actif: v })} />
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce commercial ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  remove(deleteId);
                  toast.success("Commercial supprimé");
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
