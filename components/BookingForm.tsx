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
            className="mt-1 accent-[#4a3540] w-4 h-4 flex-shrink-0"
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
