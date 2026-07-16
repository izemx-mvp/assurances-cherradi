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
}

export type Resource =
  | "prospects"
  | "campaigns"
  | "conversations"
  | "commerciaux"
  | "users";
export type Action = "create" | "read" | "update" | "delete";
