import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  lastName: string
  service: string
  date: Date
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#f2c4ce', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  box: { backgroundColor: '#fdf6f0', borderLeft: '3px solid #f2c4ce', padding: '16px 20px', margin: '24px 0', borderRadius: '2px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 4px' },
  value: { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '12px 0' },
  link: { color: '#9b7fd4' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

export default function ConfirmationEmail({ firstName, lastName, service, date }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>SOINS · BIEN-ÊTRE · BELGIQUE</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Votre demande a bien été reçue</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Nous avons bien reçu votre demande de rendez-vous. Vous serez
              contactée sous peu pour confirmation.
            </Text>
            <Section style={s.box}>
              <Text style={s.label}>Service</Text>
              <Text style={s.value}>{service}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Date souhaitée</Text>
              <Text style={{ ...s.value, margin: '0' }}>
                {format(new Date(date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </Text>
            </Section>
            <Text style={s.p}>
              Vous recevrez également un questionnaire médical par email afin de
              préparer au mieux votre séance.
            </Text>
            <Text style={s.p}>
              Pour toute question :{' '}
              <Link href="https://wa.me/32496934234" style={s.link}>
                WhatsApp 0496/93 42 34
              </Link>
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
