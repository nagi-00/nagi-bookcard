// src/modules/card.js
import { state } from '../state.js'
import { escapeHTML } from './util.js'

const CARD_MARGIN = 24

// 카드 레이아웃은 이 기준 캔버스 크기를 기반으로 계산 (screenRatio 변경에 독립적)
const CARD_REF_CANVAS = {
  '9:16': [360, 640],
  '3:4':  [360, 480],
  '1:1':  [360, 360],
  '4:3':  [480, 360],
  '16:9': [640, 360],
}

export function resetCardOffset() {
  state.cardOffsetX = 0
  state.cardOffsetY = 0
  state.cardScale   = 1.0
}

function formatDate(date) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const d = date.getDate()
  const pills = [-2,-1,0,1,2].map(offset => {
    const dd = new Date(date); dd.setDate(d + offset)
    return { num: dd.getDate(), today: offset === 0 }
  })
  return { day: days[date.getDay()], pills }
}

function formatTime(date) {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDateTag(date) {
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`
}

function buildDateRowHTML(date) {
  const { day, pills } = formatDate(date)
  const pillsHTML = pills.map(p =>
    `<span class="d${p.today ? ' today' : ''}">${p.num}</span>`
  ).join('')
  return `
    <div class="date-row">
      <span class="day-label">${day}</span>
      <div class="date-pills">${pillsHTML}</div>
    </div>`
}

function buildStarsHTML(rating) {
  return Array.from({length:5}, (_,i) =>
    `<span class="star${i < rating ? ' on' : ''}" data-idx="${i}">★</span>`
  ).join('')
}

function buildCardContentHTML() {
  const { title, author, quote, quoteEnabled, rating, ratingEnabled, publisher, pages, dateEnabled } = state
  const hasDate = dateEnabled !== false && state.date
  const rawDate = hasDate
    ? (state.date instanceof Date ? state.date : new Date(state.date))
    : null
  const date = rawDate && !isNaN(rawDate.getTime()) ? rawDate : null

  const pubMeta = [
    publisher ? escapeHTML(publisher) : '',
    pages     ? escapeHTML(String(pages)) + 'p' : '',
  ].filter(Boolean).join(' · ')

  const timeStr = date ? formatTime(date) : ''
  const dateTag = date ? formatDateTag(date) : ''

  return `
    <div class="card-content-inner">
      <div class="info-wrap">
        ${date ? buildDateRowHTML(date) : ''}
        <div class="book-title">${escapeHTML(title) || 'Title'}</div>
        <div class="book-author">${escapeHTML(author) || 'Author'}</div>
        ${ratingEnabled ? `<div class="star-row">${buildStarsHTML(rating)}</div>` : ''}
        ${quoteEnabled && quote ? `<div class="quote-block">${escapeHTML(quote)}</div>` : ''}
        <div class="card-bottom" style="margin-top:auto;">
          <div class="bottom-right">
            ${pubMeta ? `<span class="pub-label">${pubMeta}</span>` : ''}
            ${date ? `<span class="time-label">${timeStr} · ${dateTag}</span>` : ''}
          </div>
        </div>
      </div>
    </div>`
}

// ── 카드 레이아웃 계산 (cardRatio 기준, screenRatio와 독립) ──
function getCardLayout(W, H) {
  const cardRatio = state.cardRatio || '9:16'
  const [crW, crH] = cardRatio.split(':').map(Number)
  const portrait = crH >= crW

  // 카드/북 크기는 기준 캔버스 기준으로 고정 → screenRatio 변경 시 크기 불변
  const [refW, refH] = CARD_REF_CANVAS[cardRatio] || [360, 640]

  if (portrait) {
    const maxFW = refW - CARD_MARGIN * 2
    const maxFH = Math.round(refH * 0.70)
    let fW = maxFW
    let fH = Math.round(fW * crH / crW)
    if (fH > maxFH) { fH = maxFH; fW = Math.round(fH * crW / crH) }
    fW = Math.round(fW); fH = Math.round(fH)
    let bookW = Math.round(fW * 0.30)
    let bookH = Math.round(bookW * 1.42)

    // 캔버스가 너무 작으면 비율 유지하며 축소
    const needH = fH + CARD_MARGIN + bookH * 0.76
    const needW = fW + CARD_MARGIN * 2
    const sf = Math.min(1, (W - CARD_MARGIN * 2) / needW, H / needH)
    if (sf < 1) {
      fW = Math.round(fW * sf); fH = Math.round(fH * sf)
      bookW = Math.round(bookW * sf); bookH = Math.round(bookH * sf)
    }

    const fLeft = Math.round((W - fW) / 2)
    const overlapH = Math.round(bookH * 0.76)
    const compositionH = fH + overlapH
    const compositionTop = Math.max(8, Math.round((H - compositionH) / 2))
    const fTop = compositionTop + overlapH
    const bookCX = fLeft + Math.round(fW / 2)
    const bookCY = fTop  - Math.round(bookH * 0.26)
    const padTop = Math.round(bookH * 0.26 + 4)

    return { portrait: true, fW, fH, fLeft, fTop, bookW, bookH, bookCX, bookCY, padTop, padSide: 22, padBottom: 18 }
  } else {
    const maxFH = refH - CARD_MARGIN * 2
    const maxFW = Math.round(refW * 0.64)
    let fH = maxFH
    let fW = Math.round(fH * crW / crH)
    if (fW > maxFW) { fW = maxFW; fH = Math.round(fW * crH / crW) }
    fW = Math.round(fW); fH = Math.round(fH)
    let bookH = Math.round(fH * 0.60)
    let bookW = Math.round(bookH / 1.42)

    // 캔버스가 너무 작으면 축소
    const needH = fH + CARD_MARGIN * 2
    const needW = fW + CARD_MARGIN + bookW * 0.80
    const sf = Math.min(1, H / needH, W / needW)
    if (sf < 1) {
      fW = Math.round(fW * sf); fH = Math.round(fH * sf)
      bookW = Math.round(bookW * sf); bookH = Math.round(bookH * sf)
    }

    // 카드 + 책 구성 전체를 캔버스 중앙에 배치
    // 책 중심은 fLeft - bookW*0.20, 책 좌측 = fLeft - bookW*0.70
    // 구성 폭 = (fW + bookW*0.70), 중앙 정렬하려면 fLeft = (W - fW + bookW*0.70)/2
    const fTop  = Math.round((H - fH) / 2)
    const fLeft = Math.round((W - fW + bookW * 0.70) / 2)
    const bookCX = fLeft - Math.round(bookW * 0.20)
    const bookCY = fTop  + Math.round(fH / 2)
    const padTop = { '16:9': 14, '4:3': 18 }[cardRatio] ?? 16

    return { portrait: false, fW, fH, fLeft, fTop, bookW, bookH, bookCX, bookCY, padTop, padSide: 18, padBottom: 14 }
  }
}

function buildBooksHTML(layout) {
  const { portrait, bookCX, bookCY, bookW, bookH, fTop, fLeft } = layout
  const cardBodyTop  = portrait ? fTop : 0
  const cardBodyLeft = portrait ? 0    : fLeft

  return state.books.map(book => {
    const bW = Math.round(bookW * book.scale)
    const bH = Math.round(bookH * book.scale)
    const bX = Math.round(bookCX + book.x - bW / 2)
    const bY = Math.round(bookCY + book.y - bH / 2)

    const src = book.src
    const safeSrc = src ? escapeHTML(src) : ''
    const isRemote = src && /^https?:/i.test(src)
    const crossOrigin = isRemote ? ' crossorigin="anonymous" referrerpolicy="no-referrer"' : ''
    const imgSt = `width:${bW}px;height:${bH}px;object-fit:cover;display:block;`
    const imgBack  = src ? `<img src="${safeSrc}"${crossOrigin} style="${imgSt}" alt="">`
                        : `<div style="width:100%;height:100%;background:var(--color-sub);opacity:0.35;border-radius:4px;"></div>`

    const sA = Math.round((state.bookShadow ?? 1) * 28) / 100
    const sB = Math.round((state.bookShadow ?? 1) * 14) / 100
    const shadow = `0 16px 48px rgba(0,0,0,${sA}),0 4px 12px rgba(0,0,0,${sB})`

    return `
      <div class="book-back" data-id="${book.id}"
        data-base-cx="${bookCX}" data-base-cy="${bookCY}"
        data-base-w="${bookW}" data-base-h="${bookH}"
        data-bw="${bW}" data-bh="${bH}"
        style="position:absolute;z-index:2;top:${bY}px;left:${bX}px;width:${bW}px;height:${bH}px;overflow:hidden;border-radius:6px;box-shadow:${shadow};">${imgBack}</div>
      <div class="book-img-overlay preview-only" data-id="${book.id}"
        style="position:absolute;z-index:6;top:${bY}px;left:${bX}px;width:${bW}px;height:${bH}px;pointer-events:none;">
        <button class="book-img-btn book-edit-btn" data-id="${book.id}" style="pointer-events:auto;">✏</button>
        <button class="book-img-btn book-del-btn" data-id="${book.id}" style="pointer-events:auto;">✕</button>
      </div>`
  }).join('')
}

// ── 책 표지 드래그 + 줌 ──
export function initCoverDrag(scene) {
  if (!scene) return
  const layout = scene.dataset.layout
  if (!layout) return

  // Cancel any drag listeners from the previous render pass
  if (scene._dragAC) scene._dragAC.abort()
  const ac = new AbortController()
  scene._dragAC = ac
  const signal = ac.signal

  const cardBodyTop  = +scene.dataset.cardBodyTop  || 0
  const cardBodyLeft = +scene.dataset.cardBodyLeft || 0

  function getScale() {
    const rect = scene.getBoundingClientRect()
    return rect.width / scene.offsetWidth
  }
  function pointerPos(e) {
    const t = e.touches?.[0] ?? e
    return { x: t.clientX, y: t.clientY }
  }

  state.books.forEach(book => {
    const backEl  = scene.querySelector(`.book-back[data-id="${book.id}"]`)
    if (!backEl) return

    const baseCX = +backEl.dataset.baseCx
    const baseCY = +backEl.dataset.baseCy
    const baseW  = +backEl.dataset.baseW
    const baseH  = +backEl.dataset.baseH

    let dragStart   = null
    let lastTouches = null

    function applyTransform() {
      const bW = +backEl.dataset.bw
      const bH = +backEl.dataset.bh
      const bX = Math.round(baseCX + book.x - bW / 2)
      const bY = Math.round(baseCY + book.y - bH / 2)

      backEl.style.top  = bY + 'px'
      backEl.style.left = bX + 'px'

      const ovEl = scene.querySelector(`.book-img-overlay[data-id="${book.id}"]`)
      if (ovEl) {
        ovEl.style.top    = bY + 'px'
        ovEl.style.left   = bX + 'px'
        ovEl.style.width  = bW + 'px'
        ovEl.style.height = bH + 'px'
      }
    }

    function updateImgSize(newBW, newBH) {
      backEl.dataset.bw = newBW; backEl.dataset.bh = newBH
      backEl.style.width  = newBW + 'px'
      backEl.style.height = newBH + 'px'
      const bi = backEl.querySelector('img')
      if (bi) { bi.style.width = newBW + 'px'; bi.style.height = newBH + 'px' }
    }

    let rotating = false

    function onDown(e) {
      if (e.touches && e.touches.length >= 2) {
        lastTouches = Array.from(e.touches)
        dragStart = null
        return
      }
      e.preventDefault()
      e.stopPropagation()

      if (e.button === 2) {
        // Right-click: rotate mode
        rotating = true
        const bW = +backEl.dataset.bw, bH = +backEl.dataset.bh
        const bX = Math.round(baseCX + book.x - bW / 2)
        const bY = Math.round(baseCY + book.y - bH / 2)
        const sr = scene.getBoundingClientRect()
        const s  = getScale()
        const cx = sr.left + (bX + bW / 2) * s
        const cy = sr.top  + (bY + bH / 2) * s
        dragStart = {
          cx, cy,
          startRot:   book.rotation || 0,
          startAngle: Math.atan2(e.clientY - cy, e.clientX - cx),
        }
      } else {
        rotating = false
        const p = pointerPos(e)
        dragStart = { px: p.x, py: p.y, ox: book.x, oy: book.y }
      }

      backEl.style.cursor = rotating ? 'crosshair' : 'grabbing'
      document.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mouseup',    onUp,   { signal })
      document.addEventListener('touchmove',  onMove, { passive: false, signal })
      document.addEventListener('touchend',   onUp,   { signal })
    }

    function onMove(e) {
      e.preventDefault()
      const s = getScale()

      if (e.touches && e.touches.length >= 2 && lastTouches?.length >= 2) {
        const t0 = e.touches[0], t1 = e.touches[1]
        const l0 = lastTouches[0], l1 = lastTouches[1]
        const newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        const oldDist = Math.hypot(l1.clientX - l0.clientX, l1.clientY - l0.clientY)
        if (oldDist > 1) {
          book.scale = Math.max(0.3, Math.min(4, book.scale * (newDist / oldDist)))
          updateImgSize(Math.round(baseW * book.scale), Math.round(baseH * book.scale))
        }
        lastTouches = Array.from(e.touches)
        applyTransform()
        return
      }

      if (!dragStart) return
      const p = pointerPos(e)
      book.x = dragStart.ox + (p.x - dragStart.px) / s
      book.y = dragStart.oy + (p.y - dragStart.py) / s
      applyTransform()
    }

    function onUp(e) {
      if (e?.type === 'touchend' && (e.touches?.length ?? 0) >= 1) {
        lastTouches = Array.from(e.touches)
        return
      }
      dragStart = null; lastTouches = null
      backEl.style.cursor = 'grab'
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onUp)
    }

    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      const prev = book.scale
      book.scale = Math.max(0.3, Math.min(4, book.scale - e.deltaY * 0.001))
      if (Math.abs(book.scale - prev) < 0.0005) return
      updateImgSize(Math.round(baseW * book.scale), Math.round(baseH * book.scale))
      applyTransform()
    }

    backEl.style.cursor = 'grab'
    backEl.style.pointerEvents = 'auto'   // card-group pointer-events:none 오버라이드
    backEl.addEventListener('contextmenu', e => e.preventDefault(), { signal })
    backEl.addEventListener('mousedown',   onDown, { signal })
    backEl.addEventListener('touchstart',  onDown, { passive: false, signal })
    backEl.addEventListener('wheel',       onWheel, { passive: false, signal })
  })
}

// ── 카드(글래스 카드) 드래그 + 줌 ──
export function initCardDrag(scene) {
  const cardWrapper = scene.querySelector('.card-wrapper')
  const handle        = scene.querySelector('.card-drag-handle')
  if (!cardWrapper || !handle) return

  function getPreviewScale() {
    const rect = scene.getBoundingClientRect()
    return rect.width / scene.offsetWidth
  }

  function applyGroupTransform() {
    const ox = state.cardOffsetX || 0
    const oy = state.cardOffsetY || 0
    const s  = state.cardScale   || 1
    cardWrapper.style.transform = `translate(${ox}px,${oy}px) scale(${s})`
  }

  let dragStart = null

  function onDown(e) {
    if (e.touches && e.touches.length >= 2) return
    e.preventDefault()
    e.stopPropagation()
    const t = e.touches?.[0] ?? e
    dragStart = { px: t.clientX, py: t.clientY, ox: state.cardOffsetX || 0, oy: state.cardOffsetY || 0 }
    handle.style.cursor = 'grabbing'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend',  onUp)
  }

  function onMove(e) {
    e.preventDefault()
    if (!dragStart) return
    const t = e.touches?.[0] ?? e
    const s = getPreviewScale()
    state.cardOffsetX = dragStart.ox + (t.clientX - dragStart.px) / s
    state.cardOffsetY = dragStart.oy + (t.clientY - dragStart.py) / s
    applyGroupTransform()
  }

  function onUp() {
    dragStart = null
    handle.style.cursor = 'grab'
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup',   onUp)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend',  onUp)
  }

  handle.addEventListener('mousedown',  onDown)
  handle.addEventListener('touchstart', onDown, { passive: false })
  handle.addEventListener('wheel', e => {
    e.preventDefault()
    e.stopPropagation()
    state.cardScale = Math.max(0.3, Math.min(3, (state.cardScale || 1) - e.deltaY * 0.002))
    applyGroupTransform()
  }, { passive: false })
}

// ── 카드 렌더링 ──
export function renderCard(container, W, H) {
  const scene = container.querySelector('.card-scene') || document.createElement('div')

  scene.className = 'card-scene'
  scene.setAttribute('data-theme', 'dark')
  scene.setAttribute('data-font',  state.font)
  scene.style.width  = W + 'px'
  scene.style.height = H + 'px'
  scene.style.setProperty('--glass-blur', (state.glassBlur ?? 14) + 'px')

  if (state.font === 'custom' && state.customFont) {
    scene.style.setProperty('--font-ko', `'${state.customFont}', sans-serif`)
  } else {
    scene.style.removeProperty('--font-ko')
  }

  scene.style.backgroundColor = state.bgColor

  const layout = getCardLayout(W, H)
  const { portrait, fW, fH, fLeft, fTop, padTop, padSide, padBottom } = layout

  scene.dataset.layout         = portrait ? 'portrait' : 'landscape'
  scene.dataset.cardBodyTop  = fTop
  scene.dataset.cardBodyLeft = fLeft
  scene.dataset.W = W
  scene.dataset.H = H

  const offsetX   = state.cardOffsetX || 0
  const offsetY   = state.cardOffsetY || 0
  const cardScale = state.cardScale   || 1

  // 책 표지와 카드를 분리 — 카드만 card-wrapper 안에, 책 표지는 scene 직속
  scene.innerHTML = `
    <div class="card-bg-overlay"></div>
    ${buildBooksHTML(layout)}
    <div class="card-wrapper" style="position:absolute;inset:0;z-index:3;pointer-events:none;transform:translate(${offsetX}px,${offsetY}px) scale(${cardScale});transform-origin:50% 50%;">
      <div class="card-layer" style="top:${fTop}px;left:${fLeft}px;width:${fW}px;height:${fH}px;">
        <div class="card-body">
          <div class="card-glass"></div>
          <div class="card-content" style="padding:${padTop}px ${padSide}px ${padBottom}px ${padSide}px;">
            ${buildCardContentHTML()}
          </div>
        </div>
        <div class="card-drag-handle" style="position:absolute;inset:0;z-index:10;cursor:grab;pointer-events:auto;"></div>
      </div>
    </div>`

  if (!container.contains(scene)) container.appendChild(scene)
  return scene
}
