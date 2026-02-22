import { describe, it, expect } from 'vitest'
import { countEffectiveLOC, calculateScore } from '@/lib/services/grading.service'

describe('countEffectiveLOC', () => {
  it('counts non-empty, non-comment lines in Python code', () => {
    const code = `# This is a comment
x = 1
y = 2
# Another comment

z = x + y`
    expect(countEffectiveLOC(code, 'python')).toBe(3)
  })

  it('counts non-empty, non-comment lines in JavaScript code', () => {
    const code = `// single line comment
const x = 1;
/* multi
   line comment */
const y = 2;`
    expect(countEffectiveLOC(code, 'javascript')).toBe(2)
  })

  it('counts non-empty, non-comment lines in C++ code', () => {
    const code = `// header comment
#include <iostream>
/* block
   comment */
int main() {
  return 0;
}`
    expect(countEffectiveLOC(code, 'cpp')).toBe(4)
  })

  it('returns 0 for empty string', () => {
    expect(countEffectiveLOC('', 'python')).toBe(0)
  })

  it('returns 0 for only-comment code', () => {
    expect(countEffectiveLOC('# just a comment\n# another', 'python')).toBe(0)
  })
})

describe('calculateScore', () => {
  it('returns expected output shape (totalScore, speedScore, locScore)', async () => {
    const result = await calculateScore({
      difficulty: 'easy',
      execution_time_ms: 1,
      code: 'x = 1',
      optimal_loc: 10,
    })
    expect(result).toHaveProperty('total_score')
    expect(result).toHaveProperty('max_marks')
    expect(result.details).toHaveProperty('execution_speed')
    expect(result.details).toHaveProperty('lines_of_code')
    expect(result.details.execution_speed).toHaveProperty('score')
    expect(result.details.lines_of_code).toHaveProperty('score')
  })

  it('gives higher score for faster runtime', async () => {
    const fastResult = await calculateScore({
      difficulty: 'easy',
      execution_time_ms: 1,
      code: 'x = 1',
      optimal_loc: 10,
    })
    const slowResult = await calculateScore({
      difficulty: 'easy',
      execution_time_ms: 5,
      code: 'x = 1',
      optimal_loc: 10,
    })
    expect(fastResult.total_score).toBeGreaterThan(slowResult.total_score)
  })

  it('returns correct max_marks for each difficulty', async () => {
    const easy = await calculateScore({ difficulty: 'easy', execution_time_ms: 1, code: 'x=1', optimal_loc: 1 })
    const medium = await calculateScore({ difficulty: 'medium', execution_time_ms: 1, code: 'x=1', optimal_loc: 1 })
    const hard = await calculateScore({ difficulty: 'hard', execution_time_ms: 1, code: 'x=1', optimal_loc: 1 })
    expect(easy.max_marks).toBe(10)
    expect(medium.max_marks).toBe(20)
    expect(hard.max_marks).toBe(30)
  })
})
