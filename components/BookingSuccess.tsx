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
