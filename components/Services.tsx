'use client'

import { motion } from 'framer-motion'

const services = [
  {
    title: 'Hijama',
    description:
      'Technique ancestrale de ventouses pour purifier le sang, soulager les douleurs et rééquilibrer le corps en profondeur.',
    tag: 'Réservé aux femmes',
    ornament: '✦',
  },
  {
    title: 'Massage bien-être',
    description:
      'Soin doux et enveloppant pour détendre les muscles, libérer les tensions et retrouver légèreté et sérénité.',
    tag: null,
    ornament: '—',
  },
  {
    title: 'Ruqya Nuranya',
    description:
      "Ruqya Nuranya Moubaraka — un soin spirituel doux pour purifier l'âme, nettoyer l'esprit et retrouver l'équilibre intérieur.",
    tag: 'Sur demande',
    ornament: '✦',
  },
  {
    title: 'Accompagnement thérapeutique',
    description:
      "Un espace d'écoute bienveillant pour les personnes qui souhaitent parler, être écoutées et accompagnées dans leurs difficultés.",
    tag: 'Nouveau',
    ornament: '—',
  },
]

export default function Services() {
  return (
    <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
            Ce que nous proposons
          </p>
          <h2 className="font-display font-light text-text text-4xl md:text-5xl">
            Nos soins
          </h2>
          <div className="w-16 h-px bg-rose-deep mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px 0 rgba(74, 53, 64, 0.12)' }}
              className="bg-cream rounded-sm border border-cream-dark p-8 cursor-default transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-display text-2xl text-rose-deep">{service.ornament}</span>
                {service.tag && (
                  <span className="font-body text-[10px] tracking-[1.5px] uppercase text-text-light border border-text-light px-3 py-1">
                    {service.tag}
                  </span>
                )}
              </div>
              <h3 className="font-display font-light text-text text-2xl mb-4">
                {service.title}
              </h3>
              <p className="font-body font-light text-text-light text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
