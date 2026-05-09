# NB Therapy — Design Spec
**Date:** 2026-05-09
**Status:** Approved

---

## Overview

A production-ready booking website for **NB Therapy**, a Belgian female wellness practitioner offering Hijama, massage, Ruqya Nuranya, and therapeutic listening sessions. The site targets French-speaking Belgian women. Deployed on Vercel.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS (custom palette) |
| Animations | Framer Motion |
| Forms | react-hook-form + zod |
| Database | Prisma + PostgreSQL (Vercel Postgres / Neon) |
| Email | Resend + React Email |
| Date handling | date-fns |
| Deployment | Vercel (with Vercel Cron) |

---

## Architecture

```
Browser → Next.js (app/) → Prisma → Vercel Postgres (Neon)
                        → Resend (transactional emails)
Vercel Cron → /api/cron/reminders → Prisma + Resend
```

### Pages & Routes

| Path | Type | Purpose |
|---|---|---|
| `/` | Page | Homepage |
| `/questionnaire/[token]` | Page | Medical questionnaire (token-gated) |
| `/api/book` | POST | Save appointment + send emails |
| `/api/cron/reminders` | GET | Daily 9h00 reminder + recommendation emails |

---

## Project Structure

```
nb-therapy/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── questionnaire/[token]/page.tsx
│   └── api/
│       ├── book/route.ts
│       └── cron/reminders/route.ts
├── components/
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── BookingForm.tsx
│   ├── ContactSection.tsx
│   └── QuoteSection.tsx
├── lib/
│   ├── prisma.ts
│   ├── email.ts
│   └── validations.ts
├── emails/
│   ├── confirmation.tsx
│   ├── questionnaire.tsx
│   ├── reminder.tsx
│   ├── recommendations.tsx
│   └── practitioner-notification.tsx
├── prisma/schema.prisma
├── tailwind.config.js
├── vercel.json
└── .env.local
```

---

## Design System

### Color Tokens (tailwind.config.js)

```js
rose: '#f2c4ce'
'rose-deep': '#e8a0b0'
lavender: '#d4b8e0'
'lavender-deep': '#9b7fd4'
sage: '#c8d8c0'
'sage-deep': '#7faa75'
cream: '#fdf6f0'
'cream-dark': '#f5ede4'
text: '#4a3540'
'text-light': '#9a7a85'
gold: '#c9a96e'
```

### Typography

- **Display:** Cormorant Garamond — weights 300, 400, 600 italic (Google Fonts)
- **Body:** Jost — weights 300, 400, 500 (Google Fonts)

### Constraints

- Zero emojis — SVG icons and Unicode ornamentals (✦ · —) only
- Mobile-first responsive
- All copy in French
- High-end aesthetic (Aesop / Sisley level)

---

## Homepage Sections

### 1. Hero
- 2-column layout: text left, animated floating card right
- Headline: "Prenez soin de vous, naturellement"
- Subline: "Entre stress, fatigue et rythme effréné… votre corps a besoin d'attention."
- CTA: "Prendre rendez-vous" → scrolls to `#reserver`
- Floating card: 4 services with hover state, CSS keyframe vertical float loop
- Framer Motion staggered fade-up on load

### 2. Services (4 cards)
1. **Hijama** — "Technique ancestrale de ventouses pour purifier le sang, soulager les douleurs et rééquilibrer le corps en profondeur." — Tag: `Réservé aux femmes`
2. **Massage bien-être** — "Soin doux et enveloppant pour détendre les muscles, libérer les tensions et retrouver légèreté et sérénité."
3. **Ruqya Nuranya** — "Ruqya Nuranya Moubaraka — un soin spirituel doux pour purifier l'âme, nettoyer l'esprit et retrouver l'équilibre intérieur." — Tag: `Sur demande`
4. **Accompagnement thérapeutique** — "Un espace d'écoute bienveillant pour les personnes qui souhaitent parler, être écoutées et accompagnées dans leurs difficultés." — Tag: `Nouveau`

Hover: lift + soft shadow transition (Framer Motion)

