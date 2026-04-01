// src/modules/export.js
import { toPng } from 'html-to-image'

const SCALE = 3 // 고해상도 출력

export async function exportToPng(cardScene) {
  const blob = await toPng(cardScene, {
    pixelRatio: SCALE,
    skipFonts: false,
    cacheBust: true,
  })
  const link = document.createElement('a')
  link.download = `bookcard-${Date.now()}.png`
  link.href = blob
  link.click()
}

export async function exportToClipboard(cardScene) {
  const dataUrl = await toPng(cardScene, {
    pixelRatio: SCALE,
    skipFonts: false,
    cacheBust: true,
  })
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ])
}
