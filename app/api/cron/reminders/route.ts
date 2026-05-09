import { NextResponse } from 'next/server'
import { addHours } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail, sendRecommendationsEmail } from '@/lib/email'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[/api/cron/reminders] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
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
      try {
        await sendReminderEmail(appt)
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { reminderSent: true },
        })
      } catch (err) {
        console.error(`[/api/cron/reminders] Failed to process reminder for ${appt.id}:`, err)
      }
    }),
    ...recommendationAppts.map(async (appt) => {
      try {
        await sendRecommendationsEmail(appt)
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { recommendationSent: true },
        })
      } catch (err) {
        console.error(`[/api/cron/reminders] Failed to process recommendation for ${appt.id}:`, err)
      }
    }),
  ])

  return NextResponse.json({
    reminders: reminderAppts.length,
    recommendations: recommendationAppts.length,
  })
}
