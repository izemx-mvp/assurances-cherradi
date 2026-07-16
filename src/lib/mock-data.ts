import type {
  AppUser,
  Campaign,
  Commercial,
  Conversation,
  Prospect,
} from "./types";
import { defaultSchedule } from "./types";

const campaignDefaults = {
  initialDelayHours: 0,
  betweenDelayHours: 72,
  schedule: defaultSchedule,
  targetMode: "product" as const,
};


export const seedCommerciaux: Commercial[] = [
  {
    id: "c1",
    nom: "Sarah Benali",
    email: "sarah.b@karim-assurances.fr",
    phone: "+33 6 12 34 56 78",
    actif: true,
    closingRate: 42,
  },
  {
    id: "c2",
    nom: "Yassine Tazi",
    email: "yassine.t@karim-assurances.fr",
    phone: "+33 6 22 45 67 89",
    actif: true,
    closingRate: 38,
  },
  {
    id: "c3",
    nom: "Léa Moreau",
    email: "lea.m@karim-assurances.fr",
    phone: "+33 6 33 56 78 90",
    actif: true,
    closingRate: 51,
  },
  {
    id: "c4",
    nom: "Karim Haddad",
    email: "karim.h@karim-assurances.fr",
    phone: "+33 6 44 67 89 01",
    actif: true,
    closingRate: 47,
  },
  {
    id: "c5",
    nom: "Thomas Dubois",
    email: "thomas.d@karim-assurances.fr",
    phone: "+33 6 55 78 90 12",
    actif: false,
    closingRate: 29,
  },
  {
    id: "c6",
    nom: "Amina Chraibi",
    email: "amina.c@karim-assurances.fr",
    phone: "+33 6 66 89 01 23",
    actif: true,
    closingRate: 44,
  },
];

export const seedUsers: AppUser[] = [
  { id: "u1", nom: "Karim Haddad", email: "karim@karim-assurances.fr", role: "admin", actif: true, lastLogin: "2026-07-16T09:12:00Z" },
  { id: "u2", nom: "Sarah Benali", email: "sarah.b@karim-assurances.fr", role: "manager", actif: true, lastLogin: "2026-07-15T18:30:00Z" },
  { id: "u3", nom: "Yassine Tazi", email: "yassine.t@karim-assurances.fr", role: "commercial", actif: true, lastLogin: "2026-07-16T08:05:00Z" },
  { id: "u4", nom: "Léa Moreau", email: "lea.m@karim-assurances.fr", role: "commercial", actif: true, lastLogin: "2026-07-14T14:22:00Z" },
  { id: "u5", nom: "Julien Petit", email: "julien.p@karim-assurances.fr", role: "viewer", actif: false, lastLogin: "2026-06-30T10:00:00Z" },
];

