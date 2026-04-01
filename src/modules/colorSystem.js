// src/modules/colorSystem.js

export function hexToHsl(hex) {
  hex = hex.toLowerCase()
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export function deriveColors(accentHex, theme) {
  const [h, s] = hexToHsl(accentHex)

  if (theme === 'light') {
    const bg    = hslToHex(h, Math.max(s - 10, 5), 93)
    const glass = `rgba(245,241,235,0.60)`
    const text  = hslToHex(h, 20, 14)
    const textSub = hslToHex(h, 10, 52)
    const accent  = accentHex
    const sub   = hslToHex(h, Math.min(s + 5, 60), 80)
    return { bg, glass, text, textSub, accent, sub }
  } else {
    const bg    = hslToHex(h, Math.min(s, 20), 12)
    const glass = `rgba(18,22,38,0.68)`
    const text  = hslToHex(h, 10, 90)
    const textSub = hslToHex(h, 8, 55)
    const accent  = accentHex
    const sub   = hslToHex(h, Math.max(s - 10, 5), 30)
    return { bg, glass, text, textSub, accent, sub }
  }
}

export function applyCssVars(colors) {
  const root = document.documentElement
  root.style.setProperty('--color-bg', colors.bg)
  root.style.setProperty('--color-glass', colors.glass)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-sub', colors.textSub)
  root.style.setProperty('--color-accent', colors.accent)
  root.style.setProperty('--color-sub', colors.sub)
}

export async function pickColorWithEyeDropper() {
  if (!window.EyeDropper) return null
  try {
    const eyeDropper = new EyeDropper()
    const result = await eyeDropper.open()
    return result.sRGBHex
  } catch {
    return null
  }
}
