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
