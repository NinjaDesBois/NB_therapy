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
