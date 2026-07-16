import { create } from "zustand";
import {
  seedCampaigns,
  seedCommerciaux,
  seedConversations,
  seedProspects,
  seedUsers,
} from "@/lib/mock-data";
import type {
  AppUser,
  Campaign,
  Commercial,
  Conversation,
  Message,
  Prospect,
  UserRole,
} from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ProspectsState {
  items: Prospect[];
  create: (p: Omit<Prospect, "id" | "createdAt">) => void;
  update: (id: string, patch: Partial<Prospect>) => void;
  remove: (id: string) => void;
}
export const useProspects = create<ProspectsState>((set) => ({
  items: seedProspects,
  create: (p) =>
    set((s) => ({
      items: [{ ...p, id: `p${uid()}`, createdAt: new Date().toISOString() }, ...s.items],
    })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
}));

interface CampaignsState {
  items: Campaign[];
  create: (c: Omit<Campaign, "id" | "stats">) => void;
  update: (id: string, patch: Partial<Campaign>) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
}
export const useCampaigns = create<CampaignsState>((set) => ({
  items: seedCampaigns,
  create: (c) =>
    set((s) => ({
      items: [
        { ...c, id: `camp${uid()}`, stats: { sent: 0, opened: 0, clicked: 0, converted: 0 } },
        ...s.items,
      ],
    })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  duplicate: (id) =>
    set((s) => {
      const src = s.items.find((it) => it.id === id);
      if (!src) return s;
      return {
        items: [
          { ...src, id: `camp${uid()}`, nom: `${src.nom} (copie)`, status: "brouillon" },
          ...s.items,
        ],
      };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
}));

interface ConversationsState {
  items: Conversation[];
  addMessage: (id: string, m: Omit<Message, "id" | "time">) => void;
  update: (id: string, patch: Partial<Conversation>) => void;
}
export const useConversations = create<ConversationsState>((set) => ({
  items: seedConversations,
  addMessage: (id, m) =>
    set((s) => ({
      items: s.items.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [...c.messages, { ...m, id: uid(), time: new Date().toISOString() }],
              lastAt: new Date().toISOString(),
            }
          : c,
      ),
    })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
}));

interface CommerciauxState {
  items: Commercial[];
  create: (c: Omit<Commercial, "id">) => void;
  update: (id: string, patch: Partial<Commercial>) => void;
  remove: (id: string) => void;
}
export const useCommerciaux = create<CommerciauxState>((set) => ({
  items: seedCommerciaux,
  create: (c) => set((s) => ({ items: [{ ...c, id: `c${uid()}` }, ...s.items] })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
}));

interface UsersState {
  items: AppUser[];
  create: (u: Omit<AppUser, "id" | "lastLogin">) => void;
  update: (id: string, patch: Partial<AppUser>) => void;
  remove: (id: string) => void;
}
export const useUsers = create<UsersState>((set) => ({
  items: seedUsers,
  create: (u) =>
    set((s) => ({
      items: [{ ...u, id: `u${uid()}`, lastLogin: new Date().toISOString() }, ...s.items],
    })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
}));

interface AuthState {
  currentRole: UserRole;
  currentName: string;
  setRole: (r: UserRole) => void;
}
export const useAuth = create<AuthState>((set) => ({
  currentRole: "admin",
  currentName: "Karim Haddad",
  setRole: (r) => set({ currentRole: r }),
}));
