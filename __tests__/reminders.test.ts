import { GET } from '@/app/api/cron/reminders/route'
import { prisma } from '@/lib/prisma'
import * as emailLib from '@/lib/email'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  sendReminderEmail: jest.fn().mockResolvedValue({}),
  sendRecommendationsEmail: jest.fn().mockResolvedValue({}),
}))

const mockFindMany = prisma.appointment.findMany as jest.Mock
const mockUpdate = prisma.appointment.update as jest.Mock

const CRON_SECRET = 'test-secret'
process.env.CRON_SECRET = CRON_SECRET

function makeRequest(auth?: string) {
  return new Request('http://localhost/api/cron/reminders', {
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  })
}

const mockAppt = {
  id: 'appt-1',
  firstName: 'Amira',
  lastName: 'Benali',
  email: 'a@test.com',
  phone: '0496934234',
  service: 'Hijama',
  date: new Date(),
  token: 'tok',
}

describe('GET /api/cron/reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindMany.mockResolvedValue([])
    mockUpdate.mockResolvedValue({})
  })

  it('returns 401 without auth', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 with wrong secret', async () => {
    const res = await GET(makeRequest('wrong'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with correct secret', async () => {
    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)
  })

  it('sends reminder emails and updates DB', async () => {
    mockFindMany
      .mockResolvedValueOnce([mockAppt])  // 48h query
      .mockResolvedValueOnce([])           // 24h query

    await GET(makeRequest(CRON_SECRET))
    expect(emailLib.sendReminderEmail).toHaveBeenCalledWith(mockAppt)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'appt-1' },
      data: { reminderSent: true },
    })
  })

  it('sends recommendation emails and updates DB', async () => {
    mockFindMany
      .mockResolvedValueOnce([])           // 48h query
      .mockResolvedValueOnce([mockAppt])   // 24h query

    await GET(makeRequest(CRON_SECRET))
    expect(emailLib.sendRecommendationsEmail).toHaveBeenCalledWith(mockAppt)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'appt-1' },
      data: { recommendationSent: true },
    })
  })

  it('returns counts in response body', async () => {
    mockFindMany
      .mockResolvedValueOnce([mockAppt])
      .mockResolvedValueOnce([mockAppt])

    const res = await GET(makeRequest(CRON_SECRET))
    const data = await res.json()
    expect(data.reminders).toBe(1)
    expect(data.recommendations).toBe(1)
  })
})
