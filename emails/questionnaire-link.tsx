import { Body, Head, Heading, Html, Link, Section, Text } from '@react-email/components'

interface Props {
  firstName: string
  questionnaireUrl: string
  service: string
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#d4b8e0', padding: '32px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  tagline: { fontSize: '11px', letterSpacing: '2px', color: '#9a7a85', margin: '6px 0 0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '15px', lineHeight: '1.7', color: '#4a3540', margin: '0 0 16px' },
  btn: { display: 'block', backgroundColor: '#9b7fd4', color: '#ffffff', padding: '14px 32px', borderRadius: '2px', textDecoration: 'none', fontFamily: "'Jost', Helvetica, sans-serif", fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase' as const, margin: '32px auto', textAlign: 'center' as const, maxWidth: '240px' },
  footer: { padding: '24px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '12px', color: '#9a7a85', margin: '0' },
}

export default function QuestionnaireLinkEmail({ firstName, questionnaireUrl, service }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY</Heading>
            <Text style={s.tagline}>QUESTIONNAIRE MÉDICAL</Text>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Préparez votre séance</Heading>
            <Text style={s.p}>Bonjour {firstName},</Text>
            <Text style={s.p}>
              Afin de vous offrir les meilleurs soins lors de votre séance de{' '}
              <strong>{service}</strong>, nous vous invitons à compléter ce court
              questionnaire médical.
            </Text>
            <Text style={s.p}>
              Ces informations restent strictement confidentielles et ne servent
              qu&apos;à adapter votre soin.
            </Text>
            <Link href={questionnaireUrl} style={s.btn}>
              Compléter le questionnaire
            </Link>
            <Text style={{ ...s.p, fontSize: '13px', color: '#9a7a85' }}>
              Ou copiez ce lien dans votre navigateur :{' '}
              <Link href={questionnaireUrl} style={{ color: '#9b7fd4' }}>
                {questionnaireUrl}
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
