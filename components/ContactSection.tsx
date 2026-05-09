const contacts = [
  {
    label: 'WhatsApp',
    value: '0496/93 42 34',
    href: 'https://wa.me/32496934234',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'nbtherapy07@gmail.com',
    href: 'mailto:nbtherapy07@gmail.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    value: '_nb.therapy_',
    href: 'https://instagram.com/_nb.therapy_',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function ContactSection() {
  return (
    <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-14">
          <p className="font-body text-xs text-text-light tracking-[3px] uppercase mb-4">
            Restons en contact
          </p>
          <h2 className="font-display font-light text-text text-4xl">
            Nous joindre
          </h2>
          <div className="w-16 h-px bg-rose-deep mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center border border-cream-dark p-8 hover:border-rose-deep transition-colors duration-300 bg-cream"
            >
              <span className="text-text-light group-hover:text-text transition-colors duration-300 mb-4">
                {c.icon}
              </span>
              <p className="font-body text-xs text-text-light tracking-[2px] uppercase mb-2">
                {c.label}
              </p>
              <p className="font-display font-light text-text text-lg">
                {c.value}
              </p>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
