// src/modules/export.js
import { toPng } from 'html-to-image'

const SCALE = 3
const PNG_OPTIONS = {
  pixelRatio: SCALE, skipFonts: false, cacheBust: true,
  filter: node => !node.classList?.contains('preview-only'),
}

// backdrop-filter는 html-to-image가 캡처 못함 → canvas blur로 구워서 대체
async function bakeGlassEffect(cardScene) {
  const glassEls = [...cardScene.querySelectorAll('.card-glass, .card-tab')]
  if (!glassEls.length) return () => {}

  const W = cardScene.offsetWidth
  const H = cardScene.offsetHeight
  const sceneRect = cardScene.getBoundingClientRect()
  const cssScale  = sceneRect.width / W
  const filterFn  = node => !node.classList?.contains('preview-only')

  glassEls.forEach(el => { el.style.visibility = 'hidden' })
  const bgUrl = await toPng(cardScene, { pixelRatio: 1, skipFonts: false, cacheBust: true, filter: filterFn })
  glassEls.forEach(el => { el.style.visibility = '' })

  const bgImg = await new Promise(resolve => {
    const img = new Image(); img.onload = () => resolve(img); img.src = bgUrl
  })

  const restoreFns = []
  const blurPx = parseFloat(getComputedStyle(cardScene).getPropertyValue('--glass-blur')) || 14

  for (const el of glassEls) {
    const elRect = el.getBoundingClientRect()
    const elX = (elRect.left - sceneRect.left) / cssScale
    const elY = (elRect.top  - sceneRect.top)  / cssScale
    const elW = Math.round(elRect.width  / cssScale)
    const elH = Math.round(elRect.height / cssScale)
    if (elW <= 0 || elH <= 0) continue

    const PAD  = Math.ceil(blurPx * 1.5)
    const srcX = Math.max(0, elX - PAD)
    const srcY = Math.max(0, elY - PAD)
    const srcW = Math.min(W - srcX, elW + PAD * 2)
    const srcH = Math.min(H - srcY, elH + PAD * 2)

    const tmp = document.createElement('canvas')
    tmp.width = srcW; tmp.height = srcH
    tmp.getContext('2d').drawImage(bgImg, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

    const blurred = document.createElement('canvas')
    blurred.width = srcW; blurred.height = srcH
    const bctx = blurred.getContext('2d')
    bctx.filter = `blur(${blurPx}px) saturate(1.8) brightness(1.04)`
    bctx.drawImage(tmp, 0, 0)

    const final = document.createElement('canvas')
    final.width = elW; final.height = elH
    const fctx  = final.getContext('2d')
    const cropX = Math.min(PAD, Math.round(elX))
    const cropY = Math.min(PAD, Math.round(elY))
    fctx.drawImage(blurred, cropX, cropY, elW, elH, 0, 0, elW, elH)

    const bakedUrl       = final.toDataURL('image/png')
    const computedGradient = getComputedStyle(el).backgroundImage
    const saved = {
      backgroundImage:    el.style.backgroundImage,
      backgroundSize:     el.style.backgroundSize,
      backdropFilter:     el.style.backdropFilter,
      webkitBackdropFilter: el.style.webkitBackdropFilter,
    }
    const hasGradient = computedGradient && computedGradient !== 'none'
    el.style.backgroundImage      = hasGradient ? `${computedGradient}, url("${bakedUrl}")` : `url("${bakedUrl}")`
    el.style.backgroundSize       = hasGradient ? 'auto, 100% 100%' : '100% 100%'
    el.style.backdropFilter       = 'none'
    el.style.webkitBackdropFilter = 'none'
    restoreFns.push(() => Object.assign(el.style, saved))
  }

  return () => restoreFns.forEach(fn => fn())
}

// 캡처된 이미지를 지정 영역으로 자르기
async function cropDataUrl(dataUrl, x, y, w, h) {
  const img = await new Promise(r => {
    const i = new Image(); i.onload = () => r(i); i.src = dataUrl
  })
  const c = document.createElement('canvas')
  c.width  = Math.round(w)
  c.height = Math.round(h)
  c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h)
  return c.toDataURL('image/png')
}

export async function exportToPng(scene, cropRect) {
  const restore = await bakeGlassEffect(scene)
  try {
    const full   = await toPng(scene, PNG_OPTIONS)
    const sc     = SCALE
    const dataUrl = await cropDataUrl(full, cropRect.x*sc, cropRect.y*sc, cropRect.w*sc, cropRect.h*sc)
    const link = document.createElement('a')
    link.download = `bookcard-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    restore()
  }
}

export async function exportToClipboard(scene, cropRect) {
  if (!navigator.clipboard?.write) throw new Error('이 브라우저는 클립보드 복사를 지원하지 않습니다')
  const restore = await bakeGlassEffect(scene)
  try {
    const full    = await toPng(scene, PNG_OPTIONS)
    const sc      = SCALE
    const dataUrl = await cropDataUrl(full, cropRect.x*sc, cropRect.y*sc, cropRect.w*sc, cropRect.h*sc)
    const blob    = await fetch(dataUrl).then(r => r.blob())
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  } finally {
    restore()
  }
}
