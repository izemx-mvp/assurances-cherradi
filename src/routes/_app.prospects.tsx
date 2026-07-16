import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, UserCog, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, statusLabels } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommerciaux, useConversations, useProspects, useAuth } from "@/stores";
import { can } from "@/lib/permissions";
import type { Prospect, ProspectSource, ProspectStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/prospects")({
  component: ProspectsPage,
});

const emptyForm: Omit<Prospect, "id" | "createdAt"> = {
  prenom: "",
  nom: "",
  phone: "",
  email: "",
  source: "site",
  produit: "Auto",
  statut: "nouveau",
  score: 50,
  commercialId: undefined,
  notes: "",
};

const products = ["Auto", "Habitation", "Santé", "Vie", "Pro", "Moto", "Voyage", "Emprunteur"] as const;
const sourceLabels: Record<ProspectSource, string> = {
  site: "Site web",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  referral: "Recommandation",
  import: "Import",
};

function ProspectsPage() {
  const { items, create, update, remove } = useProspects();
  const commerciaux = useCommerciaux((s) => s.items);
  const conversations = useConversations((s) => s.items);
  const role = useAuth((s) => s.currentRole);
  const overrides = useAuth((s) => s.overrides);


  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCsvUpload = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("Fichier CSV vide");
        return;
      }
      const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
      const idx = (name: string) => headers.findIndex((h) => h === name || h.startsWith(name));
      const iPrenom = idx("prenom");
      const iNom = idx("nom");
      const iPhone = idx("phone") >= 0 ? idx("phone") : idx("telephone");
      const iEmail = idx("email");
      const iProduit = idx("produit");
      if (iPrenom < 0 || iNom < 0 || iPhone < 0) {
        toast.error("Colonnes requises : prenom, nom, phone");
        return;
      }
      let count = 0;
      for (let li = 1; li < lines.length; li++) {
        const cols = lines[li].split(/[,;]/).map((c) => c.trim());
        if (!cols[iPrenom] || !cols[iNom] || !cols[iPhone]) continue;
        create({
          prenom: cols[iPrenom],
          nom: cols[iNom],
          phone: cols[iPhone],
          email: iEmail >= 0 ? cols[iEmail] : "",
          source: "import",
          produit: (iProduit >= 0 && (products as readonly string[]).includes(cols[iProduit])
            ? cols[iProduit]
            : "Auto") as Prospect["produit"],
          statut: "nouveau",
          score: 50,
          commercialId: undefined,
          notes: "Import CSV",
        });
        count++;
      }
      toast.success(`${count} prospect(s) importé(s)`);
    } catch {
      toast.error("Erreur de lecture du fichier");
    }
    if (fileRef.current) fileRef.current.value = "";
  };


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      const matchQ =
        !q ||
        `${p.prenom} ${p.nom}`.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q);
      const matchS = statusFilter === "all" || p.statut === statusFilter;
      const matchSrc = sourceFilter === "all" || p.source === sourceFilter;
      return matchQ && matchS && matchSrc;
    });
  }, [items, search, statusFilter, sourceFilter]);

  const canCreate = can(role, "prospects", "create", overrides);
  const canUpdate = can(role, "prospects", "update", overrides);
  const canDelete = can(role, "prospects", "delete", overrides);


  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (p: Prospect) => {
    setEditing(p);
    setForm({
      prenom: p.prenom,
      nom: p.nom,
      phone: p.phone,
      email: p.email ?? "",
      source: p.source,
      produit: p.produit,
      statut: p.statut,
      score: p.score,
      commercialId: p.commercialId,
      notes: p.notes ?? "",
    });
    setFormOpen(true);
  };
  const submitForm = () => {
    if (!form.prenom || !form.nom || !form.phone) {
      toast.error("Prénom, nom et téléphone requis");
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success("Prospect mis à jour");
    } else {
      create(form);
      toast.success("Prospect créé");
    }
    setFormOpen(false);
  };

  const detail = detailsId ? items.find((p) => p.id === detailsId) : null;
  const detailConv = detail ? conversations.find((c) => c.prospectId === detail.id) : null;

  return (
    <div>
      <PageHeader
        title="Prospects"
        description="Gérez vos prospects, leur statut de qualification et leur commercial assigné"
        actions={
          canCreate && (
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCsvUpload(f);
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Importer CSV
              </Button>
              <Button onClick={openCreate} className="gradient-primary shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau prospect
              </Button>
            </div>
          )
        }
      />


      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, téléphone ou email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([k, l]) => (
                  <SelectItem key={k} value={k}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sources</SelectItem>
                {Object.entries(sourceLabels).map(([k, l]) => (
                  <SelectItem key={k} value={k}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Commercial</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const c = commerciaux.find((x) => x.id === p.commercialId);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {p.prenom} {p.nom}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.phone}</TableCell>
                      <TableCell>{p.produit}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sourceLabels[p.source]}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.statut} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary-glow"
                              style={{ width: `${p.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{p.score}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c ? c.nom : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailsId(p.id)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir détails
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                            )}
                            {canUpdate && (
                              <DropdownMenuItem onClick={() => setAssignId(p.id)}>
                                <UserCog className="mr-2 h-4 w-4" /> Assigner
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteId(p.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Aucun prospect ne correspond à vos filtres
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            {filtered.length} prospect{filtered.length > 1 ? "s" : ""} affiché
            {filtered.length > 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le prospect" : "Nouveau prospect"}</DialogTitle>
            <DialogDescription>
              Les informations seront synchronisées avec la fiche client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Prénom</Label>
              <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                placeholder="+33 6 …"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Produit</Label>
              <Select
                value={form.produit}
                onValueChange={(v) => setForm({ ...form, produit: v as Prospect["produit"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm({ ...form, source: v as ProspectSource })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) => setForm({ ...form, statut: v as ProspectStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Score</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitForm} className="gradient-primary">
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details sheet */}
      <Sheet open={!!detailsId} onOpenChange={(o) => !o && setDetailsId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {detail.prenom} {detail.nom}
                </SheetTitle>
                <SheetDescription>Fiche prospect et qualification</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-6">
                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">WhatsApp</div>
                    <div className="font-medium">{detail.phone}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{detail.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Produit</div>
                    <div className="font-medium">{detail.produit}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Source</div>
                    <div className="font-medium">{sourceLabels[detail.source]}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Statut</div>
                    <StatusBadge status={detail.statut} />
                  </div>
                  <div>
                    <div className="text-muted-foreground">Score</div>
                    <div className="font-medium">{detail.score}/100</div>
                  </div>
                </div>
                {detail.notes && (
                  <div className="rounded-lg border bg-warning/10 p-3 text-sm">
                    <div className="mb-1 font-medium">Notes</div>
                    <div className="text-muted-foreground">{detail.notes}</div>
                  </div>
                )}
                {detail.statut !== "nouveau" && (
                  <div>
                    <div className="mb-2 text-sm font-medium">
                      Questions & réponses de qualification
                    </div>
                    {(() => {
                      if (!detailConv) {
                        return (
                          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                            Aucune qualification enregistrée
                          </div>
                        );
                      }
                      const pairs: { q: string; a: string }[] = [];
                      const msgs = detailConv.messages;
                      for (let i = 0; i < msgs.length; i++) {
                        const m = msgs[i];
                        if ((m.sender === "ia" || m.sender === "humain") && m.text.includes("?")) {
                          const next = msgs.slice(i + 1).find((x) => x.sender === "prospect");
                          if (next) pairs.push({ q: m.text, a: next.text });
                        }
                      }
                      if (pairs.length === 0) {
                        return (
                          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                            Aucune question/réponse détectée
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-3 rounded-lg border p-3">
                          {pairs.map((p, idx) => (
                            <div key={idx} className="space-y-1 border-l-2 border-primary/40 pl-3">
                              <div className="text-xs font-medium text-foreground">
                                Q · {p.q}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                R · {p.a}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce prospect ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible dans ce prototype.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  remove(deleteId);
                  toast.success("Prospect supprimé");
                  setDeleteId(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign dialog */}
      <Dialog open={!!assignId} onOpenChange={(o) => !o && setAssignId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner à un commercial</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {commerciaux
              .filter((c) => c.actif)
              .map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  onClick={() => {
                    if (assignId) {
                      update(assignId, { commercialId: c.id });
                      toast.success(`Assigné à ${c.nom}`);
                      setAssignId(null);
                    }
                  }}
                >
                  <div>
                    <div className="font-medium">{c.nom}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Taux : {c.closingRate}%
                  </div>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
