import { describe, it, expect, vi, beforeEach } from 'vitest'
import { state, setState, subscribe } from './state.js'

describe('state', () => {
  beforeEach(() => {
    setState({ title: '', author: '' })
  })

  it('initial state has required fields', () => {
    expect(state.title).toBe('')
    expect(state.ratio).toBe('9:16')
    expect(state.theme).toBe('light')
    expect(state.font).toBe('modern')
    expect(state.bgColor).toBe('#F0EBE3')
    expect(state.ratingEnabled).toBe(true)
    expect(state.quoteEnabled).toBe(true)
  })

  it('setState merges partial update', () => {
    setState({ title: '채식주의자' })
    expect(state.title).toBe('채식주의자')
    expect(state.ratio).toBe('9:16') // unchanged
  })

  it('subscribe callback fires on setState', () => {
    const cb = vi.fn()
    const unsub = subscribe(cb)
    setState({ author: '한강' })
    expect(cb).toHaveBeenCalledWith(state)
    unsub()
    setState({ author: '다른작가' })
    expect(cb).toHaveBeenCalledTimes(1) // not called after unsub
  })
})
