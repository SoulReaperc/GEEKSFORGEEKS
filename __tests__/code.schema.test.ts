import { describe, it, expect } from 'vitest'
import { codeRequestSchema } from '@/lib/validation/code.schema'

describe('codeRequestSchema', () => {
  it('passes for a valid payload', () => {
    const result = codeRequestSchema.safeParse({
      code: 'const x = 1;',
      language: 'javascript',
      problemSlug: 'two-sum',
    })
    expect(result.success).toBe(true)
  })

  it('fails when code is empty', () => {
    const result = codeRequestSchema.safeParse({
      code: '',
      language: 'python',
      problemSlug: 'two-sum',
    })
    expect(result.success).toBe(false)
  })

  it('fails for an unsupported language', () => {
    const result = codeRequestSchema.safeParse({
      code: 'puts "hello"',
      language: 'ruby',
      problemSlug: 'two-sum',
    })
    expect(result.success).toBe(false)
  })

  it('fails when code exceeds 50KB', () => {
    const result = codeRequestSchema.safeParse({
      code: 'x'.repeat(50_001),
      language: 'python',
      problemSlug: 'two-sum',
    })
    expect(result.success).toBe(false)
  })

  it('fails for an invalid problem slug format', () => {
    const result = codeRequestSchema.safeParse({
      code: 'x = 1',
      language: 'python',
      problemSlug: 'invalid slug!',
    })
    expect(result.success).toBe(false)
  })
})
