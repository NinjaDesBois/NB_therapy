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
              <input {...register('pregnant')} type="radio" value={val} className="accent-[#4a3540]" />
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
