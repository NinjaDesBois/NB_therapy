# NB Therapy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete production-ready booking website for NB Therapy — a Belgian wellness practitioner — with appointment scheduling, transactional emails via Resend, medical questionnaire, and daily Vercel Cron reminders.

**Architecture:** Single Next.js 14 App Router project. Browser submits the booking form to `/api/book`, which saves to Vercel Postgres via Prisma and fires three emails via Resend. A Vercel Cron job hits `/api/cron/reminders` daily at 08:00 UTC to send 48h reminders and 24h pre-session recommendation emails to confirmed clients.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS (custom palette — no default colors), Framer Motion, react-hook-form + zod, @hookform/resolvers, Prisma 5 + PostgreSQL, Resend, @react-email/components + @react-email/render, date-fns, date-fns/locale (fr), Jest 29, @testing-library/jest-dom

---

## File Map

All paths relative to project root: `C:\Users\Z-BOOK\Dropbox\PC\Desktop\Ninja\NB_Therapy\`

```
package.json
next.config.ts
tailwind.config.js
postcss.config.js
tsconfig.json
.gitignore
.env.local                               # gitignored
.env.example
vercel.json
jest.config.js
jest.setup.ts

app/
  layout.tsx                             # Root layout, Google Fonts
  page.tsx                               # Homepage — assembles all sections
  globals.css                            # Tailwind directives + float keyframes
  questionnaire/[token]/
    page.tsx                             # Server component — fetches appt by token
    QuestionnaireForm.tsx                # 'use client' form

  api/
    book/route.ts                        # POST: validate → save → send emails
    cron/reminders/route.ts              # GET: daily reminder + recommendations
    questionnaire/[token]/route.ts       # POST: save questionnaire + notify practitioner

components/
  Hero.tsx                               # 2-col hero, Framer Motion fade-up, floating card
  Services.tsx                           # 4 service cards with hover lift
  QuoteSection.tsx                       # Centered italic pull quote
  BookingForm.tsx                        # 'use client' — react-hook-form + zod
  BookingSuccess.tsx                     # SVG checkmark success state
  ContactSection.tsx                     # 3 contact cards with SVG icons

emails/
  confirmation.tsx                       # Client booking confirmation
  practitioner-notification.tsx          # New booking alert to practitioner
  questionnaire-link.tsx                 # Questionnaire link to client
  reminder.tsx                           # 48h reminder to client
  recommendations.tsx                    # 24h pre-session tips to client
  questionnaire-summary.tsx              # Completed questionnaire to practitioner

lib/
  prisma.ts                              # Prisma client singleton
  email.tsx                              # .tsx — Resend send functions using JSX render
  validations.ts                         # Zod schemas: bookingSchema, questionnaireSchema
  time-slots.ts                          # 30-min slot generator (09:00–19:00)

prisma/
  schema.prisma

__tests__/
  validations.test.ts
  book.test.ts
  reminders.test.ts
```

---

## Task 1: Project Scaffolding — package.json, configs, tsconfig

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `jest.config.js`
- Create: `jest.setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nb-therapy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.6.0",
    "@prisma/client": "^5.14.0",
    "@react-email/components": "^0.0.22",
    "@react-email/render": "^0.0.17",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.2.10",
    "next": "14.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.51.5",
    "resend": "^3.2.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.38",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {},
}

export default nextConfig
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create `.gitignore`**

```
.env.local
.env
node_modules/
.next/
```

- [ ] **Step 6: Create `jest.config.js`**

```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
})
```

- [ ] **Step 7: Create `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Install dependencies**

Run from project root:
```bash
npm install
```

Expected: installs all packages, runs `prisma generate` (will fail until schema exists — that's fine for now).

- [ ] **Step 9: Commit**

```bash
git init
git add package.json next.config.ts tsconfig.json postcss.config.js .gitignore jest.config.js jest.setup.ts
git commit -m "chore: scaffold project configuration"
```

---

## Task 2: Tailwind Config + Global Styles

**Files:**
- Create: `tailwind.config.js`
- Create: `app/globals.css`

- [ ] **Step 1: Create `tailwind.config.js`**

```js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      rose: '#f2c4ce',
      'rose-deep': '#e8a0b0',
      lavender: '#d4b8e0',
      'lavender-deep': '#9b7fd4',
      sage: '#c8d8c0',
      'sage-deep': '#7faa75',
      cream: '#fdf6f0',
      'cream-dark': '#f5ede4',
      text: '#4a3540',
      'text-light': '#9a7a85',
      gold: '#c9a96e',
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      display: ['var(--font-display)', ...fontFamily.serif],
      body: ['var(--font-body)', ...fontFamily.sans],
    },
    extend: {
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(74, 53, 64, 0.08)',
        'soft-lg': '0 8px 40px 0 rgba(74, 53, 64, 0.12)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-cream text-text font-body;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    @apply font-display;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js app/globals.css
git commit -m "chore: add Tailwind custom palette and global styles"
```

---

## Task 3: Root Layout + Google Fonts

**Files:**
- Create: `app/layout.tsx`

- [ ] **Step 1: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NB Therapy — Soins bien-être à Bruxelles',
  description:
    'Hijama, massage bien-être, Ruqya Nuranya et accompagnement thérapeutique. Praticienne féminine en Belgique.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with Google Fonts"
```

---

## Task 4: Prisma Schema + DB Client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
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
  questionnaireData      Json?
  reminderSent           Boolean  @default(false)
  recommendationSent     Boolean  @default(false)
  createdAt              DateTime @default(now())
}
```

- [ ] **Step 2: Create `lib/prisma.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CRON_SECRET=your-random-secret-here
NEXT_PUBLIC_SITE_URL=https://nbtherapy.be
```

- [ ] **Step 4: Create `.env.local` with real values**

Copy `.env.example` to `.env.local` and fill in real credentials:
- `DATABASE_URL`: Neon/Vercel Postgres connection string
- `RESEND_API_KEY`: from resend.com dashboard
- `CRON_SECRET`: any random string (e.g. `openssl rand -hex 32`)
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` for local dev

- [ ] **Step 5: Run Prisma generate + migrate**

```bash
npx prisma generate
npx prisma db push
```

Expected output for `db push`:
```
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts .env.example
git commit -m "feat: add Prisma schema and DB client singleton"
```

