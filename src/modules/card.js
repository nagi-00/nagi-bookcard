// src/modules/card.js
import { state } from '../state.js'

const SIZES = {
  '9:16': [360, 640],
  '3:4':  [420, 560],
  '1:1':  [480, 480],
  '4:3':  [560, 420],
  '16:9': [640, 360],
}

const PORTRAIT_RATIOS = new Set(['9:16', '3:4'])
const FOLDER_MARGIN = 24   // card edge padding
const BODY_OFFSET   = 26   // folder-body.top in CSS — 2px overlap with 28px tab hides junction

export function resetCoverOffset() {
  state.books.forEach(b => { b.x = 0; b.y = 0; b.rotation = 0 })
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isPortrait(ratio) { return PORTRAIT_RATIOS.has(ratio) }

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

function buildFolderContentHTML() {
  const { title, author, quote, quoteEnabled, rating, ratingEnabled, publisher, pages } = state
  const date = state.date instanceof Date ? state.date : new Date(state.date)
  const dateTag = formatDateTag(date)
  const timeStr = formatTime(date)

  const pubMeta = [
    publisher ? escapeHTML(publisher) : '',
    pages    ? escapeHTML(String(pages)) + 'p' : '',
  ].filter(Boolean).join(' · ')

  return `
    <div class="folder-content-inner">
      <div class="info-wrap">
        ${buildDateRowHTML(date)}
        <div class="book-title">${escapeHTML(title) || 'ᴛɪᴛʟᴇ'}</div>
        <div class="book-author">${escapeHTML(author) || 'ᴀᴜᴛʜᴏʀ'}</div>
        ${ratingEnabled ? `<div class="star-row">${buildStarsHTML(rating)}</div>` : ''}
        ${quoteEnabled && quote ? `<div class="quote-block">${escapeHTML(quote)}</div>` : ''}
        <div class="folder-bottom" style="margin-top:auto;">
          <span class="brand-label">nagi</span>
          <div class="bottom-right">
            ${pubMeta ? `<span class="pub-label">${pubMeta}</span>` : ''}
            <span class="time-label">${timeStr} · ${dateTag}</span>
          </div>
        </div>
      </div>
    </div>`
}

// Build back + front pair for every book
function buildBooksHTML(W, H, layout, folderBodyTop, folderBodyLeft) {
  return state.books.map(book => {
    let baseW, baseH, baseCX, baseCY

    if (layout === 'portrait') {
      baseW = Math.round(W * 0.30)
      baseH = Math.round(baseW * 1.42)
      baseCX = Math.round(W / 2)
      baseCY = folderBodyTop - Math.round(baseH * 0.05)
    } else {
      baseH = Math.round(H * 0.62)
      baseW = Math.round(baseH / 1.42)
      baseCX = folderBodyLeft + Math.round(baseW * 0.05)
      baseCY = Math.round(H / 2)
    }

    const bW = Math.round(baseW * book.scale)
    const bH = Math.round(baseH * book.scale)
    const bX = Math.round(baseCX + book.x - bW / 2)
    const bY = Math.round(baseCY + book.y - bH / 2)

    const src = book.src
    const imgSt = `width:${bW}px;height:${bH}px;object-fit:cover;display:block;`
    const imgBack  = src ? `<img src="${src}" style="${imgSt}" alt="">`
                        : `<div style="width:100%;height:100%;background:var(--color-sub);opacity:0.35;border-radius:4px;"></div>`
    const imgFront = src ? `<img src="${src}" style="${imgSt}" alt="">` : ''

    let frontExtra
    if (layout === 'portrait') {
      const frontH = Math.max(0, Math.min(bH, folderBodyTop - bY))
      frontExtra = `width:${bW}px;height:${frontH}px;border-radius:6px 6px 0 0;`
    } else {
      const frontW = Math.max(0, Math.min(bW, folderBodyLeft - bX))
      frontExtra = `width:${frontW}px;height:${bH}px;border-radius:6px 0 0 6px;`
    }

    const rot = book.rotation || 0
    const rotStyle = rot !== 0 ? `;transform-origin:center center;transform:rotate(${rot}deg)` : ''

    return `
      <div class="book-back" data-id="${book.id}"
        data-base-cx="${baseCX}" data-base-cy="${baseCY}"
        data-base-w="${baseW}" data-base-h="${baseH}"
        data-bw="${bW}" data-bh="${bH}"
        style="position:absolute;z-index:2;top:${bY}px;left:${bX}px;width:${bW}px;height:${bH}px;overflow:hidden;border-radius:6px;box-shadow:0 16px 48px rgba(0,0,0,0.28),0 4px 12px rgba(0,0,0,0.14)${rotStyle};">${imgBack}</div>
      <div class="book-front" data-id="${book.id}"
        style="position:absolute;z-index:5;top:${bY}px;left:${bX}px;overflow:hidden;${frontExtra}${rotStyle}">${imgFront}</div>`
  }).join('')
}

// ── Portrait layout ──
function applyPortraitLayout(scene, W, H) {
  const baseW = Math.round(W * 0.30)
  const baseH = Math.round(baseW * 1.42)

  // 3:4 비율은 folderBodyTop을 낮게 잡아 폴더 내부 공간 확보
  const is3x4 = state.ratio === '3:4'
  const folderBodyTop  = Math.round(H * (is3x4 ? 0.47 : 0.52))
  const folderLayerTop = folderBodyTop - BODY_OFFSET
  const folderLayerH   = H - folderLayerTop - FOLDER_MARGIN
  const folderLayerW   = W - FOLDER_MARGIN * 2
  const tabW           = Math.round(folderLayerW * 0.41)
  const topPad         = Math.round(baseH * (is3x4 ? 0.45 : 0.48) + (is3x4 ? 12 : 18))

  scene.dataset.layout        = 'portrait'
  scene.dataset.folderBodyTop = folderBodyTop
  scene.dataset.folderLayerW  = folderLayerW
  scene.dataset.W = W
  scene.dataset.H = H

  scene.innerHTML = `
    <div class="card-bg-overlay"></div>
    ${buildBooksHTML(W, H, 'portrait', folderBodyTop, 0)}
    <div class="folder-layer" style="top:${folderLayerTop}px;left:${FOLDER_MARGIN}px;width:${folderLayerW}px;height:${folderLayerH}px;">
      <div class="folder-tab" style="width:${tabW}px;">
        <span class="folder-tab-label">${escapeHTML(state.title) || 'bookcard'}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:${topPad}px 22px 18px;">
          ${buildFolderContentHTML()}
        </div>
      </div>
    </div>`
}

// ── Landscape layout ──
function applyLandscapeLayout(scene, W, H) {
  const folderBodyLeft = Math.round(W * 0.38)
  const folderLayerTop = FOLDER_MARGIN
  const folderLayerH   = H - FOLDER_MARGIN * 2
  const folderLayerW   = W - folderBodyLeft - FOLDER_MARGIN
  const tabW           = Math.round(folderLayerW * 0.68)

  scene.dataset.layout        = 'landscape'
  scene.dataset.folderBodyLeft = folderBodyLeft
  scene.dataset.W = W
  scene.dataset.H = H

  scene.innerHTML = `
    <div class="card-bg-overlay"></div>
    ${buildBooksHTML(W, H, 'landscape', 0, folderBodyLeft)}
    <div class="folder-layer" style="top:${folderLayerTop}px;left:${folderBodyLeft}px;width:${folderLayerW}px;height:${folderLayerH}px;">
      <div class="folder-tab" style="width:${tabW}px;">
        <span class="folder-tab-label">${escapeHTML(state.title) || 'bookcard'}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:28px 18px 18px 20px;">
          ${buildFolderContentHTML()}
        </div>
      </div>
    </div>`
}

// ── Drag + Rotate + Zoom (per book) ──
export function initCoverDrag(scene) {
  if (!scene) return
  const layout = scene.dataset.layout
  if (!layout) return

  const folderBodyTop  = +scene.dataset.folderBodyTop  || 0
  const folderBodyLeft = +scene.dataset.folderBodyLeft || 0
  const W = +scene.dataset.W || scene.offsetWidth
  const H = +scene.dataset.H || scene.offsetHeight

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
    const frontEl = scene.querySelector(`.book-front[data-id="${book.id}"]`)
    if (!backEl) return

    const baseCX = +backEl.dataset.baseCx
    const baseCY = +backEl.dataset.baseCy
    const baseW  = +backEl.dataset.baseW
    const baseH  = +backEl.dataset.baseH

    let dragStart   = null
    let rotating    = false
    let lastTouches = null

    function applyTransform() {
      const bW = +backEl.dataset.bw
      const bH = +backEl.dataset.bh
      const bX = Math.round(baseCX + book.x - bW / 2)
      const bY = Math.round(baseCY + book.y - bH / 2)
      const rot = book.rotation || 0
      const rotStyle = rot !== 0 ? `rotate(${rot}deg)` : ''

      backEl.style.top       = bY + 'px'
      backEl.style.left      = bX + 'px'
      backEl.style.transform = rotStyle

      if (frontEl) {
        frontEl.style.top       = bY + 'px'
        frontEl.style.left      = bX + 'px'
        frontEl.style.transform = rotStyle
        if (layout === 'portrait') {
          frontEl.style.width  = bW + 'px'
          frontEl.style.height = Math.max(0, Math.min(bH, folderBodyTop - bY)) + 'px'
        } else {
          frontEl.style.width  = Math.max(0, Math.min(bW, folderBodyLeft - bX)) + 'px'
          frontEl.style.height = bH + 'px'
        }
      }
    }

    function updateImgSize(newBW, newBH) {
      backEl.dataset.bw = newBW; backEl.dataset.bh = newBH
      const bi = backEl.querySelector('img')
      if (bi) { bi.style.width = newBW + 'px'; bi.style.height = newBH + 'px' }
      const fi = frontEl?.querySelector('img')
      if (fi) { fi.style.width = newBW + 'px'; fi.style.height = newBH + 'px' }
    }

    function onDown(e) {
      // Two-finger touch: handled in onMove
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

      ;[backEl, frontEl].forEach(el => el && (el.style.cursor = rotating ? 'crosshair' : 'grabbing'))
      document.addEventListener('mousemove',  onMove)
      document.addEventListener('mouseup',    onUp)
      document.addEventListener('touchmove',  onMove, { passive: false })
      document.addEventListener('touchend',   onUp)
    }

    function onMove(e) {
      e.preventDefault()
      const s = getScale()

      // Two-finger: pinch-scale + rotate
      if (e.touches && e.touches.length >= 2 && lastTouches && lastTouches.length >= 2) {
        const t0 = e.touches[0], t1 = e.touches[1]
        const l0 = lastTouches[0], l1 = lastTouches[1]
        const newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        const oldDist = Math.hypot(l1.clientX - l0.clientX, l1.clientY - l0.clientY)
        const newAng  = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX)
        const oldAng  = Math.atan2(l1.clientY - l0.clientY, l1.clientX - l0.clientX)
        if (oldDist > 1) {
          book.scale = Math.max(0.3, Math.min(4, book.scale * (newDist / oldDist)))
          updateImgSize(Math.round(baseW * book.scale), Math.round(baseH * book.scale))
        }
        book.rotation = (book.rotation || 0) + (newAng - oldAng) * 180 / Math.PI
        lastTouches = Array.from(e.touches)
        applyTransform()
        return
      }

      if (!dragStart) return

      if (rotating) {
        const angle = Math.atan2(e.clientY - dragStart.cy, e.clientX - dragStart.cx)
        book.rotation = dragStart.startRot + (angle - dragStart.startAngle) * 180 / Math.PI
        applyTransform()
        return
      }

      const p  = pointerPos(e)
      const bW = +backEl.dataset.bw
      const bH = +backEl.dataset.bh
      const rawX = dragStart.ox + (p.x - dragStart.px) / s
      const rawY = dragStart.oy + (p.y - dragStart.py) / s

      if (layout === 'portrait') {
        // X: 폴더 가로 범위 내로 클램핑 (도서가 폴더 옆으로 빠져나가지 않도록)
        const minX = FOLDER_MARGIN - baseCX + bW / 2
        const maxX = (W - FOLDER_MARGIN) - baseCX - bW / 2
        book.x = minX < maxX ? Math.max(minX, Math.min(maxX, rawX)) : rawX
        book.y = rawY
      } else {
        // Y: 폴더 세로 범위 내로 클램핑
        const minY = FOLDER_MARGIN - baseCY + bH / 2
        const maxY = (H - FOLDER_MARGIN) - baseCY - bH / 2
        book.y = minY < maxY ? Math.max(minY, Math.min(maxY, rawY)) : rawY
        book.x = rawX
      }

      applyTransform()
    }

    function onUp(e) {
      if (e?.type === 'touchend' && (e.touches?.length ?? 0) >= 1) {
        lastTouches = Array.from(e.touches)
        return
      }
      dragStart = null; rotating = false; lastTouches = null
      ;[backEl, frontEl].forEach(el => el && (el.style.cursor = 'grab'))
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onUp)
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

    ;[backEl, frontEl].forEach(el => {
      if (!el) return
      el.style.cursor = 'grab'
      el.addEventListener('contextmenu', e => e.preventDefault())
      el.addEventListener('mousedown',   onDown)
      el.addEventListener('touchstart',  onDown, { passive: false })
      el.addEventListener('wheel',       onWheel, { passive: false })
    })
  })
}

// ── 카드 렌더링 ──
export function renderCard(container) {
  const [W, H] = SIZES[state.ratio]
  const scene  = container.querySelector('.card-scene') || document.createElement('div')

  scene.className = 'card-scene'
  scene.setAttribute('data-theme', state.theme)
  scene.setAttribute('data-font',  state.font)
  scene.style.width  = W + 'px'
  scene.style.height = H + 'px'

  if (state.font === 'custom' && state.customFont) {
    scene.style.setProperty('--font-ko', `'${state.customFont}', sans-serif`)
  } else {
    scene.style.removeProperty('--font-ko')
  }

  if (state.bgPreset === 'image' && state.bgImage) {
    scene.classList.add('bg-image')
    scene.style.backgroundImage = `url(${state.bgImage})`
    scene.style.backgroundColor = ''
  } else {
    scene.classList.remove('bg-image')
    scene.style.backgroundImage = ''
    scene.style.backgroundColor = state.bgColor
  }

  if (isPortrait(state.ratio)) {
    applyPortraitLayout(scene, W, H)
  } else {
    applyLandscapeLayout(scene, W, H)
  }

  if (!container.contains(scene)) container.appendChild(scene)
  return scene
}
