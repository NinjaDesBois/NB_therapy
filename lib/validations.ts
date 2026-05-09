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
