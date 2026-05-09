import { Body, Head, Heading, Html, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  service: string
  date: Date
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#c8d8c0', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  tip: { display: 'flex' as const, alignItems: 'flex-start', marginBottom: '14px' },
  bullet: { color: '#7faa75', marginRight: '12px', fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.5', flexShrink: 0 },
  tipText: { fontSize: '14px', color: '#4a3540', lineHeight: '1.6', margin: '0' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #c8d8c0', padding: '20px 24px', margin: '24px 0', borderRadius: '4px' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

const tips = [
  "Buvez suffisamment d'eau dans les heures précédant la séance.",
  'Évitez les repas lourds au moins 2 heures avant votre séance.',
  'Portez des vêtements confortables et amples.',
  "Prévoyez d'arriver 5 minutes avant votre heure de rendez-vous.",
  'Si vous avez des documents médicaux pertinents, pensez à les apporter.',
]

export default function RecommendationsEmail({ firstName, service, date }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>PRÉPAREZ VOTRE SÉANCE</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Recommandations avant votre séance</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Votre séance de <strong>{service}</strong> est prévue demain :{' '}
              <strong>
                {format(new Date(date), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
              </strong>
            </Text>
            <Text style={s.p}>Voici quelques recommandations pour en profiter pleinement :</Text>
            <Section style={s.box}>
              {tips.map((tip, i) => (
                <div key={i} style={s.tip}>
                  <span style={s.bullet}>✦</span>
                  <Text style={s.tipText}>{tip}</Text>
                </div>
              ))}
            </Section>
            <Text style={s.p}>
              À très bientôt,
              <br />
              <em style={{ fontFamily: 'Georgia, serif' }}>L&apos;équipe NB Therapy</em>
            </Text>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
