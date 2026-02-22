import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/server before any imports that use it
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

// Mock auth service — factory is hoisted, so we define AuthError inside it
vi.mock('@/lib/services/auth.service', () => {
  class AuthError extends Error {
    statusCode: number
    constructor(message: string, statusCode = 401) {
      super(message)
      this.name = 'AuthError'
      this.statusCode = statusCode
    }
  }
  return {
    AuthError,
    requireAuth: vi.fn(),
    requireAdmin: vi.fn(),
    isSuperAdmin: vi.fn(),
  }
})

import { withAuth, withAdmin } from '@/lib/middleware/with-auth'
import { requireAuth, requireAdmin, AuthError } from '@/lib/services/auth.service'

const mockRequireAuth = vi.mocked(requireAuth)
const mockRequireAdmin = vi.mocked(requireAdmin)

const mockUser = { id: 'user-1', email: 'test@example.com' }
const mockRequest = new Request('http://localhost/api/test', { method: 'POST' })
const mockCtx = { params: Promise.resolve({}) }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('withAuth', () => {
  it('calls the handler with the authenticated user when auth succeeds', async () => {
    mockRequireAuth.mockResolvedValue(mockUser)
    const handler = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))

    const wrapped = withAuth(handler)
    const response = await wrapped(mockRequest, mockCtx)

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith(mockRequest, mockUser, mockCtx)
    expect(response.status).toBe(200)
  })

  it('returns 401 JSON when requireAuth throws AuthError', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError('Unauthorized'))
    const handler = vi.fn()

    const wrapped = withAuth(handler)
    const response = await wrapped(mockRequest, mockCtx)

    expect(handler).not.toHaveBeenCalled()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('does not call the handler when auth fails', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError('Unauthorized'))
    const handler = vi.fn()

    await withAuth(handler)(mockRequest, mockCtx)
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('withAdmin', () => {
  it('calls the handler with the admin user when requireAdmin succeeds', async () => {
    mockRequireAdmin.mockResolvedValue(mockUser)
    const handler = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))

    const wrapped = withAdmin(handler)
    const response = await wrapped(mockRequest, mockCtx)

    expect(handler).toHaveBeenCalledWith(mockRequest, mockUser, mockCtx)
    expect(response.status).toBe(200)
  })

  it('returns 401 when requireAdmin throws AuthError (not authenticated)', async () => {
    mockRequireAdmin.mockRejectedValue(new AuthError('Unauthorized'))
    const handler = vi.fn()

    const wrapped = withAdmin(handler)
    const response = await wrapped(mockRequest, mockCtx)

    expect(handler).not.toHaveBeenCalled()
    expect(response.status).toBe(401)
  })
})
