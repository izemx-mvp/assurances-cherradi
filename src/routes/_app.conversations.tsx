import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, CheckCheck, Search, Send, UserCheck, UserPlus, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCommerciaux, useConversations, useProspects } from "@/stores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/conversations")({
  component: ConversationsPage,
});

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function ConversationsPage() {
  const { items, addMessage, update } = useConversations();
  const prospects = useProspects((s) => s.items);
  const updateProspect = useProspects((s) => s.update);
  const commerciaux = useCommerciaux((s) => s.items);

  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [composerText, setComposerText] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      const p = prospects.find((x) => x.id === c.prospectId);
      const name = p ? `${p.prenom} ${p.nom}`.toLowerCase() : "";
      const matchQ = !q || name.includes(q);
      const matchF =
        filter === "all" ||
        (filter === "ia" && c.handledBy === "ia") ||
        (filter === "humain" && c.handledBy === "humain") ||
        (filter === "nouveau" && c.status === "nouveau");
      return matchQ && matchF;
    });
  }, [items, prospects, search, filter]);

  const active = items.find((c) => c.id === activeId);
  const activeProspect = active ? prospects.find((p) => p.id === active.prospectId) : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const send = () => {
    if (!active || !composerText.trim()) return;
    addMessage(active.id, { sender: "humain", text: composerText.trim(), read: false });
    setComposerText("");
  };

  const handleButton = (btn: string) => {
    if (!active) return;
    addMessage(active.id, { sender: "prospect", text: btn, read: true });
    setTimeout(() => {
      addMessage(active.id, {
        sender: "ia",
        text: `Bien reçu : "${btn}". Je transmets à un conseiller si nécessaire 🙏`,
        read: false,
      });
    }, 400);
  };

  const isClosed = active ? active.status === "perdu" || active.status === "converti" : false;
  const composerDisabled = active ? isClosed || (active.noReply && active.handledBy === "ia") : true;

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="Suivi et prise en main des dialogues WhatsApp IA / conseillers"
      />

      <Card className="shadow-card overflow-hidden">
        <div className="grid h-[calc(100vh-14rem)] grid-cols-1 md:grid-cols-[320px_1fr]">
          {/* Threads list */}
          <div className="flex flex-col border-r">
            <div className="space-y-2 border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="nouveau">Nouveaux</SelectItem>
                  <SelectItem value="ia">Gérées par l'IA</SelectItem>
                  <SelectItem value="humain">Reprises humaines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.map((c) => {
                const p = prospects.find((x) => x.id === c.prospectId);
                const last = c.messages[c.messages.length - 1];
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b px-3 py-3 text-left transition-colors hover:bg-muted/60",
                      isActive && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium">
                        {p ? `${p.prenom} ${p.nom}` : "Prospect inconnu"}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatTime(c.lastAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={c.status} />
                      {c.handledBy === "humain" && (
                        <Badge variant="outline" className="border-accent/30 bg-accent/15">
                          Humain
                        </Badge>
                      )}
                      {c.noReply && (
                        <Badge variant="outline" className="border-info/30 bg-info/15">
                          No-Reply
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {last?.sender === "prospect" ? "" : "→ "}{last?.text}
                    </div>
                  </button>
                );
              })}
              {filteredThreads.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Aucune conversation
                </div>
              )}
            </div>
          </div>

          {/* Chat view */}
          <div className="flex min-w-0 flex-col">
            {active && activeProspect ? (
              <>
                <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {activeProspect.prenom} {activeProspect.nom}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {activeProspect.phone} · {activeProspect.produit}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssignOpen(true)}
                    >
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Transférer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        update(active.id, { status: "qualifie" });
                        updateProspect(active.prospectId, { statut: "qualifie" });
                        toast.success("Marqué qualifié");
                      }}
                    >
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Qualifié
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        update(active.id, { status: "perdu" });
                        updateProspect(active.prospectId, { statut: "perdu" });
                        toast("Conversation clôturée");
                      }}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Clore
                    </Button>
                  </div>
                </div>

                {isClosed && (
                  <div className="border-b bg-muted px-4 py-2 text-xs text-muted-foreground">
                    Ticket clôturé ({active.status === "converti" ? "Converti" : "Perdu"}) — lecture seule, historique uniquement.
                  </div>
                )}
                {!isClosed && active.noReply && (
                  <div className="border-b bg-info/10 px-4 py-2 text-xs text-info-foreground">
                    Mode No-Reply — le prospect ne peut pas envoyer de texte libre, uniquement les boutons.
                  </div>
                )}

                <div
                  ref={scrollRef}
                  className="flex-1 space-y-2 overflow-y-auto bg-[oklch(0.97_0.005_155)] p-4 dark:bg-[oklch(0.18_0.02_155)]"
                >
                  {active.messages.map((m) => {
                    if (m.sender === "system") {
                      return (
                        <div key={m.id} className="my-2 text-center text-[11px] text-muted-foreground">
                          <span className="rounded-full bg-muted px-3 py-1">{m.text}</span>
                        </div>
                      );
                    }
                    const isOut = m.sender === "ia" || m.sender === "humain";
                    return (
                      <div key={m.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                            isOut
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-card",
                          )}
                        >
                          <div className="whitespace-pre-wrap">{m.text}</div>
                          {m.buttons && m.buttons.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {m.buttons.map((b) => (
                                <button
                                  key={b}
                                  onClick={() => handleButton(b)}
                                  className={cn(
                                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                                    isOut
                                      ? "border-primary-foreground/40 bg-primary-foreground/10 hover:bg-primary-foreground/20"
                                      : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                                  )}
                                >
                                  {b}
                                </button>
                              ))}
                            </div>
                          )}
                          <div
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-[10px]",
                              isOut ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            <span>{formatTime(m.time)}</span>
                            {isOut && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t bg-background p-3">
                  <div className="flex items-end gap-2">
                    <Textarea
                      rows={1}
                      placeholder={
                        isClosed
                          ? "Ticket clôturé — envoi de messages désactivé"
                          : composerDisabled
                            ? "Composer désactivé — campagne No-Reply gérée par l'IA"
                            : "Écrire un message…"
                      }
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      disabled={composerDisabled}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      className="min-h-10 resize-none"
                    />
                    <Button onClick={send} disabled={composerDisabled || !composerText.trim()} className="gradient-primary">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Sélectionnez une conversation
              </div>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transférer à un commercial</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {commerciaux
              .filter((c) => c.actif)
              .map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted"
                  onClick={() => {
                    if (!active) return;
                    update(active.id, { handledBy: "humain" });
                    addMessage(active.id, {
                      sender: "system",
                      text: `— Reprise par ${c.nom} (Commercial) —`,
                    });
                    if (activeProspect) {
                      updateProspect(activeProspect.id, { commercialId: c.id });
                    }
                    setAssignOpen(false);
                    toast.success(`Transféré à ${c.nom}`);
                  }}
                >
                  <div>
                    <div className="font-medium">{c.nom}</div>
                    <div className="text-xs text-muted-foreground">Taux : {c.closingRate}%</div>
                  </div>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
