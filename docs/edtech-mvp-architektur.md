# EdTech-Plattform: Technische Architektur für MVP und Skalierung

**Kontext:** Selbstlernkurse für Kinder — Lektionen, Aufgaben, Projekte, Fortschrittsanzeigen, optional Hardware-Anleitungen (Raspberry Pi). Ziel des MVP: schnell und kostengünstig validieren, ob Kinder (und zahlende Eltern) das Angebot annehmen. Später: weitere Zielgruppen, Kurse, Automatisierungen, KI-Unterstützung.

**Leitprinzip:** Im MVP wird *Lernen validiert, nicht Software gebaut*. Alles, was nicht direkt die Kernhypothese testet („Kinder arbeiten Kurse selbstständig durch und Eltern zahlen dafür"), wird gekauft, geklickt oder manuell erledigt.

---

## 1. MVP-Architektur

### Drei Optionen im Vergleich

| Ansatz | Time-to-Market | Kosten/Monat | Wann sinnvoll |
|---|---|---|---|
| **A: No-Code/Low-Code** | 1–2 Wochen | ~30–100 € | Erste 10–50 zahlende Kunden, reine Validierung |
| **B: Einfache Eigenentwicklung** | 4–8 Wochen | ~20–50 € | Validierung erfolgreich, Produkt-Differenzierung nötig (Kind-UI, Fortschritt, Interaktivität) |
| **C: Skalierbare Plattform** | 4–6 Monate | 500 €+ | Erst ab nachgewiesenem Product-Market-Fit, >1.000 aktive Nutzer |

**Empfehlung: Mit A starten, B vorbereiten, C bewusst verschieben.**

- **Phase A (jetzt, Woche 1–4):** Kursinhalte auf einer fertigen Kursplattform (z. B. LearnWorlds, Teachable oder selbst gehostetes LearnDash/Moodle — für Kinder-UX am ehesten LearnWorlds) plus Zahlungsabwicklung über die Plattform oder Stripe Payment Links. Landing Page mit Framer/Webflow oder einer simplen statischen Seite. Ziel: 10–20 zahlende Familien, qualitatives Feedback.
- **Phase B (nach Validierung, Monat 2–4):** Eigene schlanke Web-App (siehe Tech-Stack unten), weil Kinder-Lern-UX (große Buttons, wenig Text, Gamification, Elternansicht) auf Standard-Kursplattformen schnell an Grenzen stößt und die Marge nicht an eine Plattform abfließen soll.
- **Phase C (bei Wachstum):** Evolutionär aus B heraus skalieren — kein Rewrite, sondern gezieltes Herauslösen (siehe Abschnitt 7).

### MVP-Systembild (Phase B)

```
[Browser: Kind / Eltern / Admin]
        │
        ▼
[Next.js Monolith auf Vercel o. Hetzner]
  ├─ Kurs-/Lektionsanzeige (statisch generiert aus Markdown/MDX)
  ├─ Auth & Rollen (Eltern-Account + Kind-Profile)
  ├─ Fortschritts-API
  └─ Admin: Content-Preview
        │
        ▼
[PostgreSQL (Supabase/Neon)]     [Objektspeicher: Bilder/Videos → Cloudflare R2 + Stream]
        │
[Stripe: Abos/Einmalkauf]        [E-Mail: Resend/Postmark]
```

Ein einziges deploybares Artefakt, eine Datenbank, keine Microservices, keine Queues. Kursinhalte liegen als MDX-Dateien im Git-Repo — das ist im MVP das CMS (Review via Pull Request, Versionierung gratis).

---

## 2. Empfohlener Tech-Stack (Phase B)

| Schicht | Empfehlung | Begründung |
|---|---|---|
| Frontend + Backend | **Next.js (React, TypeScript)** als Monolith | Eine Codebasis, riesiges Ökosystem, leicht Entwickler zu finden; SSG für Lektionen = schnell und günstig |
| UI | Tailwind CSS + shadcn/ui, kindgerechtes Theme | Schnelle, konsistente UI ohne Designer-Engpass |
| Inhalte | **MDX im Git-Repo** (Lektionen, Aufgaben, Pi-Anleitungen) | Kein CMS-Betrieb, Autoren schreiben Markdown, interaktive Komponenten (Quiz, Checkliste) einbettbar |
| Datenbank | **PostgreSQL** (Supabase oder Neon, EU-Region) | Relational passt zum Datenmodell; Supabase liefert Auth + Row Level Security mit |
| Auth | Supabase Auth oder Auth.js — **E-Mail nur beim Elternkonto** | Kind-Profile ohne eigene E-Mail (DSGVO/COPPA-freundlich) |
| Zahlungen | **Stripe** (Subscriptions + Customer Portal) | Abos, Rechnungen, SEPA, Elternportal — nichts selbst bauen |
| Video | Cloudflare Stream oder Mux; im MVP notfalls unlisted Vimeo | Kein YouTube einbetten (Tracking/Werbung bei Kindern problematisch) |
| E-Mail | Resend oder Postmark | Transaktional (Verifizierung, Wochenreport an Eltern) |
| Hosting | Vercel (schnellster Start) oder Hetzner + Coolify (EU, günstig, volle Kontrolle) | Bei starkem Datenschutzfokus: Hetzner, alles in DE/EU |
| Analytics | Plausible oder PostHog EU | Cookielos bzw. EU-gehostet — bei Kindern Pflicht, kein Google Analytics |
| Fehler-Monitoring | Sentry (EU-Region) | Früh einbauen, minimaler Aufwand |

**Bewusst NICHT im MVP:** eigene Mobile-App (responsive Web reicht), Microservices, Kubernetes, eigenes CMS, Echtzeit-Features, eigene Videoplattform, KI-Features.

---

## 3. Kernmodule

1. **Katalog & Kursanzeige** — Kursübersicht, Lektionsseiten aus MDX, eingebettete Videos, Pi-Anleitungen mit Schritt-Checklisten und Material-/Teileliste.
2. **Lern-Player** — kindgerechte Navigation („Weiter"-Button, Lesefortschritt), Aufgaben-Widgets (Multiple Choice, Checkliste „Ich hab's gebaut", Foto-Upload fürs Projekt), sofortiges visuelles Feedback.
3. **Fortschritt & Gamification (leicht)** — abgehakte Lektionen, Fortschrittsbalken pro Kurs, einfache Badges. Keine Ranglisten (Vergleichsdruck bei Kindern, zusätzliche Datenschutzfragen).
4. **Konten & Rollen** — Elternkonto (E-Mail, Zahlung, Einwilligungen) mit 1–n Kind-Profilen (Anzeigename + Avatar, PIN-freier Profilwechsel wie bei Streaming-Diensten).
5. **Eltern-Dashboard** — Fortschritt der Kinder, Aboverwaltung (Stripe Portal), Einwilligungen, Datenexport/-löschung.
6. **Billing** — Stripe Checkout + Webhooks (`checkout.session.completed`, `customer.subscription.deleted` → Zugriff schalten).
7. **Admin (minimal)** — Nutzer suchen, Zugriff manuell schalten, Fortschritt zurücksetzen. Kein Content-Admin nötig, da Inhalte in Git liegen.

---

## 4. Datenmodell (grob)

```
Account (Elternkonto)
  id, email, password_hash/oauth, stripe_customer_id,
  consent_terms_at, consent_child_data_at, created_at

ChildProfile
  id, account_id → Account, display_name (Spitzname!), avatar, birth_year (nur Jahr)

Course
  id, slug, title, age_range, status
Lesson
  id, course_id → Course, slug, order, title, content_ref (MDX-Pfad), type (lesson|task|project|hw_guide)

Enrollment
  id, account_id, child_profile_id, course_id, source (purchase|trial|manual), started_at

LessonProgress
  id, child_profile_id, lesson_id, status (open|in_progress|done), completed_at
TaskSubmission
  id, child_profile_id, lesson_id, payload (JSON: Antworten), media_url?, created_at

Subscription
  id, account_id, stripe_subscription_id, plan, status, current_period_end

Badge / ChildBadge (optional, Phase B+)
```

Grundsätze: **Datenminimierung beim Kind** (kein Klarname, keine E-Mail, kein exaktes Geburtsdatum), Kursstruktur referenziert Inhalte nur (Inhalte selbst in Git/MDX), Fortschritt hängt am Kind-Profil, Vertrag/Zahlung am Elternkonto.

**Rollen:** `parent` (Standard), `child` (abgeleitet: eingeloggtes Elternkonto + aktives Kind-Profil, eingeschränkte Sicht), `admin`, später `author` und ggf. `teacher/school`.

---

## 5. Automatisierungspotenziale

**Sofort automatisieren (billig, hoher Hebel):**
- Zugriff nach Kauf freischalten (Stripe-Webhook) — nie manuell Konten schalten.
- Transaktionale E-Mails: Kaufbestätigung, Passwort-Reset, „Kurs abgeschlossen 🎉".
- Content-Pipeline: Git-Push → CI (Linkcheck, MDX-Validierung) → Deploy.
- Wöchentlicher Eltern-Report per E-Mail (ein Cronjob, ein Template) — starker Retention-Hebel.

**Später automatisieren:**
- Onboarding-/Reaktivierungs-Sequenzen (nach 7 Tagen Inaktivität), Churn-Signale aus Fortschrittsdaten.
- Feedback-Auswertung, Support-Vorsortierung.

**KI (bewusst Phase C):** Lern-Tutor/Erklär-Chat für Kinder, automatisches Feedback auf Projekt-Einreichungen, Autoren-Assistenz (Aufgaben-Varianten, Differenzierung nach Alter). Bei Kind-gerichteter KI: strenge Guardrails, Eltern-Einwilligung, Protokollierung — deshalb erst nach PMF.

---

## 6. Datenschutz, Kinderkonten, Elternzugang

Das ist bei dieser Zielgruppe **kein Nice-to-have, sondern Produktkern und Kaufargument für Eltern.**

**Rechtsrahmen (DSGVO, insb. Art. 8):** Einwilligung in Datenverarbeitung bei Kindern unter 16 (DE; andere EU-Länder teils 13–15) nur mit Zustimmung der Eltern. Konsequenz für die Architektur:

1. **Vertragspartner ist immer das Elternteil.** Registrierung, E-Mail, Zahlung, Einwilligungen laufen ausschließlich über das Elternkonto. Kinder haben Profile, keine Konten.
2. **Datenminimierung beim Kind:** Spitzname statt Klarname, Geburtsjahr statt Geburtsdatum, keine E-Mail/Telefonnummer, kein freies Profilbild (Avatar-Auswahl statt Upload).
3. **Vorsicht bei User-Generated Content:** Foto-Uploads von Projekten sind wertvoll, aber riskant (Kinder fotografieren sich selbst mit). MVP-Lösung: Uploads nur im Eltern-Dashboard sichtbar, niemals öffentlich, keine Community-Galerie. Community-Features komplett auf später verschieben.
4. **Keine Third-Party-Tracker im Kind-Bereich:** kein Google Analytics, keine Werbepixel, kein YouTube-Embed. Plausible/PostHog EU, Videos über Cloudflare Stream/Mux.
5. **EU-Hosting & AVV:** Alle Anbieter mit EU-Region wählen (Supabase EU, Hetzner, Sentry EU), Auftragsverarbeitungsverträge sammeln, Verarbeitungsverzeichnis früh anlegen.
6. **Elternrechte als Feature:** Datenexport und Konto-/Profil-Löschung (Cascade über `child_profile_id`) von Anfang an einbauen — nachträglich ist das teuer.
7. **Sicherheits-Basics:** Row Level Security bzw. konsequente Autorisierung pro Account, Rate Limiting auf Auth, Passwort-Hashing (argon2/bcrypt), Backups mit Test-Restore, Sentry ohne PII.

**Risikoliste (Top 5):** (1) Kind-PII ohne Elterneinwilligung erfasst → Bußgeld + Vertrauensverlust; (2) öffentliche Kinderfotos; (3) Tracking-Skripte im Kind-Bereich; (4) US-Datentransfers ohne Grundlage; (5) fehlende Löschkonzepte.

---

## 7. Skalierungsarchitektur (Phase C, Skizze)

Evolution statt Rewrite — der Monolith bleibt Kern, herausgelöst wird nur, was nachweislich klemmt:

```
[Web-App]   [Mobile-App später]   [Partner-/Schul-API]
      \           |                    /
       └────── API-Gateway / BFF ─────┘
                    │
   ┌────────────────┼──────────────────────┐
   │ Kern-Monolith  │  Herausgelöste Dienste│
   │ (Kurse, Konten,│  - Content-Service +  │
   │  Fortschritt)  │    Headless CMS       │
   │                │  - Billing-Service    │
   │                │  - Notification-Svc   │
   │                │  - KI-Tutor-Service   │
   └────────────────┴──────────────────────┘
          │                   │
   [PostgreSQL, read replicas] [Event-Bus (z. B. SQS/NATS): lesson.completed, subscription.changed]
          │
   [Analytics-Pipeline → Warehouse (z. B. BigQuery/ClickHouse) für Lern-Analytik]
```

Konkrete Skalierungsschritte, jeweils **erst bei realem Bedarf**:
- **Content:** MDX-in-Git → Headless CMS (Payload/Strapi/Sanity), wenn nicht-technische Autoren und Übersetzungen dazukommen.
- **Events:** Fortschritts-Events auf einen Event-Bus, sobald mehrere Konsumenten existieren (Gamification, Reports, KI, Analytics).
- **Mandantenfähigkeit:** `organization_id` (Schulen, Kursanbieter) früh im Datenmodell vorsehen, auch wenn ungenutzt.
- **KI-Schicht:** eigener Service mit Prompt-/Guardrail-Verwaltung, Protokollierung und Kostenkontrolle; Modelle austauschbar halten.
- **Mehrsprachigkeit/i18n:** ab erstem nicht-deutschem Markt.

---

## 8. Build-vs.-Manual-Empfehlung

**Jetzt bauen (differenzierend oder gefährlich, wenn falsch):**
- Kind-Profile unter Elternkonto + Einwilligungs-Flow (Datenschutz-Fundament, kaum nachrüstbar).
- Lern-Player mit Fortschritt (das ist das Produkt).
- Stripe-Integration inkl. Webhook-Freischaltung.
- MDX-Content-Pipeline (Autoren-Workflow über Git).
- Löschung/Export von Kinderdaten.

**Kaufen / Dienste nutzen (Commodity):**
- Auth, Zahlungen, Video-Hosting, E-Mail-Versand, Analytics, Monitoring, Hosting — alles Managed Services, nichts davon selbst betreiben.

**Manuell lösen (bis es weh tut):**
- Support & Rückerstattungen: persönliche E-Mail — im MVP sogar ein Vorteil (direktes Feedback).
- Onboarding neuer Kurse/Autoren: von Hand ins Repo, kein Autoren-Portal.
- Feedback auf Projekt-Einreichungen: der Gründer antwortet persönlich („Concierge-MVP" — begeistert Familien und liefert Erkenntnisse für spätere KI-Automatisierung).
- Reporting: SQL-Abfragen von Hand statt Admin-Dashboards.
- Schul-/B2B-Anfragen: manuell per Angebot, keine Mandantenfähigkeit bauen.

**Explizit NICHT bauen im MVP:** Mobile-Apps, Community/Forum, Ranglisten, eigenes CMS, KI-Tutor, Zertifikats-Generator, A/B-Testing-Infrastruktur, Microservices.

---

### Faustregel für jede weitere Entscheidung

> Baue nur, was (a) die Lernerfahrung der Kinder direkt verbessert oder (b) rechtlich zwingend ist. Alles andere: kaufen, klicken oder von Hand machen — bis die manuelle Arbeit mehr als einen Tag pro Woche kostet.
