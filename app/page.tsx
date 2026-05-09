import Hero from '@/components/Hero'
import Services from '@/components/Services'
import QuoteSection from '@/components/QuoteSection'
import BookingForm from '@/components/BookingForm'
import ContactSection from '@/components/ContactSection'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <QuoteSection />

      {/* Booking section */}
      <section id="reserver" className="bg-cream py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
              Réservation en ligne
            </p>
            <h2 className="font-display font-light text-text text-4xl md:text-5xl">
              Prendre rendez-vous
            </h2>
            <div className="w-16 h-px bg-rose-deep mx-auto mt-6 mb-4" />
            <p className="font-body font-light text-text-light text-sm leading-relaxed">
              Remplissez le formulaire ci-dessous. Nous vous contacterons pour
              confirmer votre rendez-vous dans les plus brefs délais.
            </p>
          </div>
          <BookingForm />
        </div>
      </section>

      <ContactSection />

      {/* Footer */}
      <footer className="bg-text py-10 px-6 text-center">
        <p className="font-display font-light italic text-cream text-xl mb-2">NB Therapy</p>
        <p className="font-body text-xs text-text-light tracking-[2px] uppercase">
          Belgique · Soins bien-être · Réservé aux femmes
        </p>
      </footer>
    </main>
  )
}
