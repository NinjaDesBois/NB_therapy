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
