# Backoffice "LeadFlow" — Karim / Assurances

A single-tenant admin portal (frontend only, mock data in-memory) to pilot the WhatsApp qualification + relance IA. No backend yet — every list is seeded with realistic mock data and CRUD mutates local state so every button visibly works.

## Brand & visual system

- **Product name:** LeadFlow Assurances
- **Icon/logo:** custom SVG — a shield outline (assurance) with a small chat bubble + spark inside (IA + WhatsApp). Used as sidebar logo AND `/favicon.svg` (replace favicon link in `__root.tsx`).
- **Palette (light-first, semantic tokens in `src/styles.css`, oklch):**
  - Primary: deep insurance blue with a glow variant
  - Accent: WhatsApp-inspired green for "qualifié"/success states
  - Warning amber, destructive red, neutral slate surfaces
  - Gradients (`--gradient-primary`, `--gradient-hero`) and shadows (`--shadow-elegant`, `--shadow-glow`) for cards & primary CTAs
- **Dark mode:** full token set in `.dark`, toggled by a header button (sun/moon). Persist choice in `localStorage` (read inside `useEffect` to avoid SSR mismatch). Default = light.
- **Effects:** subtle card hover-lift, gradient primary buttons, animated status pills, fade-in page transitions.

## Head / favicon

Update `src/routes/__root.tsx`: title "LeadFlow Assurances — Backoffice", real description, `og:*`, and `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`. Write the shield+bubble SVG to `public/favicon.svg`.

## Routes (TanStack Start, all under one layout)

```
src/routes/
  __root.tsx                 (updated head + favicon)
  index.tsx                  → redirect to /dashboard
  _app.tsx                   pathless layout: Sidebar + Header + <Outlet/>
  _app.dashboard.tsx
  _app.prospects.tsx
  _app.campaigns.tsx
  _app.conversations.tsx
  _app.commerciaux.tsx
  _app.users.tsx
```

`index.tsx` redirects to `/dashboard` (removes the placeholder). No auth gate — mock UI.

## Sidebar (shadcn Sidebar, collapsible="icon")

- Dashboard (LayoutDashboard)
- Prospects (Users)
- Campagnes de relance (Send)
- Conversations (MessageCircle)
- Commerciaux (Headset)
- Utilisateurs (ShieldUser) — role-gated

Active state via `useRouterState`. Logo + product name at top, user card + logout at bottom.

## Header

SidebarTrigger, breadcrumbs, global search, theme toggle (Sun/Moon), notifications bell, user avatar menu.

## Page details

### Dashboard
KPI cards (Prospects totaux, Qualifiés, Taux de conversion, Messages envoyés 7j), line chart of leads/semaine, bar chart of campaign performance, "Prospects récents" mini-table, "Relances programmées aujourd'hui" list.

### Prospects
- Table: Nom, Téléphone WhatsApp, Source, Statut (Nouveau / En qualification / Qualifié / Converti / Perdu), Score, Commercial assigné, Date, Actions.
- Toolbar: search (nom/téléphone), status filter, source filter, "Nouveau prospect" (Dialog).
- Row actions: **Voir détails** (Sheet with profile + WhatsApp timeline + qualification answers), **Modifier**, **Assigner à un commercial**, **Supprimer** (AlertDialog).
- Every mutation updates the Zustand store; toasts on every action.

### Campagnes de relance
- Card grid, each with status toggle (Actif/Pausé), stats.
- "Nouvelle campagne" dialog: nom, cible (segment), sequence builder — steps J+n with message body + variables (`{{prenom}}`, `{{produit}}`), interactive buttons ("Ne plus me rappeler", "Parler à un conseiller", lien devis). Toggle **Mode No-Reply**.
- Stop rules: on click / on reply / on unsubscribe.
- Edit / duplicate / delete / preview WhatsApp bubble.

