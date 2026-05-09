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
