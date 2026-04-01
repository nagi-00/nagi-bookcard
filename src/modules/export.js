// src/modules/export.js
import { toPng } from 'html-to-image'

const SCALE = 3 // 고해상도 출력
const PNG_OPTIONS = { pixelRatio: SCALE, skipFonts: false, cacheBust: true }

export async function exportToPng(cardScene) {
  try {
    const dataUrl = await toPng(cardScene, PNG_OPTIONS)
    const link = document.createElement('a')
    link.download = `bookcard-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    throw new Error(`PNG 저장에 실패했습니다: ${err.message}`)
  }
}

export async function exportToClipboard(cardScene) {
  try {
    const dataUrl = await toPng(cardScene, PNG_OPTIONS)
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
  } catch (err) {
    throw new Error(`클립보드 복사에 실패했습니다: ${err.message}`)
  }
}
