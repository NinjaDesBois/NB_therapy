'use client'

import { motion } from 'framer-motion'

const services = [
  { name: 'Hijama', ornament: '✦' },
  { name: 'Massage bien-être', ornament: '—' },
  { name: 'Ruqya Nuranya', ornament: '✦' },
  { name: 'Accompagnement thérapeutique', ornament: '—' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section className="min-h-screen bg-cream flex items-center px-6 md:px-16 lg:px-24 py-20">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — text */}
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-text-light font-body text-xs tracking-[3px] uppercase mb-6"
          >
            NB Therapy · Belgique
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display font-light text-text leading-[1.15] text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Prenez soin de vous,{' '}
            <em className="italic text-text-light">naturellement</em>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-body font-light text-text-light text-lg leading-relaxed mb-10 max-w-md"
          >
            Entre stress, fatigue et rythme effréné… votre corps a besoin d&apos;attention.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <a
              href="#reserver"
              className="inline-block bg-text text-cream font-body font-light text-xs tracking-[2px] uppercase px-10 py-4 hover:bg-text-light transition-colors duration-300"
            >
              Prendre rendez-vous
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-16 flex items-center gap-4"
          >
            <div className="h-px w-12 bg-rose-deep" />
            <span className="text-text-light font-body text-xs tracking-[2px] uppercase">
              Réservé aux femmes
            </span>
          </motion.div>
        </div>

        {/* Right — floating card */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hidden lg:block"
        >
          <div className="animate-float">
            <div className="bg-white rounded-sm shadow-soft-lg border border-cream-dark p-8 max-w-sm mx-auto">
              <p className="font-body text-xs text-text-light tracking-[2px] uppercase mb-6">
                Nos soins
              </p>
              <div className="space-y-5">
                {services.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-4 group cursor-default"
                  >
                    <span className="text-rose-deep font-display text-lg w-5 text-center">
                      {s.ornament}
                    </span>
                    <span className="font-display font-light text-text text-lg group-hover:text-text-light transition-colors duration-200">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-cream-dark">
                <p className="font-body text-xs text-text-light text-center tracking-[1px]">
                  Bruxelles, Belgique
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
