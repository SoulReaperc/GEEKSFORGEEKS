import { describe, it, expect } from 'vitest'
import { updateProfileSchema, godModeSchema } from '@/lib/validation/admin.schema'

describe('updateProfileSchema', () => {
  it('passes for a valid updateProfile payload', () => {
    const result = updateProfileSchema.safeParse({
      bio: 'Software engineer passionate about open source.',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/user',
        github: 'https://github.com/user',
      },
    })
    expect(result.success).toBe(true)
  })

  it('passes with no fields (all optional)', () => {
    const result = updateProfileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('fails when bio exceeds 2000 characters', () => {
    const result = updateProfileSchema.safeParse({ bio: 'x'.repeat(2001) })
    expect(result.success).toBe(false)
  })
})

describe('godModeSchema', () => {
  it('passes for a valid create action', () => {
    const result = godModeSchema.safeParse({
      action: 'create',
      contentType: 'event',
      data: { title: { 'en-US': 'New Event' } },
    })
    expect(result.success).toBe(true)
  })

  it('passes for update, delete, and publish actions', () => {
    for (const action of ['update', 'delete', 'publish'] as const) {
      const result = godModeSchema.safeParse({ action, entryId: 'abc123' })
      expect(result.success).toBe(true)
    }
  })

  it('fails for an invalid action', () => {
    const result = godModeSchema.safeParse({ action: 'invalidAction' })
    expect(result.success).toBe(false)
  })
})
