import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, MoreHorizontal, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import {
  allActions,
  allResources,
  can,
  resourceLabels,
  rolePermissions,
  roleLabels,
} from "@/lib/permissions";
import type { Action, AppUser, Resource, UserRole } from "@/lib/types";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

type FormState = Omit<AppUser, "id" | "lastLogin"> & {
  permissions: Partial<Record<Resource, Action[]>>;
};

const emptyForm = (): FormState => ({
  nom: "",
  email: "",
  role: "commercial",
  actif: true,
  permissions: rolePermissions("commercial"),
});

const roleStyles: Record<UserRole, string> = {
  admin: "border-primary/40 bg-primary/15 text-primary",
  manager: "border-info/30 bg-info/15 text-info-foreground",
  commercial: "border-success/30 bg-success/15 text-success-foreground",
  viewer: "border-muted-foreground/30 bg-muted",
};

function UsersPage() {
  const { items, create, update, remove } = useUsers();
  const { currentRole, overrides, loginAs } = useAuth();
  const navigate = useNavigate();
  const canCreate = can(currentRole, "users", "create", overrides);
  const canUpdate = can(currentRole, "users", "update", overrides);
  const canDelete = can(currentRole, "users", "delete", overrides);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };
  const openEdit = (u: AppUser) => {
    setEditing(u);
    setForm({
      nom: u.nom,
      email: u.email,
      role: u.role,
      actif: u.actif,
      permissions: u.permissions ?? rolePermissions(u.role),
    });
    setOpen(true);
  };

  const toggleAction = (resource: Resource, action: Action) => {
    setForm((prev) => {
      const cur = prev.permissions[resource] ?? [];
      const next = cur.includes(action)
        ? cur.filter((a) => a !== action)
        : [...cur, action];
      return { ...prev, permissions: { ...prev.permissions, [resource]: next } };
    });
  };

  const applyRolePreset = (role: UserRole) => {
    setForm((prev) => ({ ...prev, role, permissions: rolePermissions(role) }));
  };

  const submit = () => {
    if (!form.nom || !form.email) {
      toast.error("Nom et email requis");
      return;
    }
    const payload = { ...form };
    if (editing) {
      update(editing.id, payload);
      toast.success("Utilisateur mis à jour");
    } else {
      create(payload);
      toast.success("Utilisateur créé");
    }
    setOpen(false);
  };

  const handleLoginAs = (u: AppUser) => {
    loginAs(u);
    toast.success(`Connecté en tant que ${u.nom}`);
    navigate({ to: "/dashboard" });
  };

  if (!can(currentRole, "users", "read", overrides)) {
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
        title="Gestion des utilisateurs"
        description="Créez des comptes et contrôlez précisément les droits CRUD par interface"
        actions={
          canCreate && (
            <Button onClick={openCreate} className="gradient-primary shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Nouvel utilisateur
            </Button>
          )
        }
      />

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const perms = u.permissions ?? rolePermissions(u.role);
                const summary = allResources
                  .map((r) => `${resourceLabels[r]} (${(perms[r] ?? []).length})`)
                  .join(" · ");
                return (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{u.nom}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleStyles[u.role]}>
                        {roleLabels[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {summary}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLoginAs(u)}>
                            <LogIn className="mr-2 h-4 w-4" /> Connecter en tant que
                          </DropdownMenuItem>
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier / Permissions
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
            <DialogDescription>
              Définissez les droits CRUD par interface. Le rôle sert de préréglage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nom complet</Label>
                <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Rôle (préréglage)</Label>
                <Select value={form.role} onValueChange={(v) => applyRolePreset(v as UserRole)}>
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
              <div className="flex items-end justify-between rounded-lg border p-3">
                <Label className="mb-0">Compte actif</Label>
                <Switch checked={form.actif} onCheckedChange={(v) => setForm({ ...form, actif: v })} />
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Permissions CRUD par interface</div>
                  <div className="text-xs text-muted-foreground">
                    Cochez les actions autorisées pour cet utilisateur.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyRolePreset(form.role)}
                >
                  Réinitialiser au rôle
                </Button>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Interface</TableHead>
                      {allActions.map((a) => (
                        <TableHead key={a} className="text-center capitalize">
                          {a === "create"
                            ? "Créer"
                            : a === "read"
                              ? "Voir"
                              : a === "update"
                                ? "Modifier"
                                : "Supprimer"}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allResources.map((r) => (
                      <TableRow key={r}>
                        <TableCell className="font-medium">{resourceLabels[r]}</TableCell>
                        {allActions.map((a) => {
                          const checked = (form.permissions[r] ?? []).includes(a);
                          return (
                            <TableCell key={a} className="text-center">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleAction(r, a)}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