---

## Task 5: Zod Validation Schemas + Tests

**Files:**
- Create: `lib/validations.ts`
- Create: `lib/time-slots.ts`
- Create: `__tests__/validations.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/validations.test.ts`:

```ts
import { bookingSchema, questionnaireSchema } from '@/lib/validations'

describe('bookingSchema', () => {
  const valid = {
    firstName: 'Amira',
    lastName: 'Benali',
    phone: '0496/93 42 34',
    email: 'amira@example.com',
    service: 'Hijama',
    date: '2099-06-15', // far future, not a Sunday
    time: '10:00',
    message: '',
    acceptQuestionnaire: true as const,
  }

  it('accepts a valid booking', () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing firstName', () => {
    const result = bookingSchema.safeParse({ ...valid, firstName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid Belgian phone', () => {
    const result = bookingSchema.safeParse({ ...valid, phone: '123456789' })
    expect(result.success).toBe(false)
  })

  it('accepts phone with spaces', () => {
    expect(bookingSchema.safeParse({ ...valid, phone: '0496 93 42 34' }).success).toBe(true)
  })

  it('accepts phone without separators', () => {
    expect(bookingSchema.safeParse({ ...valid, phone: '0496934234' }).success).toBe(true)
  })

  it('rejects a Sunday date (2099-06-14 is a Sunday)', () => {
    // 2099-06-14 is a Sunday
    const result = bookingSchema.safeParse({ ...valid, date: '2099-06-14' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const dateErrors = result.error.flatten().fieldErrors.date
      expect(dateErrors?.some((e) => e.includes('dimanches'))).toBe(true)
    }
  })

  it('rejects a past date', () => {
    const result = bookingSchema.safeParse({ ...valid, date: '2000-01-01' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const dateErrors = result.error.flatten().fieldErrors.date
      expect(dateErrors?.some((e) => e.includes('futur'))).toBe(true)
    }
  })

  it('rejects invalid service', () => {
    const result = bookingSchema.safeParse({ ...valid, service: 'Invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects when acceptQuestionnaire is false', () => {
    const result = bookingSchema.safeParse({ ...valid, acceptQuestionnaire: false as never })
    expect(result.success).toBe(false)
  })
})

describe('questionnaireSchema', () => {
  it('accepts a valid questionnaire', () => {
    const result = questionnaireSchema.safeParse({
      pathologies: 'Aucune',
      medications: 'Aucun',
      allergies: 'Aucune',
      pregnant: 'non',
      contraindications: '',
      additionalInfo: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid pregnant value', () => {
    const result = questionnaireSchema.safeParse({ pregnant: 'maybe' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/validations.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '@/lib/validations'"

- [ ] **Step 3: Create `lib/time-slots.ts`**

```ts
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 9; hour <= 19; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 19) {
      slots.push(`${String(hour).padStart(2, '0')}:30`)
    }
  }
  return slots
  // Returns 21 slots: ['09:00', '09:30', ..., '18:30', '19:00']
}
```

- [ ] **Step 4: Create `lib/validations.ts`**

```ts
import { isSunday, isAfter, startOfDay } from 'date-fns'
import { z } from 'zod'

const SERVICES = [
  'Hijama',
  'Massage bien-être',
  'Ruqya Nuranya',
  'Accompagnement thérapeutique',
] as const

export const bookingSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z
    .string()
    .regex(
      /^04\d{2}[\s\/\-]?\d{2}[\s\/\-]?\d{2}[\s\/\-]?\d{2}$/,
      'Numéro belge invalide (ex: 0496/93 42 34)'
    ),
  email: z.string().email('Adresse email invalide'),
  service: z.enum(SERVICES, {
    errorMap: () => ({ message: 'Veuillez choisir un service' }),
  }),
  date: z
    .string()
    .min(1, 'La date est requise')
    .refine((val) => {
      const d = new Date(val)
      return isAfter(d, startOfDay(new Date()))
    }, 'La date doit être dans le futur')
    .refine((val) => {
      return !isSunday(new Date(val))
    }, 'Les dimanches ne sont pas disponibles'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure invalide'),
  message: z.string().optional(),
  acceptQuestionnaire: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter de recevoir le questionnaire médical',
    }),
  }),
})

export type BookingFormValues = z.infer<typeof bookingSchema>

export const questionnaireSchema = z.object({
  pathologies: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  pregnant: z.enum(['oui', 'non'], {
    errorMap: () => ({ message: 'Veuillez indiquer si vous êtes enceinte' }),
  }),
  contraindications: z.string().optional(),
  additionalInfo: z.string().optional(),
})

export type QuestionnaireValues = z.infer<typeof questionnaireSchema>
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx jest __tests__/validations.test.ts --no-coverage
```

Expected:
```
PASS __tests__/validations.test.ts
  bookingSchema
    ✓ accepts a valid booking
    ✓ rejects missing firstName
    ✓ rejects invalid Belgian phone
    ✓ accepts phone with spaces
    ✓ accepts phone without separators
    ✓ rejects a Sunday date
    ✓ rejects a past date
    ✓ rejects invalid service
    ✓ rejects when acceptQuestionnaire is false
  questionnaireSchema
    ✓ accepts a valid questionnaire
    ✓ rejects invalid pregnant value
