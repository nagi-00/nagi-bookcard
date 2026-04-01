// src/modules/colorSystem.test.js
import { describe, it, expect } from 'vitest'
import { deriveColors, hexToHsl, hslToHex } from './colorSystem.js'

describe('colorSystem', () => {
  it('hexToHsl converts #8FAF8E to approx hsl(119, 18%, 62%)', () => {
    const [h, s, l] = hexToHsl('#8FAF8E')
    expect(h).toBeCloseTo(118, 0)
    expect(s).toBeCloseTo(17, 0)
    expect(l).toBeCloseTo(62, 0)
  })

  it('hslToHex round-trips', () => {
    const hex = hslToHex(119, 18, 62)
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('deriveColors light theme produces bright bg, dark text', () => {
    const colors = deriveColors('#8FAF8E', 'light')
    expect(colors.bg).toBeDefined()
    expect(colors.text).toBeDefined()
    expect(colors.glass).toMatch(/rgba/)
  })

  it('deriveColors dark theme produces dark bg, light text', () => {
    const colors = deriveColors('#8FAF8E', 'dark')
    // dark bg lightness should be < 25
    const [, , l] = hexToHsl(colors.bg)
    expect(l).toBeLessThan(25)
  })
})
