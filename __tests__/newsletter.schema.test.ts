import { describe, it, expect } from 'vitest'
import { subscribeSchema } from '@/lib/validation/newsletter.schema'

describe('subscribeSchema', () => {
  it('passes for a valid email', () => {
    const result = subscribeSchema.safeParse({ email: 'student@srmist.edu.in' })
    expect(result.success).toBe(true)
  })

  it('fails for an invalid email format', () => {
    const result = subscribeSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('fails when email is missing', () => {
    const result = subscribeSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails for an empty string email', () => {
    const result = subscribeSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})
