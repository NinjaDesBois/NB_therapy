export default function QuoteSection() {
  return (
    <section className="bg-cream-dark py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-12 h-px bg-gold mx-auto mb-10" />
        <blockquote className="font-display font-light italic text-text text-2xl md:text-3xl leading-relaxed">
          &ldquo;Parce que vous méritez de vous sentir bien,{' '}
          de l&apos;intérieur comme à l&apos;extérieur.&rdquo;
        </blockquote>
        <div className="w-12 h-px bg-gold mx-auto mt-10" />
      </div>
    </section>
  )
}
