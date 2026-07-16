export type ProspectStatus =
  | "nouveau"
  | "en_qualification"
  | "qualifie"
  | "converti"
  | "perdu";

export type ProspectSource = "site" | "meta_ads" | "google_ads" | "referral" | "import";

export interface Prospect {
  id: string;
  prenom: string;
  nom: string;
  phone: string;
  email?: string;
  source: ProspectSource;
  produit: "Auto" | "Habitation" | "Santé" | "Vie" | "Pro" | "Moto" | "Voyage" | "Emprunteur";
  statut: ProspectStatus;
  score: number;
  commercialId?: string;
  createdAt: string;
  notes?: string;
}

export type CampaignStatus = "actif" | "pause" | "brouillon";

export interface CampaignStep {
  id: string;
  delayDays: number;
  message: string;
  buttons: string[];
}

export type CampaignTargetMode = "all" | "product" | "manual";

export interface DailyWindow {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

// 0=Lundi ... 6=Dimanche
export type WeeklySchedule = Record<number, DailyWindow>;

export interface Campaign {
  id: string;
  nom: string;
  produit: string;
  status: CampaignStatus;
  noReply: boolean;
  stopOnClick: boolean;
  stopOnReply: boolean;
  steps: CampaignStep[];
  stats: { sent: number; opened: number; clicked: number; converted: number };
  // Timing
  initialDelayHours: number;   // délai avant le 1er message
  betweenDelayHours: number;   // délai par défaut entre chaque relance
  schedule: WeeklySchedule;    // jours + créneaux autorisés
  // Ciblage
  targetMode: CampaignTargetMode;
  targetProduct?: string;
  prospectIds?: string[];
}

export type Sender = "ia" | "prospect" | "humain" | "system";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  read?: boolean;
  buttons?: string[];
}

export interface Conversation {
  id: string;
  prospectId: string;
  campaignId?: string;
  handledBy: "ia" | "humain";
  noReply: boolean;
  status: ProspectStatus;
  messages: Message[];
  lastAt: string;
  assignedUserId?: string;
}

export interface Commercial {
  id: string;
  nom: string;
  email: string;
  phone: string;
  avatar?: string;
  actif: boolean;
  closingRate: number;
}

export type UserRole = "admin" | "manager" | "commercial" | "viewer";

export interface AppUser {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  lastLogin: string;
  permissions?: Partial<Record<Resource, Action[]>>;
}


export type Resource =
  | "prospects"
  | "campaigns"
  | "conversations"
  | "commerciaux"
  | "users";
export type Action = "create" | "read" | "update" | "delete";

export const defaultSchedule: WeeklySchedule = {
  0: { enabled: true, start: "09:00", end: "19:00" },
  1: { enabled: true, start: "09:00", end: "19:00" },
  2: { enabled: true, start: "09:00", end: "19:00" },
  3: { enabled: true, start: "09:00", end: "19:00" },
  4: { enabled: true, start: "09:00", end: "18:00" },
  5: { enabled: false, start: "10:00", end: "13:00" },
  6: { enabled: false, start: "10:00", end: "13:00" },
};

export const dayLabels: Record<number, string> = {
  0: "Lundi",
  1: "Mardi",
  2: "Mercredi",
  3: "Jeudi",
  4: "Vendredi",
  5: "Samedi",
  6: "Dimanche",
};