### 3. Quote
Centered italic Cormorant Garamond:
> "Parce que vous méritez de vous sentir bien, de l'intérieur comme à l'extérieur."

### 4. Booking Form (`#reserver`)

**Fields:**
- Prénom & Nom (required)
- Téléphone WhatsApp (required, Belgian format: `04XX XX XX XX`)
- Email (required)
- Service choisi (select: 4 options)
- Date souhaitée (date picker — no past dates, no Sundays)
- Heure souhaitée (time select: 09:00–19:00, every 30 min)
- Message libre (optional textarea)
- Checkbox: "J'accepte de recevoir un questionnaire médical par email avant ma séance" (required)
- GDPR notice inline

**Validation:** react-hook-form + zod. Belgian phone regex: `/^04\d{2}[\/\s]?\d{2}[\/\s]?\d{2}[\/\s]?\d{2}$/`

**On submit:** POST `/api/book` → elegant success message with next steps

### 5. Contact
Three cards with SVG icons:
- WhatsApp: 0496/93 42 34
- Email: nbtherapy07@gmail.com
- Instagram: _nb.therapy_

---

## Database Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Appointment {
  id                     String   @id @default(cuid())
  firstName              String
  lastName               String
  phone                  String
  email                  String
  service                String
  date                   DateTime
  message                String?
  status                 String   @default("PENDING")
  token                  String   @unique @default(cuid())
  questionnaireCompleted Boolean  @default(false)
  reminderSent           Boolean  @default(false)
  recommendationSent     Boolean  @default(false)
  createdAt              DateTime @default(now())
}
```

---

## Email System

### Email Sequence

| Trigger | Subject | Recipient |
|---|---|---|
| On booking | "Votre demande de rendez-vous — NB Therapy" | Client |
| On booking | "Nouvelle réservation — NB Therapy" | Practitioner (nbtherapy07@gmail.com) |
| On booking (immediate) | "Questionnaire médical — NB Therapy" | Client |
| Cron − 48h before | "Rappel de votre rendez-vous — NB Therapy" | Client |
| Cron − 24h before | "Recommandations avant votre séance — NB Therapy" | Client |
| On questionnaire submit | "Questionnaire complété — [Name]" | Practitioner |

### Email Design
- HTML with inline CSS (email-compatible)
- Rose/cream branded header with "NB Therapy" logotype
- Georgia fallback for Cormorant Garamond headings
- Clean, feminine, professional French tone
- Footer: `NB Therapy · Belgique · nbtherapy07@gmail.com`

### Questionnaire Email Fields
- Pathologies existantes
- Médicaments en cours
- Allergies connues
- Grossesse en cours (oui/non)
- Contre-indications connues
- Informations complémentaires

Link format: `https://nbtherapy.be/questionnaire/[token]`

---

## Cron Job (`/api/cron/reminders`)

- Schedule: `0 8 * * *` (08:00 UTC = 09:00 CET / 10:00 CEST — approximately 9h Belgian time)
- Secured with `CRON_SECRET` header check
- Queries appointments 48h from now with `reminderSent: false` → send reminder → set `reminderSent: true`
- Queries appointments 24h from now with `recommendationSent: false` → send recommendations → set `recommendationSent: true`

`vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "0 8 * * *" }]
}
```

---

## Animations

| Element | Animation |
|---|---|
| Hero text/CTA | Staggered fade-up (Framer Motion, on load) |
| Floating service card | Gentle vertical float loop (CSS keyframes) |
| Service cards | Hover lift + soft shadow (Framer Motion) |
| Form fields | Smooth focus transitions (CSS) |
| Success state | Fade-in + SVG checkmark draw animation |

---

## Environment Variables

```
DATABASE_URL=           # Vercel Postgres connection string
RESEND_API_KEY=         # Resend API key
CRON_SECRET=            # Secret to protect cron endpoint
NEXT_PUBLIC_SITE_URL=   # https://nbtherapy.be
```

---

## Security & Compliance

- All email sending server-side only — no API keys exposed to client
- GDPR notice on booking form
- Questionnaire page token-gated (unguessable cuid)
- Cron endpoint protected by `CRON_SECRET` header
- No user passwords or auth required (public booking form)