const products = ["Auto", "Habitation", "Santé", "Vie", "Pro", "Moto", "Voyage", "Emprunteur"] as const;
const sources = ["site", "meta_ads", "google_ads", "referral", "import"] as const;
const statuses = ["nouveau", "en_qualification", "qualifie", "converti", "perdu"] as const;
const firstNames = ["Amine", "Fatima", "Julien", "Sofia", "Mehdi", "Claire", "Nadia", "Antoine", "Rachid", "Emma", "Yanis", "Camille", "Ilias", "Manon", "Hugo", "Sarah", "Lucas", "Inès", "Nassim", "Chloé", "Karim", "Léa", "Omar", "Louise", "Ayoub"];
const lastNames = ["Benali", "Martin", "Bernard", "Alaoui", "Petit", "Dubois", "Chraibi", "Robert", "El Amrani", "Richard", "Bennani", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Garcia", "Roux", "Vincent", "Fournier", "Girard", "Bonnet", "Lopez", "Faure"];

export const seedProspects: Prospect[] = Array.from({ length: 25 }, (_, i) => {
  const prenom = firstNames[i % firstNames.length];
  const nom = lastNames[i % lastNames.length];
  const statut = statuses[i % statuses.length];
  return {
    id: `p${i + 1}`,
    prenom,
    nom,
    phone: `+33 6 ${String(10 + i).padStart(2, "0")} ${String(20 + i).padStart(2, "0")} ${String(30 + i).padStart(2, "0")} ${String(40 + i).padStart(2, "0")}`,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s/g, "")}@mail.fr`,
    source: sources[i % sources.length],
    produit: products[i % products.length],
    statut,
    score: 30 + ((i * 7) % 70),
    commercialId: i % 3 === 0 ? seedCommerciaux[i % seedCommerciaux.length].id : undefined,
    createdAt: new Date(Date.now() - i * 86400000 * 1.3).toISOString(),
    notes: i % 4 === 0 ? "Prospect à recontacter en priorité." : undefined,
  };
});

export const seedCampaigns: Campaign[] = [
  {
    id: "camp1",
    nom: "Devis Auto — Relance 3 étapes",
    produit: "Auto",
    status: "actif",
    noReply: false,
    stopOnClick: true,
    stopOnReply: true,
    steps: [
      { id: "s1", delayDays: 0, message: "Bonjour {{prenom}}, votre devis Auto Karim Assurances est prêt 🚗. Souhaitez-vous en discuter ?", buttons: ["Voir mon devis", "Être rappelé"] },
      { id: "s2", delayDays: 3, message: "{{prenom}}, votre devis expire dans 4 jours. Un conseiller peut vous accompagner.", buttons: ["Parler à un conseiller", "Plus tard"] },
      { id: "s3", delayDays: 7, message: "Dernière relance : votre offre à 42€/mois est encore valable aujourd'hui.", buttons: ["Souscrire", "Ne plus me rappeler"] },
    ],
    stats: { sent: 842, opened: 731, clicked: 214, converted: 58 },
  },
  {
    id: "camp2",
    nom: "Mutuelle Santé — Offre No-Reply",
    produit: "Santé",
    status: "actif",
    noReply: true,
    stopOnClick: true,
    stopOnReply: false,
    steps: [
      { id: "s1", delayDays: 0, message: "📣 Offre spéciale Mutuelle Santé — jusqu'à −25% la 1re année pour les nouveaux adhérents.", buttons: ["Simuler ma cotisation", "Ne plus me rappeler"] },
      { id: "s2", delayDays: 5, message: "Il vous reste 48h pour profiter de −25% sur votre mutuelle.", buttons: ["Je simule", "Désinscription"] },
    ],
    stats: { sent: 1250, opened: 980, clicked: 322, converted: 74 },
  },
  {
    id: "camp3",
    nom: "Habitation — Nurturing",
    produit: "Habitation",
    status: "actif",
    noReply: false,
    stopOnClick: false,
    stopOnReply: true,
    steps: [
      { id: "s1", delayDays: 0, message: "Bonjour {{prenom}} 🏠, voici votre estimation Habitation personnalisée.", buttons: ["Voir mon devis"] },
      { id: "s2", delayDays: 3, message: "{{prenom}}, votre devis Habitation est encore valable 7 jours.", buttons: ["Oui, m'appeler", "Plus tard", "Me désinscrire"] },
      { id: "s3", delayDays: 10, message: "Dernière chance pour votre offre Habitation.", buttons: ["Souscrire", "Non merci"] },
    ],
    stats: { sent: 512, opened: 402, clicked: 118, converted: 31 },
  },
  {
    id: "camp4",
    nom: "Assurance Emprunteur — Pro",
    produit: "Emprunteur",
    status: "pause",
    noReply: false,
    stopOnClick: true,
    stopOnReply: true,
    steps: [
      { id: "s1", delayDays: 0, message: "{{prenom}}, économisez jusqu'à 15 000€ en changeant d'assurance emprunteur.", buttons: ["Estimer mes économies"] },
    ],
    stats: { sent: 210, opened: 168, clicked: 47, converted: 12 },
  },
  {
    id: "camp5",
    nom: "Cross-sell Moto (clients Auto)",
    produit: "Moto",
    status: "brouillon",
    noReply: false,
    stopOnClick: true,
    stopOnReply: true,
    steps: [
      { id: "s1", delayDays: 0, message: "Cher client, en tant qu'assuré Auto, bénéficiez de −20% sur votre assurance Moto 🏍️", buttons: ["En savoir plus"] },
    ],
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
  },
];

const t = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const seedConversations: Conversation[] = [
  {
    id: "conv1",
    prospectId: "p1",
    campaignId: "camp1",
    handledBy: "humain",
    noReply: false,
    status: "qualifie",
    lastAt: t(11, 4),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Amine, je suis l'assistant de l'agence Karim Assurances 👋. Vous avez demandé un devis Auto sur notre formulaire. Puis-je vous poser 3 questions rapides ?", time: t(9, 12), read: true },
      { id: "m2", sender: "prospect", text: "Oui allez-y", time: t(9, 15), read: true },
      { id: "m3", sender: "ia", text: "Parfait. 1) Quel est le modèle et l'année de votre véhicule ?", time: t(9, 15), read: true },
      { id: "m4", sender: "prospect", text: "Peugeot 208, 2021", time: t(9, 17), read: true },
      { id: "m5", sender: "ia", text: "2) Usage principal : trajets quotidiens, professionnel, ou occasionnel ?", time: t(9, 17), read: true, buttons: ["Quotidien", "Pro", "Occasionnel"] },
      { id: "m6", sender: "prospect", text: "Quotidien", time: t(9, 19), read: true },
      { id: "m7", sender: "ia", text: "3) Bonus/malus actuel ?", time: t(9, 19), read: true },
      { id: "m8", sender: "prospect", text: "0.68", time: t(9, 22), read: true },
      { id: "m9", sender: "ia", text: "Merci ! Vous êtes éligible à notre formule Tous Risques à partir de 42 €/mois. Souhaitez-vous en parler avec un conseiller ?", time: t(9, 22), read: true, buttons: ["Être rappelé", "Voir le devis", "Ne plus me rappeler"] },
      { id: "m10", sender: "prospect", text: "Être rappelé", time: t(9, 24), read: true },
      { id: "m11", sender: "system", text: "— Reprise par Sarah Benali (Commercial) —", time: t(10, 30) },
      { id: "m12", sender: "humain", text: "Bonjour M. Benali, Sarah de Karim Assurances. Quel serait le meilleur créneau pour vous rappeler aujourd'hui ?", time: t(10, 32), read: true },
      { id: "m13", sender: "prospect", text: "Vers 17h ce serait parfait", time: t(11, 4), read: false },
    ],
  },
  {
    id: "conv2",
    prospectId: "p2",
    campaignId: "camp3",
    handledBy: "ia",
    noReply: false,
    status: "en_qualification",
    lastAt: t(14, 22),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Fatima, suite à votre visite sur notre page Assurance Habitation, voici votre estimation personnalisée 🏠", time: t(10, 0), read: true, buttons: ["Voir mon devis"] },
      { id: "m2", sender: "system", text: "Relance automatique — J+3", time: t(13, 0) },
      { id: "m3", sender: "ia", text: "Fatima, votre devis Habitation est encore valable 7 jours. Souhaitez-vous que je vous mette en relation avec un conseiller ?", time: t(13, 5), read: true, buttons: ["Oui, m'appeler", "Plus tard", "Me désinscrire"] },
      { id: "m4", sender: "prospect", text: "Plus tard", time: t(14, 22), read: true },
      { id: "m5", sender: "ia", text: "Bien noté, je reviendrai vers vous dans quelques jours 🙏", time: t(14, 22), read: false },
    ],
  },
  {
    id: "conv3",
    prospectId: "p3",
    campaignId: "camp2",
    handledBy: "ia",
    noReply: true,
    status: "nouveau",
    lastAt: t(8, 30),
    messages: [
      { id: "m1", sender: "ia", text: "📣 Offre spéciale Mutuelle Santé — jusqu'à −25 % la 1re année pour les nouveaux adhérents.", time: t(8, 30), read: true, buttons: ["Simuler ma cotisation", "Ne plus me rappeler"] },
    ],
  },
  {
    id: "conv4",
    prospectId: "p4",
    campaignId: "camp1",
    handledBy: "ia",
    noReply: false,
    status: "perdu",
    lastAt: t(15, 10),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Sofia, votre devis Auto est prêt 🚗", time: t(9, 0), read: true, buttons: ["Voir mon devis", "Être rappelé"] },
      { id: "m2", sender: "system", text: "Relance automatique — J+5", time: t(15, 0) },
      { id: "m3", sender: "ia", text: "Sofia, votre offre à 42€/mois expire aujourd'hui.", time: t(15, 5), read: true, buttons: ["Souscrire", "Ne plus me rappeler"] },
      { id: "m4", sender: "prospect", text: "Ne plus me rappeler", time: t(15, 9), read: true },
      { id: "m5", sender: "ia", text: "Bien reçu, vous ne recevrez plus de messages. Bonne journée 🙏", time: t(15, 10), read: true },
      { id: "m6", sender: "system", text: "Séquence arrêtée — désinscription", time: t(15, 10) },
    ],
  },
  {
    id: "conv5",
    prospectId: "p5",
    campaignId: "camp1",
    handledBy: "humain",
    noReply: false,
    status: "converti",
    lastAt: t(16, 45),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Mehdi, votre devis Auto est prêt 🚗", time: t(9, 0), read: true },
      { id: "m2", sender: "prospect", text: "Oui je suis intéressé", time: t(9, 30), read: true },
      { id: "m3", sender: "ia", text: "Super ! Quel véhicule souhaitez-vous assurer ?", time: t(9, 31), read: true },
      { id: "m4", sender: "prospect", text: "Renault Clio 5, 2023", time: t(9, 45), read: true },
      { id: "m5", sender: "system", text: "— Reprise par Yassine Tazi (Commercial) —", time: t(10, 0) },
      { id: "m6", sender: "humain", text: "Bonjour M. Bernard, je finalise votre contrat Auto. Pouvez-vous me confirmer votre email ?", time: t(10, 1), read: true },
      { id: "m7", sender: "prospect", text: "mehdi.bernard@mail.fr", time: t(10, 15), read: true },
      { id: "m8", sender: "humain", text: "Parfait, contrat envoyé à votre adresse. Signature électronique en 2 clics ✍️", time: t(10, 16), read: true },
      { id: "m9", sender: "prospect", text: "Signé ✅", time: t(16, 40), read: true },
      { id: "m10", sender: "humain", text: "Bienvenue chez Karim Assurances 🎉", time: t(16, 45), read: true },
    ],
  },
  {
    id: "conv6",
    prospectId: "p6",
    campaignId: "camp4",
    handledBy: "ia",
    noReply: false,
    status: "en_qualification",
    lastAt: t(11, 20),
    messages: [
      { id: "m1", sender: "ia", text: "Claire, économisez jusqu'à 15 000€ en changeant d'assurance emprunteur.", time: t(11, 0), read: true, buttons: ["Estimer mes économies"] },
      { id: "m2", sender: "prospect", text: "Comment ça marche ?", time: t(11, 15), read: true },
      { id: "m3", sender: "ia", text: "Je vous transfère à un conseiller spécialisé Emprunteur, un instant.", time: t(11, 20), read: false },
    ],
  },
  {
    id: "conv7",
    prospectId: "p7",
    campaignId: "camp3",
    handledBy: "ia",
    noReply: false,
    status: "qualifie",
    lastAt: t(13, 55),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Nadia 🏠, voici votre estimation Habitation.", time: t(12, 0), read: true, buttons: ["Voir mon devis"] },
      { id: "m2", sender: "prospect", text: "Voir mon devis", time: t(12, 30), read: true },
      { id: "m3", sender: "ia", text: "Superficie de votre logement ?", time: t(12, 31), read: true },
      { id: "m4", sender: "prospect", text: "78 m², appartement, Lyon 3e", time: t(12, 45), read: true },
      { id: "m5", sender: "ia", text: "Merci ! Formule Confort à 18€/mois. Souhaitez-vous être rappelée ?", time: t(12, 46), read: true, buttons: ["Oui", "Non"] },
      { id: "m6", sender: "prospect", text: "Oui", time: t(13, 55), read: false },
    ],
  },
  {
    id: "conv8",
    prospectId: "p8",
    campaignId: "camp2",
    handledBy: "ia",
    noReply: true,
    status: "nouveau",
    lastAt: t(7, 15),
    messages: [
      { id: "m1", sender: "ia", text: "📣 Offre spéciale Mutuelle Santé — jusqu'à −25% la 1re année.", time: t(7, 15), read: false, buttons: ["Simuler ma cotisation", "Ne plus me rappeler"] },
    ],
  },
  {
    id: "conv9",
    prospectId: "p9",
    campaignId: "camp1",
    handledBy: "ia",
    noReply: false,
    status: "nouveau",
    lastAt: t(10, 5),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Antoine 👋, votre devis Auto Karim Assurances est prêt 🚗.", time: t(10, 0), read: true, buttons: ["Voir mon devis", "Être rappelé"] },
      { id: "m2", sender: "prospect", text: "C'est combien ?", time: t(10, 5), read: false },
    ],
  },
  {
    id: "conv10",
    prospectId: "p10",
    campaignId: "camp3",
    handledBy: "ia",
    noReply: false,
    status: "en_qualification",
    lastAt: t(9, 40),
    messages: [
      { id: "m1", sender: "ia", text: "Bonjour Rachid 🏠, votre devis Habitation est prêt.", time: t(9, 30), read: true, buttons: ["Voir mon devis"] },
      { id: "m2", sender: "prospect", text: "Vous avez une agence près de Marseille ?", time: t(9, 40), read: false },
    ],
  },
  {
    id: "conv11",
    prospectId: "p11",
    campaignId: "camp1",
    handledBy: "humain",
    noReply: false,
    status: "qualifie",
    lastAt: t(14, 5),
    messages: [
      { id: "m1", sender: "ia", text: "Emma, votre devis Auto 🚗", time: t(9, 0), read: true },
      { id: "m2", sender: "prospect", text: "Intéressée", time: t(11, 0), read: true },
      { id: "m3", sender: "system", text: "— Reprise par Léa Moreau (Commercial) —", time: t(11, 5) },
      { id: "m4", sender: "humain", text: "Bonjour Emma, je vous accompagne pour finaliser votre contrat.", time: t(11, 6), read: true },
      { id: "m5", sender: "prospect", text: "Quels documents il vous faut ?", time: t(14, 5), read: false },
    ],
  },
  {
    id: "conv12",
    prospectId: "p12",
    campaignId: "camp1",
    handledBy: "ia",
    noReply: false,
    status: "perdu",
    lastAt: t(16, 0),
    messages: [
      { id: "m1", sender: "ia", text: "Yanis, votre devis Auto 🚗", time: t(9, 0), read: true },
      { id: "m2", sender: "system", text: "Relance J+3", time: t(12, 0) },
      { id: "m3", sender: "ia", text: "Yanis, souhaitez-vous en discuter ?", time: t(12, 1), read: true, buttons: ["Oui", "Non merci"] },
      { id: "m4", sender: "prospect", text: "Non merci", time: t(16, 0), read: true },
    ],
  },
];
