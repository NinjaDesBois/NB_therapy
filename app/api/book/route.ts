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

    if (!appointment.token) {
      throw new Error('Failed to generate appointment token')
    }

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