### Conversations
- Two-pane layout: thread list (search + filter Nouveau/IA/Humain) on the left, chat view on the right with WhatsApp-style bubbles, quick actions **Transférer à un commercial**, **Marquer qualifié**, **Clore**. Composer disabled when the campaign is No-Reply, enabled after human takeover.
- **Mock conversation content matches the client's real use case (Assurances FR, WhatsApp)** — each thread is a coherent qualification + relance dialogue. Sample scripted flows (French, with timestamps, delivery/read ticks, and interactive buttons rendered as chips):

  **Thread 1 — Auto, prospect chaud (Qualifié)**
  - IA: « Bonjour {{prenom}}, je suis l'assistant de l'agence Karim Assurances 👋. Vous avez demandé un devis Auto sur notre formulaire. Puis-je vous poser 3 questions rapides ? »
  - Prospect: « Oui allez-y »
  - IA: « Parfait. 1) Quel est le modèle et l'année de votre véhicule ? »
  - Prospect: « Peugeot 208, 2021 »
  - IA: « 2) Usage principal : trajets quotidiens, professionnel, ou occasionnel ? » (boutons: Quotidien / Pro / Occasionnel)
  - Prospect *[clique Quotidien]*
  - IA: « 3) Bonus/malus actuel ? »
  - Prospect: « 0.68 »
  - IA: « Merci ! Vous êtes éligible à notre formule Tous Risques à partir de 42 €/mois. Souhaitez-vous en parler avec un conseiller ? » (boutons: Être rappelé / Voir le devis / Ne plus me rappeler)
  - Prospect *[clique Être rappelé]* → statut passe à **Qualifié**, badge « Transféré à Sarah B. »

  **Thread 2 — Habitation, relance J+3 (En qualification)**
  - IA (J+0): « Bonjour {{prenom}}, suite à votre visite sur notre page Assurance Habitation, voici votre estimation personnalisée 🏠 » + bouton *Voir mon devis*
  - IA (J+3, relance auto): « {{prenom}}, votre devis Habitation est encore valable 7 jours. Souhaitez-vous que je vous mette en relation avec un conseiller ? » (boutons: Oui, m'appeler / Plus tard / Me désinscrire)
  - Prospect *[clique Plus tard]* → séquence adaptée, prochaine relance J+10.

  **Thread 3 — Santé, No-Reply campagne (Nouveau)**
  - IA: « 📣 Offre spéciale Mutuelle Santé — jusqu'à −25 % la 1re année pour les nouveaux adhérents. » (boutons: Simuler ma cotisation / Ne plus me rappeler)
  - Bandeau chat: « Mode No-Reply — le prospect ne peut pas envoyer de texte libre ». Composer désactivé, tooltip explicatif.

  **Thread 4 — Auto, désinscription (Perdu)**
  - IA: relance J+5.
  - Prospect *[clique Ne plus me rappeler]* → IA: « Bien reçu, vous ne recevrez plus de messages. Bonne journée 🙏 ». Statut **Perdu / Désinscrit**, séquence stoppée automatiquement.

  **Thread 5 — Reprise humaine (Converti)**
  - IA qualifie, transfert à **Yassine T. (Commercial)**.
  - Séparateur « — Reprise par Yassine T. — »
  - Yassine: « Bonjour M. {{nom}}, je finalise votre contrat Auto. Pouvez-vous me confirmer votre email ? »
  - Prospect: fournit email → contrat envoyé → statut **Converti**.

  **Threads 6–12** couvrent Pro/RC pro, Emprunteur, Vie, Moto, Voyage, avec un mélange de statuts et de longueurs pour rendre l'UI vivante.

- Rendering rules: bubbles gauche/droite selon `sender` (`ia` / `prospect` / `humain`), horodatage sous chaque bulle, coches ✓/✓✓ pour envoyé/lu, chips cliquables pour les boutons interactifs (les cliques sont mockés — ils ajoutent une bulle système). Emojis rendus tels quels.

### Commerciaux
Cards with avatar, nom, prospects assignés, taux de closing. CRUD.

### Utilisateurs (gestion des utilisateurs)
- Table: Nom, Email, Rôle (Admin / Manager / Commercial / Viewer), Statut, Dernière connexion.
- CRUD dialogs.
- Per-role CRUD matrix in the auth store; sidebar items and page action buttons check `can(role, resource, action)`.
- "Current user" switcher previews role effects.

## State / data layer

- `src/lib/mock-data.ts` — seeded arrays: ~25 prospects, 5 campagnes, 12 conversations (scripts above), 6 commerciaux, 5 utilisateurs.
- `src/stores/` — Zustand stores (`useProspects`, `useCampaigns`, `useConversations`, `useUsers`, `useAuth`, `useTheme`) with typed CRUD actions.
- Toasts via `sonner`. Confirmations via `AlertDialog`.

## Access control (mock, client-side)

`useAuth` holds `currentUser` (defaults Admin). `permissions.ts` exports `can(role, resource, action)`. Buttons/menu items are hidden or disabled when not allowed. Note: UI-only gating; real security requires Lovable Cloud.

## Components to add

- `components/layout/AppSidebar.tsx`, `AppHeader.tsx`, `ThemeToggle.tsx`
- `components/prospects/*`, `components/campaigns/*`, `components/conversations/*` (ThreadList, ChatView, MessageBubble, InteractiveButtons, Composer), `components/users/*`
- `components/common/StatusBadge.tsx`, `PageHeader.tsx`, `EmptyState.tsx`, `Logo.tsx`

## Technical notes

- Tailwind v4 tokens in `src/styles.css` (`@theme inline` + `:root` / `.dark`). No hardcoded colors in components.
- Theme applied by toggling `.dark` on `<html>` inside a `useEffect`; initial value read from `localStorage` after mount.
- All navigation via `<Link to=...>`; every CRUD button wired to a store action + toast; filters/search are controlled inputs bound to derived selectors.

## Out of scope
No real WhatsApp API, no persistence across reloads (state resets to seed), no real auth. When ready, we can enable Lovable Cloud to persist data + add real auth, then wire the WhatsApp Business Cloud API.
