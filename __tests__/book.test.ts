import { POST } from '@/app/api/book/route'
import { prisma } from '@/lib/prisma'
import * as emailLib from '@/lib/email'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue({}),
  sendPractitionerNotification: jest.fn().mockResolvedValue({}),
  sendQuestionnaireEmail: jest.fn().mockResolvedValue({}),
}))

const mockCreate = prisma.appointment.create as jest.Mock

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  firstName: 'Amira',
  lastName: 'Benali',
  phone: '0496934234',
  email: 'amira@example.com',
  service: 'Hijama',
  date: '2099-06-15',
  time: '10:00',
  message: '',
  acceptQuestionnaire: true,
}

describe('POST /api/book', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue({
      id: 'test-id',
      token: 'test-token',
      ...validBody,
      date: new Date('2099-06-15T10:00:00'),
      status: 'PENDING',
    })
  })

  it('returns 201 and creates appointment for valid body', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('sends confirmation, practitioner, and questionnaire emails', async () => {
    await POST(makeRequest(validBody))
    expect(emailLib.sendConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(emailLib.sendPractitionerNotification).toHaveBeenCalledTimes(1)
    expect(emailLib.sendQuestionnaireEmail).toHaveBeenCalledTimes(1)
  })

  it('returns 400 for invalid body', async () => {
    const res = await POST(makeRequest({ firstName: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for Sunday date', async () => {
    const res = await POST(makeRequest({ ...validBody, date: '2099-06-14' }))
    expect(res.status).toBe(400)
  })
})
