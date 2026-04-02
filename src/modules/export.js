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
  if (!navigator.clipboard?.write) {
    throw new Error('이 브라우저는 클립보드 복사를 지원하지 않습니다')
  }
  // Pass Promise<Blob> directly so clipboard.write() fires within the user gesture
  const blobPromise = toPng(cardScene, PNG_OPTIONS)
    .then(dataUrl => fetch(dataUrl))
    .then(res => res.blob())
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blobPromise })
  ])
}
