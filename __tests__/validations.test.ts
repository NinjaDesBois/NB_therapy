import { bookingSchema, questionnaireSchema } from '@/lib/validations'

describe('bookingSchema', () => {
  const valid = {
    firstName: 'Amira',
    lastName: 'Benali',
    phone: '0496/93 42 34',
    email: 'amira@example.com',
    service: 'Hijama',
    date: '2099-06-15', // far future, not a Sunday
    time: '10:00',
    message: '',
    acceptQuestionnaire: true as const,
  }

  it('accepts a valid booking', () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing firstName', () => {
    const result = bookingSchema.safeParse({ ...valid, firstName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid Belgian phone', () => {
    const result = bookingSchema.safeParse({ ...valid, phone: '123456789' })
    expect(result.success).toBe(false)
  })

  it('accepts phone with spaces', () => {
    expect(bookingSchema.safeParse({ ...valid, phone: '0496 93 42 34' }).success).toBe(true)
  })

  it('accepts phone without separators', () => {
    expect(bookingSchema.safeParse({ ...valid, phone: '0496934234' }).success).toBe(true)
  })

  it('rejects a Sunday date (2099-06-14 is a Sunday)', () => {
    // 2099-06-14 is a Sunday
    const result = bookingSchema.safeParse({ ...valid, date: '2099-06-14' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const dateErrors = result.error.flatten().fieldErrors.date
      expect(dateErrors?.some((e) => e.includes('dimanches'))).toBe(true)
    }
  })

  it('rejects a past date', () => {
    const result = bookingSchema.safeParse({ ...valid, date: '2000-01-01' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const dateErrors = result.error.flatten().fieldErrors.date
      expect(dateErrors?.some((e) => e.includes('futur'))).toBe(true)
    }
  })

  it('rejects invalid service', () => {
    const result = bookingSchema.safeParse({ ...valid, service: 'Invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects when acceptQuestionnaire is false', () => {
    const result = bookingSchema.safeParse({ ...valid, acceptQuestionnaire: false as never })
    expect(result.success).toBe(false)
  })
})

describe('questionnaireSchema', () => {
  it('accepts a valid questionnaire', () => {
    const result = questionnaireSchema.safeParse({
      pathologies: 'Aucune',
      medications: 'Aucun',
      allergies: 'Aucune',
      pregnant: 'non',
      contraindications: '',
      additionalInfo: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid pregnant value', () => {
    const result = questionnaireSchema.safeParse({ pregnant: 'maybe' })
    expect(result.success).toBe(false)
  })
})
