# Roadmap: Phase A (Validierung) und Phase B (Eigenentwicklung)

Ergänzung zu [`edtech-mvp-architektur.md`](./edtech-mvp-architektur.md). Annahme: ein Gründer mit Entwicklungserfahrung (oder Gründer + 1 Entwickler), Teilzeit bis Vollzeit. Zeitangaben sind Kalenderwochen ab Start; bei reinem Nebenprojekt-Tempo verdoppeln.

**Grundregel:** Jede Phase endet mit einem **Gate** — einer bewussten Go/No-Go-Entscheidung anhand vorher festgelegter Kriterien. Ohne bestandenes Gate wird nicht weitergebaut.

---

## Phase A — Validierung mit No-Code (Woche 1–6)

**Ziel:** Beweisen, dass Kinder einen Kurs selbstständig durcharbeiten und Eltern dafür zahlen. Kein eigener Code außer ggf. Landing Page.

### Meilenstein A1 — Angebot steht (Ende Woche 1)

- [ ] Kernhypothese schriftlich fixiert (Zielgruppe, Alter, Kursthema, Preis) inkl. Abbruchkriterien
- [ ] Ein (!) Pilotkurs ausgewählt und grob strukturiert: 6–10 Lektionen, 1 Abschlussprojekt (bei Pi-Kurs: Teileliste mit Bestell-Links)
- [ ] Landing Page live (Framer/Webflow/Carrd): Versprechen, Preis, Warteliste/Kauf-Button
- [ ] Impressum, Datenschutzerklärung, AGB (Vorlagen + kurze Prüfung)

**Gate A1:** Landing Page erklärt das Angebot so, dass ein fremdes Elternteil es in 30 Sekunden versteht (mit 3 Eltern getestet).

### Meilenstein A2 — Kurs kaufbar und durchlaufbar (Ende Woche 3)

- [ ] Kursplattform eingerichtet (z. B. LearnWorlds), Pilotkurs vollständig eingepflegt
- [ ] Videos produziert oder bewusst ersetzt (Screencasts/bebilderte Anleitungen reichen im Pilot)
- [ ] Zahlung live: Stripe Payment Link oder Plattform-Checkout, inkl. Kaufbestätigungs-Mail
- [ ] Kompletter Testdurchlauf mit 1–2 „befreundeten" Kindern; Stolperstellen behoben
- [ ] Manuelles Onboarding definiert: Wer kauft, bekommt binnen 24 h persönliche Willkommens-Mail

**Gate A2:** Ein Kind der Zielaltersgruppe schafft Lektion 1–3 ohne Hilfe eines Erwachsenen.

### Meilenstein A3 — Erste zahlende Familien (Ende Woche 4–5)

