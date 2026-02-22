import { describe, it, expect } from 'vitest'
import { CircuitBreaker, CircuitOpenError } from '@/lib/utils/circuit-breaker'

describe('CircuitBreaker', () => {
  it('starts in closed state', () => {
    const cb = new CircuitBreaker()
    expect(cb.getState()).toBe('closed')
  })

  it('passes calls through when closed', async () => {
    const cb = new CircuitBreaker()
    const result = await cb.execute(async () => 'success')
    expect(result).toBe('success')
  })

  it('opens after reaching the failure threshold', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 60_000 })

    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(async () => { throw new Error('fail') })).rejects.toThrow('fail')
    }

    expect(cb.getState()).toBe('open')
  })

  it('throws CircuitOpenError when the circuit is open', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 60_000 })

    // trip the circuit
    for (let i = 0; i < 2; i++) {
      await expect(cb.execute(async () => { throw new Error('fail') })).rejects.toThrow()
    }

    // now it should be open
    await expect(cb.execute(async () => 'blocked')).rejects.toThrow(CircuitOpenError)
  })

  it('resets to closed on success after being tripped', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 })

    // trip the circuit
    await expect(cb.execute(async () => { throw new Error('fail') })).rejects.toThrow()

    // wait for reset timeout to expire (0ms) then force half-open check
    await cb.execute(async () => 'recovered')
    expect(cb.getState()).toBe('closed')
  })
})
