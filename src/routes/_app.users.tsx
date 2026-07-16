import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { useAuth, useUsers } from "@/stores";
import { can, roleLabels } from "@/lib/permissions";
import type { AppUser, UserRole } from "@/lib/types";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

const empty: Omit<AppUser, "id" | "lastLogin"> = {
  nom: "",
  email: "",
  role: "commercial",
  actif: true,
};

const roleStyles: Record<UserRole, string> = {
  admin: "border-primary/40 bg-primary/15 text-primary",
  manager: "border-info/30 bg-info/15 text-info-foreground",
  commercial: "border-success/30 bg-success/15 text-success-foreground",
  viewer: "border-muted-foreground/30 bg-muted",
};

function UsersPage() {
  const { items, create, update, remove } = useUsers();
  const { currentRole, setRole } = useAuth();
  const canCreate = can(currentRole, "users", "create");
  const canUpdate = can(currentRole, "users", "update");
  const canDelete = can(currentRole, "users", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (u: AppUser) => {
    setEditing(u);
    setForm({ nom: u.nom, email: u.email, role: u.role, actif: u.actif });
    setOpen(true);
  };
  const submit = () => {
    if (!form.nom || !form.email) {
      toast.error("Nom et email requis");
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success("Utilisateur mis à jour");
    } else {
      create(form);
      toast.success("Utilisateur créé");
    }
    setOpen(false);
  };

  if (!can(currentRole, "users", "read")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="mb-3 h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Accès restreint</h2>
        <p className="text-sm text-muted-foreground">
          Votre rôle actuel n'a pas accès à la gestion des utilisateurs.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gérez les accès et les rôles du backoffice"
        actions={
          canCreate && (
            <Button onClick={openCreate} className="gradient-primary shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Nouvel utilisateur
            </Button>
          )
        }
      />

      <Card className="mb-4 border-primary/30 bg-primary/5 shadow-card">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Aperçu des rôles (démo)</div>
            <div className="text-xs text-muted-foreground">
              Changez votre rôle pour voir les permissions CRUD appliquées à la sidebar et aux actions.
            </div>
          </div>
          <Select value={currentRole} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["admin", "manager", "commercial", "viewer"] as UserRole[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {roleLabels[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{u.nom}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleStyles[u.role]}>
                      {roleLabels[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.actif
                          ? "border-success/30 bg-success/15 text-success-foreground"
                          : "border-muted-foreground/30 bg-muted"
                      }
                    >
                      {u.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.lastLogin).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {(canUpdate || canDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(u.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
            <DialogDescription>
              Chaque rôle contrôle les droits CRUD sur les interfaces du backoffice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Nom complet</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["admin", "manager", "commercial", "viewer"] as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="mb-0">Compte actif</Label>
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
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  remove(deleteId);
                  toast.success("Utilisateur supprimé");
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
