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

export function deriveColors(accentHex, textColorHex, bgHex = '#F0EBE3') {
  const [h, s]    = hexToHsl(accentHex)
  const [th, ts, tl] = hexToHsl(textColorHex)
  const [,, bgL] = hexToHsl(bgHex)

  // textSub: 텍스트 색 기준으로 밝기 조정해 muted 느낌
  const textSubL = tl > 50
    ? Math.max(tl - 22, 35)   // 밝은 글자 → 약간 어둡게
    : Math.min(tl + 22, 65)   // 어두운 글자 → 약간 밝게
  const textSub = hslToHex(th, Math.max(ts - 5, 0), textSubL)

  // sub: 배경색/플레이스홀더용 — 텍스트 밝기 기준
  const sub = tl > 50
    ? hslToHex(h, Math.max(s - 10, 5), 28)
    : hslToHex(h, Math.min(s + 5, 60), 80)

  const [,, al] = hexToHsl(accentHex)
  const accentContrast = al > 58 ? '#2C2825' : '#FFFFFF'

  // 날짜 텍스트: 배경과 글자색이 동시에 밝으면 강제로 어두운 색 사용
  const dateText = (tl > 75 && bgL > 60)
    ? hslToHex(th, Math.min(ts + 5, 30), 20)
    : textColorHex

  return { text: textColorHex, dateText, textSub, accent: accentHex, sub, accentContrast }
}

export function applyCssVars(colors) {
  const root = document.documentElement
  root.style.setProperty('--color-text',      colors.text)
  root.style.setProperty('--color-text-sub',  colors.textSub)
  root.style.setProperty('--color-date-text', colors.dateText || colors.text)
  root.style.setProperty('--color-accent',          colors.accent)
  root.style.setProperty('--color-accent-contrast', colors.accentContrast)
  root.style.setProperty('--color-sub',       colors.sub)
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
