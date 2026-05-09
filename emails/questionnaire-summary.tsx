import { Body, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'

interface Props {
  firstName: string
  lastName: string
  service: string
  questionnaire: {
    pathologies?: string
    medications?: string
    allergies?: string
    pregnant: string
    contraindications?: string
    additionalInfo?: string
  }
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#d4b8e0', padding: '28px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '14px', lineHeight: '1.6', color: '#4a3540', margin: '0 0 8px' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #f5ede4', padding: '16px 20px', margin: '20px 0', borderRadius: '4px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 2px' },
  value: { fontSize: '14px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '8px 0' },
  footer: { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '11px', color: '#9a7a85', margin: '0' },
}

export default function QuestionnaireSummaryEmail({ firstName, lastName, service, questionnaire }: Props) {
  const fields = [
    { label: 'Pathologies existantes', value: questionnaire.pathologies || '—' },
    { label: 'Médicaments en cours', value: questionnaire.medications || '—' },
    { label: 'Allergies connues', value: questionnaire.allergies || '—' },
    { label: 'Grossesse en cours', value: questionnaire.pregnant },
    { label: 'Contre-indications', value: questionnaire.contraindications || '—' },
    { label: 'Informations complémentaires', value: questionnaire.additionalInfo || '—' },
  ]

  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY — Questionnaire complété</Heading>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>
              Questionnaire de {firstName} {lastName}
            </Heading>
            <Text style={s.p}>Service réservé : <strong>{service}</strong></Text>
            <Section style={s.box}>
              {fields.map((f, i) => (
                <div key={i}>
                  <Text style={s.label}>{f.label}</Text>
                  <Text style={s.value}>{f.value}</Text>
                  {i < fields.length - 1 && <Hr style={s.hr} />}
                </div>
              ))}
            </Section>
          </Section>
          <Section style={s.footer}>
            <Text style={s.footerText}>NB Therapy · Belgique · nbtherapy07@gmail.com</Text>
          </Section>
        </div>
      </Body>
    </Html>
  )
}