```

- [ ] **Step 6: Commit**

```bash
git add lib/validations.ts lib/time-slots.ts __tests__/validations.test.ts
git commit -m "feat: add zod validation schemas with Belgian phone + Sunday blocking"
```

---

## Task 6: Email Templates (React Email)

**Files:**
- Create: `emails/confirmation.tsx`
- Create: `emails/practitioner-notification.tsx`
- Create: `emails/questionnaire-link.tsx`
- Create: `emails/reminder.tsx`
- Create: `emails/recommendations.tsx`
- Create: `emails/questionnaire-summary.tsx`

All templates share the same branded header/footer pattern.

- [ ] **Step 1: Create `emails/confirmation.tsx`**

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  lastName: string
  service: string
  date: Date
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#f2c4ce', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  box: { backgroundColor: '#fdf6f0', borderLeft: '3px solid #f2c4ce', padding: '16px 20px', margin: '24px 0', borderRadius: '2px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 4px' },
  value: { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '12px 0' },
  link: { color: '#9b7fd4' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

export default function ConfirmationEmail({ firstName, lastName, service, date }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>SOINS · BIEN-ÊTRE · BELGIQUE</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Votre demande a bien été reçue</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Nous avons bien reçu votre demande de rendez-vous. Vous serez
              contactée sous peu pour confirmation.
            </Text>
            <Section style={s.box}>
              <Text style={s.label}>Service</Text>
              <Text style={s.value}>{service}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Date souhaitée</Text>
              <Text style={{ ...s.value, margin: '0' }}>
                {format(new Date(date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </Text>
            </Section>
            <Text style={s.p}>
              Vous recevrez également un questionnaire médical par email afin de
              préparer au mieux votre séance.
            </Text>
            <Text style={s.p}>
              Pour toute question :{' '}
              <Link href="https://wa.me/32496934234" style={s.link}>
                WhatsApp 0496/93 42 34
              </Link>
            </Text>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Create `emails/practitioner-notification.tsx`**

```tsx
import { Body, Container, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  lastName: string
  service: string
  date: Date
  phone: string
  email: string
  message?: string | null
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#c8d8c0', padding: '28px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '14px', lineHeight: '1.6', color: '#4a3540', margin: '0 0 12px' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #f5ede4', padding: '16px 20px', margin: '20px 0', borderRadius: '4px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 2px' },
  value: { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '10px 0' },
  footer: { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '11px', color: '#9a7a85', margin: '0' },
}