- [ ] 30–50 Familien erreicht (persönliches Netzwerk, Eltern-Gruppen, Schul-/Vereinskontakte, ggf. 100–200 € Ads)
- [ ] Erste Verkäufe zum echten Preis (kein „kostenlos testen" — Zahlungsbereitschaft ist die Hypothese)
- [ ] Concierge-Betrieb läuft: persönliches Feedback auf jede Projekt-Einreichung, Antwort auf jede Support-Mail < 24 h
- [ ] Wöchentliche Kurzinterviews mit 3–5 Eltern (was war gut, wo hakte es, würden sie weiterempfehlen?)

### Meilenstein A4 — Auswertung & Entscheidung (Ende Woche 6)

- [ ] Kennzahlen erhoben: Käufe, Kursstart-Quote, Abschlussquote Lektion 3+, Projekteinreichungen, Rückerstattungen
- [ ] Qualitatives Bild: Zitate aus Elterninterviews, beobachtete Hürden der Kinder
- [ ] Entscheidung dokumentiert: Go Phase B / Pivot (Thema, Alter, Format) / Stop

**Gate A→B (alle drei müssen erfüllt sein):**

1. **≥ 10 zahlende Familien** zum Zielpreis (nicht Freunde/Familie)
2. **≥ 50 % der gestarteten Kinder** erreichen mindestens die Hälfte des Kurses
3. Mindestens **3 Eltern sagen unaufgefordert**, sie würden einen zweiten Kurs kaufen

Wird das Gate verfehlt: erst Angebot/Format iterieren (zurück zu A2/A3), **nicht** mit Eigenentwicklung „das Produkt retten".

---

## Phase B — Eigene Plattform (Woche 7–22, ~4 Monate)

**Ziel:** Die validierten Kurse auf eine eigene, kindgerechte Plattform heben — bessere Lern-UX, volle Marge, Datenschutz-Fundament. Die No-Code-Plattform bleibt parallel live, bis B fertig ist (kein Umsatzloch).

### Meilenstein B1 — Fundament (Woche 7–9)

- [ ] Repo + CI/CD: Next.js (TypeScript), Deploy-Pipeline auf Vercel oder Hetzner/Coolify, Preview-Deployments
- [ ] PostgreSQL (Supabase/Neon, EU-Region) mit Kern-Schema: `Account`, `ChildProfile`, `Course`, `Lesson`, `Enrollment`, `LessonProgress` (+ `organization_id` als ungenutztes Feld)
- [ ] Auth: Registrierung/Login nur für Eltern, E-Mail-Verifizierung, Passwort-Reset
- [ ] Kind-Profile: Anlegen (Spitzname, Avatar aus Auswahl, Geburtsjahr), Profilwechsel im Streaming-Stil
- [ ] Einwilligungs-Flow: Eltern bestätigen Verarbeitung der Kind-Daten (Zeitstempel gespeichert)
- [ ] Sentry (EU) + Plausible/PostHog EU eingebunden; Backups aktiv, ein Test-Restore durchgeführt

**Gate B1:** Ein Elternteil kann sich registrieren, zwei Kind-Profile anlegen und zwischen ihnen wechseln — auf der Produktionsumgebung.

### Meilenstein B2 — Content-Pipeline & Lern-Player (Woche 10–13)

- [ ] MDX-Pipeline: Lektionen als MDX im Repo, CI validiert (Linkcheck, Schema), Build generiert Kursseiten
- [ ] Pilotkurs vollständig nach MDX migriert (inkl. Pi-Anleitung mit Schritt-Checklisten und Teileliste)
- [ ] Lern-Player: Lektionsansicht, „Weiter"-Navigation, Video-Einbettung (Cloudflare Stream/Mux)
- [ ] Aufgaben-Widgets v1: Multiple Choice mit Sofort-Feedback, „Erledigt"-Checkliste
- [ ] Fortschritt: Lektion abschließen, Fortschrittsbalken pro Kurs, Wiedereinstieg an letzter Stelle

**Gate B2:** Ein Testkind arbeitet den kompletten Pilotkurs auf der neuen Plattform durch, Fortschritt stimmt nach Logout/Login und Gerätwechsel.

### Meilenstein B3 — Bezahlen & Eltern-Dashboard (Woche 14–17)

- [ ] Stripe Checkout (Abo und/oder Einmalkauf) + Customer Portal verlinkt
- [ ] Webhooks: Kauf → `Enrollment` automatisch anlegen; Kündigung/Zahlungsausfall → Zugriff entziehen (idempotent, mit Signaturprüfung)
- [ ] Eltern-Dashboard: Fortschritt pro Kind, Aboverwaltung, Einwilligungen einsehen
- [ ] Datenexport (JSON/CSV) und Konto-/Profil-Löschung mit Cascade — von Eltern selbst auslösbar
- [ ] Transaktionale E-Mails (Resend/Postmark): Kaufbestätigung, Passwort-Reset, „Kurs geschafft 🎉"
- [ ] Admin minimal: Nutzer suchen, Enrollment manuell schalten, Fortschritt zurücksetzen

**Gate B3:** Kompletter Kauf-bis-Kündigung-Zyklus im Stripe-Testmodus fehlerfrei; Löschung eines Testkontos entfernt nachweislich alle zugehörigen Daten.

### Meilenstein B4 — Migration & Launch (Woche 18–20)

- [ ] Security-/Datenschutz-Check: Autorisierung pro Account (kein Zugriff auf fremde Kinder!), Rate Limiting, keine Tracker im Kind-Bereich, AVVs gesammelt, Verarbeitungsverzeichnis angelegt
- [ ] Beta mit 5–10 Bestandsfamilien aus Phase A (Feedbackschleife 1 Woche)
- [ ] Migration der Bestandskunden: Konten angelegt (Einladungs-Mail), Fortschritt wo möglich übernommen, sonst transparent kommuniziert
- [ ] Zahlungsflüsse umgestellt, No-Code-Plattform in Read-only bzw. gekündigt
- [ ] Launch-Kommunikation an Warteliste und Bestandskunden

**Gate B4:** Alle zahlenden Bestandsfamilien sind umgezogen und aktiv; keine offenen kritischen Bugs; Rückerstattungsquote nicht erhöht.

### Meilenstein B5 — Zweiter Kurs & Automatisierungs-Basics (Woche 21–22)

- [ ] Zweiten Kurs über die MDX-Pipeline publiziert (beweist: neuer Content ohne Code-Änderung)
- [ ] Wöchentlicher Eltern-Report per E-Mail (Cronjob + Template)
- [ ] Einfache Badges („Erste Lektion", „Kurs abgeschlossen")
- [ ] Kennzahlen-Dashboard light: 5–6 SQL-Abfragen für Aktivierung, Abschlussquote, Churn

**Gate B→C (Kriterien für den Start der Skalierungsphase, Richtwerte):**

- ≥ 100 aktive Familien **oder** ≥ 2.000 € MRR
- ≥ 2 Kurse live, Abschlussquote stabil ≥ 40 %
- Ein manueller Prozess (Support, Feedback, Content-Onboarding) kostet nachweislich > 1 Tag/Woche → erst dann dessen Automatisierung bzw. den passenden Phase-C-Baustein angehen

---

## Übersicht

| Woche | Meilenstein       | Ergebnis                                       |
| ----- | ----------------- | ---------------------------------------------- |
| 1     | A1                | Angebot + Landing Page live                    |
| 3     | A2                | Kurs kaufbar, von Testkind durchlaufen         |
| 4–5   | A3                | Erste zahlende Familien, Concierge-Betrieb     |
| 6     | A4 / **Gate A→B** | Go/Pivot/Stop-Entscheidung                     |
| 9     | B1                | Auth, Eltern-/Kind-Konten, Einwilligung, Infra |
| 13    | B2                | MDX-Pipeline + Lern-Player mit Fortschritt     |
| 17    | B3                | Stripe, Eltern-Dashboard, Export/Löschung      |
| 20    | B4                | Migration der Bestandskunden, Launch           |
| 22    | B5 / **Gate B→C** | Zweiter Kurs, Basics automatisiert             |

**Prinzipien über die ganze Roadmap:**

- Phase A läuft während B weiter — Verkauf und Lernen stoppen nie.
- Scope-Disziplin: Was nicht auf dieser Liste steht (Mobile-App, Community, KI, Ranglisten), wird in einer „Später"-Liste geparkt, nicht diskutiert.
- Jedes Gate wird schriftlich entschieden — auch ein „Nein" ist ein Ergebnis der Validierung.
