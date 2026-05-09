import { Body, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  firstName: string
  lastName: string
  service: string
  date: Date
  phone: string
  email: string
  message?: string | null
}

const s = {
  body: { backgroundColor: '#fdf6f0', fontFamily: "'Jost', Helvetica, Arial, sans-serif" },
  wrap: { maxWidth: '600px', margin: '0 auto' },
  header: { backgroundColor: '#c8d8c0', padding: '28px 40px', textAlign: 'center' as const },
  logo: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', letterSpacing: '4px', color: '#4a3540', margin: '0' },
  body2: { backgroundColor: '#ffffff', padding: '40px' },
  h2: { fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#4a3540', margin: '0 0 20px' },
  p: { fontSize: '14px', lineHeight: '1.6', color: '#4a3540', margin: '0 0 12px' },
  box: { backgroundColor: '#fdf6f0', border: '1px solid #f5ede4', padding: '16px 20px', margin: '20px 0', borderRadius: '4px' },
  label: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#9a7a85', margin: '0 0 2px' },
  value: { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#4a3540', margin: '0 0 12px' },
  hr: { borderColor: '#f5ede4', margin: '10px 0' },
  footer: { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f5ede4' },
  footerText: { fontSize: '11px', color: '#9a7a85', margin: '0' },
}

export default function PractitionerNotificationEmail({
  firstName, lastName, service, date, phone, email, message,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={s.body}>
        <div style={s.wrap}>
          <Section style={s.header}>
            <Heading style={s.logo}>NB THERAPY — Nouvelle réservation</Heading>
          </Section>
          <Section style={s.body2}>
            <Heading as="h2" style={s.h2}>Nouvelle demande de rendez-vous</Heading>
            <Section style={s.box}>
              <Text style={s.label}>Client</Text>
              <Text style={s.value}>{firstName} {lastName}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Service</Text>
              <Text style={s.value}>{service}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Date souhaitée</Text>
              <Text style={s.value}>
                {format(new Date(date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Téléphone WhatsApp</Text>
              <Text style={s.value}>{phone}</Text>
              <Hr style={s.hr} />
              <Text style={s.label}>Email</Text>
              <Text style={s.value}>{email}</Text>
              {message && (
                <>
                  <Hr style={s.hr} />
                  <Text style={s.label}>Message</Text>
                  <Text style={{ ...s.value, margin: '0' }}>{message}</Text>
                </>
              )}
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