export default function PractitionerNotificationEmail({
  firstName, lastName, service, date, phone, email, message,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY — Nouvelle réservation</Heading>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Nouvelle demande de rendez-vous</Heading>
            <Section style={s.box}>
              <Text style={s.label}>Client</Text>
              <Text style={s.value}>{firstName} {lastName}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Service</Text>
              <Text style={s.value}>{service}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Date souhaitée</Text>
              <Text style={s.value}>
                {format(new Date(date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Téléphone WhatsApp</Text>
              <Text style={s.value}>{phone}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Email</Text>
              <Text style={s.value}>{email}</Text>
              {message && (
                <>
                  <Hr style={s.hr} />
                  <Text style={s.label}>Message</Text>
                  <Text style={{ ...s.value, margin: '0' }}>{message}</Text>
                </>
              )}
            </Section>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 3: Create `emails/questionnaire-link.tsx`**

```tsx
import { Body, Head, Heading, Html, Link, Section, Text } from '@react-email/components'

interface Props {
  firstName: string
  questionnaireUrl: string
  service: string
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#d4b8e0', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  btn: { display: 'block', backgroundColor: '#9b7fd4', color: '#ffffff', padding: '14px 32px', borderRadius: '2px', textDecoration: 'none', fontFamily: "'Jost', Helvetica, sans-serif", fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase' as const, margin: '32px auto', textAlign: 'center' as const, maxWidth: '240px' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

export default function QuestionnaireLinkEmail({ firstName, questionnaireUrl, service }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>QUESTIONNAIRE MÉDICAL</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Préparez votre séance</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Afin de vous offrir les meilleurs soins lors de votre séance de{' '}
              <strong>{service}</strong>, nous vous invitons à compléter ce court
              questionnaire médical.
            </Text>
            <Text style={s.p}>
              Ces informations restent strictement confidentielles et ne servent
              qu'à adapter votre soin.
            </Text>
            <Link href={questionnaireUrl} style={s.btn}>
              Compléter le questionnaire
            </Link>
            <Text style={{ ...s.p, fontSize: '13px', color: '#9a7a85' }}>
              Ou copiez ce lien dans votre navigateur :{' '}
              <Link href={questionnaireUrl} style={{ color: '#9b7fd4' }}>
                {questionnaireUrl}
              </Link>
            </Text>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 4: Create `emails/reminder.tsx`**

```tsx
import { Body, Head, Heading, Html, Link, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  service: string
  date: Date
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#f2c4ce', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  box: { backgroundColor: '#fdf6f0', borderLeft: '3px solid #f2c4ce', padding: '16px 20px', margin: '24px 0', borderRadius: '2px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 4px' },
  value: { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#4a3540', margin: '0' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

export default function ReminderEmail({ firstName, service, date }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>RAPPEL DE RENDEZ-VOUS</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Votre rendez-vous approche</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Nous vous rappelons votre rendez-vous prévu dans 48 heures.
            </Text>
            <Section style={s.box}>
              <Text style={s.label}>Service</Text>
              <Text style={s.value}>{service}</Text>
              <Text style={{ ...s.label, margin: '12px 0 4px' }}>Date & heure</Text>
              <Text style={s.value}>
                {format(new Date(date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </Text>
            </Section>
            <Text style={s.p}>
              Pour modifier ou annuler votre rendez-vous, contactez-nous via{' '}
              <Link href="https://wa.me/32496934234" style={{ color: '#9b7fd4' }}>
                WhatsApp 0496/93 42 34
              </Link>
            </Text>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 5: Create `emails/recommendations.tsx`**

```tsx
import { Body, Head, Heading, Html, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  service: string
  date: Date
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#c8d8c0', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  tip: { display: 'flex', alignItems: 'flex-start', marginBottom: '14px' },
  bullet: { color: '#7faa75', marginRight: '12px', fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.5', flexShrink: 0 },
  tipText: { fontSize: '14px', color: '#4a3540', lineHeight: '1.6', margin: '0' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #c8d8c0', padding: '20px 24px', margin: '24px 0', borderRadius: '4px' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

const tips = [
  'Buvez suffisamment d\'eau dans les heures précédant la séance.',
  'Évitez les repas lourds au moins 2 heures avant votre séance.',
  'Portez des vêtements confortables et amples.',
  'Prévoyez d\'arriver 5 minutes avant votre heure de rendez-vous.',
  'Si vous avez des documents médicaux pertinents, pensez à les apporter.',
]

export default function RecommendationsEmail({ firstName, service, date }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>PRÉPAREZ VOTRE SÉANCE</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Recommandations avant votre séance</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Votre séance de <strong>{service}</strong> est prévue demain :{' '}
              <strong>
                {format(new Date(date), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
              </strong>
            </Text>
            <Text style={s.p}>Voici quelques recommandations pour en profiter pleinement :</Text>
            <Section style={s.box}>
              {tips.map((tip, i) => (
                <div key={i} style={s.tip}>
                  <span style={s.bullet}>✦</span>
                  <Text style={s.tipText}>{tip}</Text>
                </div>
              ))}
            </Section>
            <Text style={s.p}>
              À très bientôt,
              <br />
              <em style={{ fontFamily: 'Georgia, serif' }}>L'équipe NB Therapy</em>
            </Text>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 6: Create `emails/questionnaire-summary.tsx`**

```tsx
import { Body, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'

interface Props {
  firstName: string
  lastName: string
  service: string
  questionnaire: {
    pathologies?: string
    medications?: string
    allergies?: string
    pregnant: string
    contraindications?: string
    additionalInfo?: string
  }
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#d4b8e0', padding: '28px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '14px', lineHeight: '1.6', color: '#4a3540', margin: '0 0 8px' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #f5ede4', padding: '16px 20px', margin: '20px 0', borderRadius: '4px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 2px' },
  value: { fontSize: '14px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '8px 0' },
  footer: { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '11px', color: '#9a7a85', margin: '0' },
}

export default function QuestionnaireSummaryEmail({ firstName, lastName, service, questionnaire }: Props) {
  const fields = [
    { label: 'Pathologies existantes', value: questionnaire.pathologies || '—' },
    { label: 'Médicaments en cours', value: questionnaire.medications || '—' },
    { label: 'Allergies connues', value: questionnaire.allergies || '—' },
    { label: 'Grossesse en cours', value: questionnaire.pregnant },
    { label: 'Contre-indications', value: questionnaire.contraindications || '—' },
    { label: 'Informations complémentaires', value: questionnaire.additionalInfo || '—' },
  ]

  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY — Questionnaire complété</Heading>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>
              Questionnaire de {firstName} {lastName}
            </Heading>
            <Text style={s.p}>Service réservé : <strong>{service}</strong></Text>
            <Section style={s.box}>
              {fields.map((f, i) => (
                <div key={i}>
                  <Text style={s.label}>{f.label}</Text>
                  <Text style={s.value}>{f.value}</Text>
                  {i < fields.length - 1 && <Hr style={s.hr} />}
                </div>
              ))}
            </Section>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add emails/
git commit -m "feat: add React Email templates for all transactional emails"
```

---

## Task 7: Email Utility (lib/email.tsx)

**Files:**
- Create: `lib/email.tsx`

- [ ] **Step 1: Create `lib/email.tsx`**

```tsx
import { render } from '@react-email/render'
import { Resend } from 'resend'
import ConfirmationEmail from '@/emails/confirmation'
import PractitionerNotificationEmail from '@/emails/practitioner-notification'
import QuestionnaireLinkEmail from '@/emails/questionnaire-link'
import ReminderEmail from '@/emails/reminder'
import RecommendationsEmail from '@/emails/recommendations'
import QuestionnaireSummaryEmail from '@/emails/questionnaire-summary'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'NB Therapy <noreply@nbtherapy.be>'
const PRACTITIONER = 'nbtherapy07@gmail.com'

export interface AppointmentEmailData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  date: Date
  token: string
  message?: string | null
}

export async function sendConfirmationEmail(data: AppointmentEmailData) {
  const html = await render(<ConfirmationEmail firstName={data.firstName} lastName={data.lastName} service={data.service} date={data.date} />)
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Votre demande de rendez-vous — NB Therapy',
    html,
  })
}

export async function sendPractitionerNotification(data: AppointmentEmailData) {
  const html = await render(<PractitionerNotificationEmail firstName={data.firstName} lastName={data.lastName} service={data.service} date={data.date} phone={data.phone} email={data.email} message={data.message} />)
  return resend.emails.send({
    from: FROM,
    to: PRACTITIONER,
    subject: `Nouvelle réservation — ${data.firstName} ${data.lastName}`,
    html,
  })
}

export async function sendQuestionnaireEmail(data: AppointmentEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const questionnaireUrl = `${siteUrl}/questionnaire/${data.token}`
  const html = await render(<QuestionnaireLinkEmail firstName={data.firstName} questionnaireUrl={questionnaireUrl} service={data.service} />)
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Questionnaire médical — NB Therapy',
    html,
  })
}

export async function sendReminderEmail(data: AppointmentEmailData) {
  const html = await render(<ReminderEmail firstName={data.firstName} service={data.service} date={data.date} />)
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Rappel de votre rendez-vous — NB Therapy',
    html,
  })
}

export async function sendRecommendationsEmail(data: AppointmentEmailData) {
  const html = await render(<RecommendationsEmail firstName={data.firstName} service={data.service} date={data.date} />)
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Recommandations avant votre séance — NB Therapy',
    html,
  })
}

export async function sendQuestionnaireSummary(
  data: AppointmentEmailData,
  questionnaire: {
    pathologies?: string
    medications?: string
    allergies?: string
    pregnant: string
    contraindications?: string
    additionalInfo?: string
  }
) {
  const html = await render(<QuestionnaireSummaryEmail firstName={data.firstName} lastName={data.lastName} service={data.service} questionnaire={questionnaire} />)
  return resend.emails.send({
    from: FROM,
    to: PRACTITIONER,
    subject: `Questionnaire complété — ${data.firstName} ${data.lastName}`,
    html,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/email.tsx
git commit -m "feat: add Resend email utility with typed send functions"
```

---

## Task 8: Hero Component

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'

const services = [
  { name: 'Hijama', ornament: '✦' },
  { name: 'Massage bien-être', ornament: '—' },
  { name: 'Ruqya Nuranya', ornament: '✦' },
  { name: 'Accompagnement thérapeutique', ornament: '—' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section className="min-h-screen bg-cream flex items-center px-6 md:px-16 lg:px-24 py-20">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — text */}
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-text-light font-body text-xs tracking-[3px] uppercase mb-6"
          >
            NB Therapy · Belgique
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display font-light text-text leading-[1.15] text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Prenez soin de vous,{' '}
            <em className="italic text-text-light">naturellement</em>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-body font-light text-text-light text-lg leading-relaxed mb-10 max-w-md"
          >
            Entre stress, fatigue et rythme effréné… votre corps a besoin d&apos;attention.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <a
              href="#reserver"
              className="inline-block bg-text text-cream font-body font-light text-xs tracking-[2px] uppercase px-10 py-4 hover:bg-text-light transition-colors duration-300"
            >
              Prendre rendez-vous
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-16 flex items-center gap-4"
          >
            <div className="h-px w-12 bg-rose-deep" />
            <span className="text-text-light font-body text-xs tracking-[2px] uppercase">
              Réservé aux femmes
            </span>
          </motion.div>
        </div>

        {/* Right — floating card */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hidden lg:block"
        >
          <div className="animate-float">
            <div className="bg-white rounded-sm shadow-soft-lg border border-cream-dark p-8 max-w-sm mx-auto">
              <p className="font-body text-xs text-text-light tracking-[2px] uppercase mb-6">
                Nos soins
              </p>
              <div className="space-y-5">
                {services.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-4 group cursor-default"
                  >
                    <span className="text-rose-deep font-display text-lg w-5 text-center">
                      {s.ornament}
                    </span>
                    <span className="font-display font-light text-text text-lg group-hover:text-text-light transition-colors duration-200">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-cream-dark">
                <p className="font-body text-xs text-text-light text-center tracking-[1px]">
                  Bruxelles, Belgique
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: add Hero section with Framer Motion fade-up and floating card"
```

---

## Task 9: Services Component

**Files:**
- Create: `components/Services.tsx`

- [ ] **Step 1: Create `components/Services.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'

const services = [
  {
    title: 'Hijama',
    description:
      'Technique ancestrale de ventouses pour purifier le sang, soulager les douleurs et rééquilibrer le corps en profondeur.',
    tag: 'Réservé aux femmes',
    ornament: '✦',
    color: 'bg-rose',
  },
  {
    title: 'Massage bien-être',
    description:
      'Soin doux et enveloppant pour détendre les muscles, libérer les tensions et retrouver légèreté et sérénité.',
    tag: null,
    ornament: '—',
    color: 'bg-sage',
  },
  {
    title: 'Ruqya Nuranya',
    description:
      'Ruqya Nuranya Moubaraka — un soin spirituel doux pour purifier l\'âme, nettoyer l\'esprit et retrouver l\'équilibre intérieur.',
    tag: 'Sur demande',
    ornament: '✦',
    color: 'bg-lavender',
  },
  {
    title: 'Accompagnement thérapeutique',
    description:
      'Un espace d\'écoute bienveillant pour les personnes qui souhaitent parler, être écoutées et accompagnées dans leurs difficultés.',
    tag: 'Nouveau',
    ornament: '—',
    color: 'bg-cream-dark',
  },
]

export default function Services() {
  return (
    <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
            Ce que nous proposons
          </p>
          <h2 className="font-display font-light text-text text-4xl md:text-5xl">
            Nos soins
          </h2>
          <div className="w-16 h-px bg-rose-deep mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px 0 rgba(74, 53, 64, 0.12)' }}
              className="bg-cream rounded-sm border border-cream-dark p-8 cursor-default transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-display text-2xl text-rose-deep">{service.ornament}</span>
                {service.tag && (
                  <span className="font-body text-[10px] tracking-[1.5px] uppercase text-text-light border border-text-light px-3 py-1">
                    {service.tag}
                  </span>
                )}
              </div>
              <h3 className="font-display font-light text-text text-2xl mb-4">
                {service.title}
              </h3>
              <p className="font-body font-light text-text-light text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Services.tsx
git commit -m "feat: add Services section with 4 cards and Framer Motion hover"
```

---

## Task 10: Quote + Contact Sections

**Files:**
- Create: `components/QuoteSection.tsx`
- Create: `components/ContactSection.tsx`

- [ ] **Step 1: Create `components/QuoteSection.tsx`**

```tsx
export default function QuoteSection() {
  return (
    <section className="bg-cream-dark py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-12 h-px bg-gold mx-auto mb-10" />
        <blockquote className="font-display font-light italic text-text text-2xl md:text-3xl leading-relaxed">
          &ldquo;Parce que vous méritez de vous sentir bien,{' '}
          de l&apos;intérieur comme à l&apos;extérieur.&rdquo;
        </blockquote>
        <div className="w-12 h-px bg-gold mx-auto mt-10" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/ContactSection.tsx`**

```tsx
const contacts = [
  {
    label: 'WhatsApp',
    value: '0496/93 42 34',
    href: 'https://wa.me/32496934234',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'nbtherapy07@gmail.com',
    href: 'mailto:nbtherapy07@gmail.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    value: '_nb.therapy_',
    href: 'https://instagram.com/_nb.therapy_',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function ContactSection() {
  return (
    <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-14">
          <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
            Restons en contact
          </p>
          <h2 className="font-display font-light text-text text-4xl">
            Nous joindre
          </h2>
          <div className="w-16 h-px bg-rose-deep mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center border border-cream-dark p-8 hover:border-rose-deep transition-colors duration-300 bg-cream"
            >
              <span className="text-text-light group-hover:text-text transition-colors duration-300 mb-4">
                {c.icon}
              </span>
              <p className="font-body text-xs text-text-light tracking-[2px] uppercase mb-2">
                {c.label}
              </p>
              <p className="font-display font-light text-text text-lg">
                {c.value}
              </p>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/QuoteSection.tsx components/ContactSection.tsx
git commit -m "feat: add QuoteSection and ContactSection with SVG icons"
```

---

## Task 11: Booking Form + Success State

**Files:**
- Create: `components/BookingForm.tsx`
- Create: `components/BookingSuccess.tsx`

- [ ] **Step 1: Create `components/BookingSuccess.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'

export default function BookingSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center py-16 px-8"
    >
      <div className="flex justify-center mb-8">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#c8d8c0" strokeWidth="2" />
          <motion.path
            d="M20 32 L28 40 L44 24"
            stroke="#7faa75"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          />
        </svg>
      </div>
      <h3 className="font-display font-light text-text text-3xl mb-4">
        Demande envoyée
      </h3>
      <p className="font-body font-light text-text-light text-base leading-relaxed max-w-md mx-auto mb-6">
        Votre demande de rendez-vous a bien été reçue. Vous recevrez un email de
        confirmation ainsi qu&apos;un questionnaire médical à compléter avant votre séance.
      </p>
      <p className="font-body text-xs text-text-light tracking-[1px] uppercase">
        Nous vous contacterons sous peu pour confirmer votre rendez-vous.
      </p>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `components/BookingForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, type BookingFormValues } from '@/lib/validations'
import { generateTimeSlots } from '@/lib/time-slots'
import { format } from 'date-fns'
import BookingSuccess from './BookingSuccess'

const services = [
  'Hijama',
  'Massage bien-être',
  'Ruqya Nuranya',
  'Accompagnement thérapeutique',
]

const timeSlots = generateTimeSlots()
const todayStr = format(new Date(), 'yyyy-MM-dd')

const inputClass =
  'w-full bg-white border border-cream-dark text-text font-body font-light text-sm px-4 py-3 focus:outline-none focus:border-text-light transition-colors duration-200 placeholder:text-text-light'

const errorClass = 'text-[11px] text-rose-deep mt-1 font-body'

const labelClass = 'block font-body text-xs text-text-light tracking-[1.5px] uppercase mb-2'

export default function BookingForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  })

  async function onSubmit(data: BookingFormValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setServerError(body.error ?? 'Une erreur est survenue. Veuillez réessayer.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('Une erreur réseau est survenue. Veuillez réessayer.')
    }
  }

  if (submitted) return <BookingSuccess />

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Prénom + Nom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prénom *</label>
          <input {...register('firstName')} placeholder="Votre prénom" className={inputClass} />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Nom *</label>
          <input {...register('lastName')} placeholder="Votre nom" className={inputClass} />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Téléphone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>WhatsApp *</label>
          <input {...register('phone')} placeholder="0496/93 42 34" className={inputClass} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input {...register('email')} type="email" placeholder="votre@email.com" className={inputClass} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      {/* Service */}
      <div>
        <label className={labelClass}>Service souhaité *</label>
        <select {...register('service')} defaultValue="" className={inputClass}>
          <option value="" disabled>Choisissez un service</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.service && <p className={errorClass}>{errors.service.message}</p>}
      </div>

      {/* Date + Heure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date souhaitée *</label>
          <input
            {...register('date')}
            type="date"
            min={todayStr}
            className={inputClass}
          />
          <p className="text-[11px] text-text-light mt-1 font-body">
            Les dimanches ne sont pas disponibles
          </p>
          {errors.date && <p className={errorClass}>{errors.date.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Heure souhaitée *</label>
          <select {...register('time')} defaultValue="" className={inputClass}>
            <option value="" disabled>Choisissez une heure</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p className={errorClass}>{errors.time.message}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>Message libre</label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder="Informations complémentaires, questions…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Questionnaire checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('acceptQuestionnaire')}
            type="checkbox"
            className="mt-1 accent-text w-4 h-4 flex-shrink-0"
          />
          <span className="font-body font-light text-sm text-text leading-relaxed">
            J&apos;accepte de recevoir un questionnaire médical par email avant ma séance *
          </span>
        </label>
        {errors.acceptQuestionnaire && (
          <p className={errorClass}>{errors.acceptQuestionnaire.message}</p>
        )}
      </div>

      {/* GDPR */}
      <p className="font-body text-xs text-text-light leading-relaxed border-t border-cream-dark pt-4">
        Vos données personnelles sont utilisées uniquement pour la gestion de votre
        rendez-vous et ne sont jamais partagées avec des tiers. Conformément au
        RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
        de vos données.
      </p>

      {serverError && (
        <p className="text-sm text-rose-deep font-body border border-rose p-3">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-text text-cream font-body font-light text-xs tracking-[2px] uppercase py-4 hover:bg-text-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </button>

    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/BookingForm.tsx components/BookingSuccess.tsx
git commit -m "feat: add BookingForm with react-hook-form/zod and success state"
```

---

## Task 12: Homepage (app/page.tsx)

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import QuoteSection from '@/components/QuoteSection'
import BookingForm from '@/components/BookingForm'
import ContactSection from '@/components/ContactSection'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <QuoteSection />

      {/* Booking section */}
      <section id="reserver" className="bg-cream py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
              Réservation en ligne
            </p>
            <h2 className="font-display font-light text-text text-4xl md:text-5xl">
              Prendre rendez-vous
            </h2>
            <div className="w-16 h-px bg-rose-deep mx-auto mt-6 mb-4" />
            <p className="font-body font-light text-text-light text-sm leading-relaxed">
              Remplissez le formulaire ci-dessous. Nous vous contacterons pour
              confirmer votre rendez-vous dans les plus brefs délais.
            </p>
          </div>
          <BookingForm />
        </div>
      </section>

      <ContactSection />

      {/* Footer */}
      <footer className="bg-text py-10 px-6 text-center">
        <p className="font-display font-light italic text-cream text-xl mb-2">NB Therapy</p>
        <p className="font-body text-xs text-text-light tracking-[2px] uppercase">
          Belgique · Soins bien-être · Réservé aux femmes
        </p>
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: Run dev server and visually verify homepage**

```bash
npm run dev
```

Open `http://localhost:3000` and check:
- Hero section loads with fade-up animation
- Floating card animates (float keyframe)
- Services cards show all 4 services with hover lift
- Quote section visible
- Booking form renders all fields
- Contact section shows 3 cards with SVG icons

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble homepage with all sections"
```

---

## Task 13: /api/book Route + Tests

**Files:**
- Create: `app/api/book/route.ts`
- Create: `__tests__/book.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/book.test.ts`:

```ts
import { POST } from '@/app/api/book/route'
import { prisma } from '@/lib/prisma'
import * as emailLib from '@/lib/email'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue({}),
  sendPractitionerNotification: jest.fn().mockResolvedValue({}),
  sendQuestionnaireEmail: jest.fn().mockResolvedValue({}),
}))

const mockCreate = prisma.appointment.create as jest.Mock

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  firstName: 'Amira',
  lastName: 'Benali',
  phone: '0496934234',
  email: 'amira@example.com',
  service: 'Hijama',
  date: '2099-06-15',
  time: '10:00',
  message: '',
  acceptQuestionnaire: true,
}

describe('POST /api/book', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue({
      id: 'test-id',
      token: 'test-token',
      ...validBody,
      date: new Date('2099-06-15T10:00:00'),
      status: 'PENDING',
    })
  })

  it('returns 201 and creates appointment for valid body', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('sends confirmation, practitioner, and questionnaire emails', async () => {
    await POST(makeRequest(validBody))
    expect(emailLib.sendConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(emailLib.sendPractitionerNotification).toHaveBeenCalledTimes(1)
    expect(emailLib.sendQuestionnaireEmail).toHaveBeenCalledTimes(1)
  })

  it('returns 400 for invalid body', async () => {
    const res = await POST(makeRequest({ firstName: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for Sunday date', async () => {
    const res = await POST(makeRequest({ ...validBody, date: '2099-06-14' }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/book.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '@/app/api/book/route'"

- [ ] **Step 3: Create `app/api/book/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { parse } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'
import {
  sendConfirmationEmail,
  sendPractitionerNotification,
  sendQuestionnaireEmail,
} from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { firstName, lastName, phone, email, service, date, time, message } = parsed.data

    const appointmentDate = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date())

    const appointment = await prisma.appointment.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        service,
        date: appointmentDate,
        message: message || null,
        status: 'PENDING',
      },
    })

    await Promise.all([
      sendConfirmationEmail(appointment),
      sendPractitionerNotification(appointment),
      sendQuestionnaireEmail(appointment),
    ])

    return NextResponse.json({ success: true, id: appointment.id }, { status: 201 })
  } catch (error) {
    console.error('[/api/book]', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/book.test.ts --no-coverage
```

Expected:
```
PASS __tests__/book.test.ts
  POST /api/book
    ✓ returns 201 and creates appointment for valid body
    ✓ sends confirmation, practitioner, and questionnaire emails
    ✓ returns 400 for invalid body
    ✓ returns 400 for Sunday date
```

- [ ] **Step 5: Commit**

```bash
git add app/api/book/route.ts __tests__/book.test.ts
git commit -m "feat: add /api/book route with validation, DB write, and email dispatch"
```

---

## Task 14: Questionnaire Page + API Route

**Files:**
- Create: `app/questionnaire/[token]/page.tsx`
- Create: `app/questionnaire/[token]/QuestionnaireForm.tsx`
- Create: `app/api/questionnaire/[token]/route.ts`

- [ ] **Step 1: Create `app/api/questionnaire/[token]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { questionnaireSchema } from '@/lib/validations'
import { sendQuestionnaireSummary } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const parsed = questionnaireSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { token: params.token },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })
    }

    if (appointment.questionnaireCompleted) {
      return NextResponse.json(
        { error: 'Ce questionnaire a déjà été complété' },
        { status: 409 }
      )
    }

    await prisma.appointment.update({
      where: { token: params.token },
      data: {
        questionnaireCompleted: true,
        questionnaireData: parsed.data,
      },
    })

    await sendQuestionnaireSummary(appointment, parsed.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/questionnaire]', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/questionnaire/[token]/QuestionnaireForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionnaireSchema, type QuestionnaireValues } from '@/lib/validations'
import { motion } from 'framer-motion'

const inputClass =
  'w-full bg-white border border-cream-dark text-text font-body font-light text-sm px-4 py-3 focus:outline-none focus:border-text-light transition-colors duration-200 placeholder:text-text-light'
const labelClass = 'block font-body text-xs text-text-light tracking-[1.5px] uppercase mb-2'
const errorClass = 'text-[11px] text-rose-deep mt-1 font-body'

export default function QuestionnaireForm({ token }: { token: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<QuestionnaireValues>({ resolver: zodResolver(questionnaireSchema) })

  async function onSubmit(data: QuestionnaireValues) {
    setServerError(null)
    try {
      const res = await fetch(`/api/questionnaire/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setServerError(body.error ?? 'Une erreur est survenue.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('Erreur réseau. Veuillez réessayer.')
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="flex justify-center mb-6">
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#c8d8c0" strokeWidth="2" />
            <motion.path
              d="M20 32 L28 40 L44 24"
              stroke="#7faa75"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
          </svg>
        </div>
        <h2 className="font-display font-light text-text text-3xl mb-3">
          Questionnaire complété
        </h2>
        <p className="font-body font-light text-text-light">
          Merci. Vos informations ont été transmises à votre praticienne.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <label className={labelClass}>Pathologies existantes</label>
        <textarea {...register('pathologies')} rows={3} placeholder="Diabète, hypertension, etc. — ou 'Aucune'" className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Médicaments en cours</label>
        <textarea {...register('medications')} rows={2} placeholder="Nom des médicaments — ou 'Aucun'" className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Allergies connues</label>
        <input {...register('allergies')} placeholder="Ex: latex, huiles essentielles — ou 'Aucune'" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Grossesse en cours *</label>
        <div className="flex gap-6 mt-2">
          {(['non', 'oui'] as const).map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer font-body text-sm text-text capitalize">
              <input {...register('pregnant')} type="radio" value={val} className="accent-text" />
              {val}
            </label>
          ))}
        </div>
        {errors.pregnant && <p className={errorClass}>{errors.pregnant.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Contre-indications connues</label>
        <textarea {...register('contraindications')} rows={2} placeholder="Ex: pacemaker, implants — ou 'Aucune'" className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Informations complémentaires</label>
        <textarea {...register('additionalInfo')} rows={3} placeholder="Tout ce que vous souhaitez partager…" className={`${inputClass} resize-none`} />
      </div>

      {serverError && (
        <p className="text-sm text-rose-deep font-body border border-rose p-3">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-text text-cream font-body font-light text-xs tracking-[2px] uppercase py-4 hover:bg-text-light transition-colors duration-300 disabled:opacity-50"
      >
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer le questionnaire'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create `app/questionnaire/[token]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QuestionnaireForm from './QuestionnaireForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Questionnaire médical — NB Therapy',
}

export default async function QuestionnairePage({
  params,
}: {
  params: { token: string }
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { token: params.token },
    select: {
      firstName: true,
      service: true,
      questionnaireCompleted: true,
    },
  })

  if (!appointment) notFound()

  return (
    <main className="min-h-screen bg-cream py-16 px-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-display font-light italic text-text-light text-lg mb-1">
            NB Therapy
          </p>
          <div className="w-10 h-px bg-rose-deep mx-auto my-4" />
          <h1 className="font-display font-light text-text text-4xl mb-4">
            Questionnaire médical
          </h1>
          <p className="font-body font-light text-text-light text-sm leading-relaxed">
            Bonjour {appointment.firstName}, merci de compléter ce questionnaire
            avant votre séance de <strong>{appointment.service}</strong>.
            Ces informations restent strictement confidentielles.
          </p>
        </div>

        <div className="bg-white border border-cream-dark p-8">
          {appointment.questionnaireCompleted ? (
            <div className="text-center py-8">
              <p className="font-display font-light italic text-text text-xl mb-2">
                Déjà complété
              </p>
              <p className="font-body font-light text-text-light text-sm">
                Vous avez déjà rempli ce questionnaire. Merci !
              </p>
            </div>
          ) : (
            <QuestionnaireForm token={params.token} />
          )}
        </div>

        <p className="text-center font-body text-xs text-text-light mt-8 tracking-[1px]">
          NB Therapy · Belgique · nbtherapy07@gmail.com
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/questionnaire/ app/api/questionnaire/
git commit -m "feat: add questionnaire page and API route"
```

---

## Task 15: Cron Reminders Route + Tests

**Files:**
- Create: `app/api/cron/reminders/route.ts`
- Create: `__tests__/reminders.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/reminders.test.ts`:

```ts
import { GET } from '@/app/api/cron/reminders/route'
import { prisma } from '@/lib/prisma'
import * as emailLib from '@/lib/email'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  sendReminderEmail: jest.fn().mockResolvedValue({}),
  sendRecommendationsEmail: jest.fn().mockResolvedValue({}),
}))

const mockFindMany = prisma.appointment.findMany as jest.Mock
const mockUpdate = prisma.appointment.update as jest.Mock

const CRON_SECRET = 'test-secret'
process.env.CRON_SECRET = CRON_SECRET

function makeRequest(auth?: string) {
  return new Request('http://localhost/api/cron/reminders', {
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  })
}

const mockAppt = {
  id: 'appt-1',
  firstName: 'Amira',
  lastName: 'Benali',
  email: 'a@test.com',
  phone: '0496934234',
  service: 'Hijama',
  date: new Date(),
  token: 'tok',
}

describe('GET /api/cron/reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindMany.mockResolvedValue([])
    mockUpdate.mockResolvedValue({})
  })

  it('returns 401 without auth', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 with wrong secret', async () => {
    const res = await GET(makeRequest('wrong'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with correct secret', async () => {
    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)
  })

  it('sends reminder emails and updates DB', async () => {
    mockFindMany
      .mockResolvedValueOnce([mockAppt])  // 48h query
      .mockResolvedValueOnce([])           // 24h query

    await GET(makeRequest(CRON_SECRET))
    expect(emailLib.sendReminderEmail).toHaveBeenCalledWith(mockAppt)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'appt-1' },
      data: { reminderSent: true },
    })
  })

  it('sends recommendation emails and updates DB', async () => {
    mockFindMany
      .mockResolvedValueOnce([])           // 48h query
      .mockResolvedValueOnce([mockAppt])   // 24h query

    await GET(makeRequest(CRON_SECRET))
    expect(emailLib.sendRecommendationsEmail).toHaveBeenCalledWith(mockAppt)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'appt-1' },
      data: { recommendationSent: true },
    })
  })

  it('returns counts in response body', async () => {
    mockFindMany
      .mockResolvedValueOnce([mockAppt])
      .mockResolvedValueOnce([mockAppt])

    const res = await GET(makeRequest(CRON_SECRET))
    const data = await res.json()
    expect(data.reminders).toBe(1)
    expect(data.recommendations).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/reminders.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '@/app/api/cron/reminders/route'"

- [ ] **Step 3: Create `app/api/cron/reminders/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { addHours } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail, sendRecommendationsEmail } from '@/lib/email'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const [reminderAppts, recommendationAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: addHours(now, 47), lte: addHours(now, 49) },
        reminderSent: false,
        status: 'CONFIRMED',
      },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: addHours(now, 23), lte: addHours(now, 25) },
        recommendationSent: false,
        status: 'CONFIRMED',
      },
    }),
  ])

  await Promise.all([
    ...reminderAppts.map(async (appt) => {
      await sendReminderEmail(appt)
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true },
      })
    }),
    ...recommendationAppts.map(async (appt) => {
      await sendRecommendationsEmail(appt)
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { recommendationSent: true },
      })
    }),
  ])

  return NextResponse.json({
    reminders: reminderAppts.length,
    recommendations: recommendationAppts.length,
  })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/reminders.test.ts --no-coverage
```

Expected:
```
PASS __tests__/reminders.test.ts
  GET /api/cron/reminders
    ✓ returns 401 without auth
    ✓ returns 401 with wrong secret
    ✓ returns 200 with correct secret
    ✓ sends reminder emails and updates DB
    ✓ sends recommendation emails and updates DB
    ✓ returns counts in response body
```

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/reminders/route.ts __tests__/reminders.test.ts
git commit -m "feat: add cron reminders route with 48h/24h windows and auth guard"
```

---

## Task 16: Vercel Config + Full Test Run

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

(08:00 UTC = 09:00 CET / 10:00 CEST — approximately 9h Belgian local time)

- [ ] **Step 2: Run full test suite**

```bash
npx jest --no-coverage
```

Expected:
```
PASS __tests__/validations.test.ts (11 tests)
PASS __tests__/book.test.ts       (4 tests)
PASS __tests__/reminders.test.ts  (6 tests)

Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
```

- [ ] **Step 3: Run build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no TypeScript errors.

- [ ] **Step 4: Final commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel cron config and verify full build"
```

---

## Deployment Checklist

Before going live on Vercel:

- [ ] Create project on [vercel.com](https://vercel.com) linked to this repo
- [ ] Add `DATABASE_URL` from Vercel Postgres (Storage tab → Create database → Neon)
- [ ] Run `npx prisma db push` against production DB (or use `prisma migrate deploy`)
- [ ] Add `RESEND_API_KEY` from [resend.com](https://resend.com) dashboard
- [ ] Verify sender domain in Resend (add DNS records for `nbtherapy.be`) — or use `onboarding@resend.dev` for testing
- [ ] Add `CRON_SECRET` (any 32-char random string)
- [ ] Add `NEXT_PUBLIC_SITE_URL=https://nbtherapy.be`
- [ ] Deploy and test booking form end-to-end
- [ ] Confirm all 3 emails arrive after a test booking
- [ ] Test questionnaire link from the email
