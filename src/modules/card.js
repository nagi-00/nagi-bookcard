// src/modules/card.js
import { state } from '../state.js'

const SIZES = {
  '9:16': [360, 640],
  '3:4':  [420, 560],
  '1:1':  [480, 480],
  '4:3':  [560, 420],
  '16:9': [640, 360],
}

// portrait: 9:16, 3:4 — 폴더 하단 65%, 표지 위에서 꽂힘
// landscape: 1:1, 4:3, 16:9 — 폴더 우측 70%, 표지 좌측에서 꽂힘
const PORTRAIT_RATIOS = new Set(['9:16', '3:4'])

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isPortrait(ratio) {
  return PORTRAIT_RATIOS.has(ratio)
}

function formatDate(date) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const day = days[date.getDay()]
  const d = date.getDate()
  // 앞뒤 2일씩 표시
  const pills = [-2,-1,0,1,2].map(offset => {
    const dd = new Date(date); dd.setDate(d + offset)
    return { num: dd.getDate(), today: offset === 0 }
  })
  return { day, pills }
}

function formatTime(date) {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

function formatDateTag(date) {
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`
}

function buildBarcodeHTML() {
  const heights = [100,55,80,100,45,90,65,100,52,80,100,60]
  return heights.map(h =>
    `<div class="barcode-bar" style="height:${h}%"></div>`
  ).join('')
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
  const { title, author, quote, quoteEnabled, rating, ratingEnabled } = state
  const date = state.date instanceof Date ? state.date : new Date(state.date)
  const dateTag = formatDateTag(date)
  const timeStr = formatTime(date)

  return `
    <i class="folder-arrow">↗</i>
    <div class="folder-content-inner">
      <div class="info-wrap">
        ${buildDateRowHTML(date)}
        <div class="book-title">${escapeHTML(title) || '제목을 입력하세요'}</div>
        <div class="book-author">${escapeHTML(author) || '저자'}</div>
        ${ratingEnabled ? `<div class="star-row">${buildStarsHTML(rating)}</div>` : ''}
        ${quoteEnabled && quote ? `<div class="quote-block">"${escapeHTML(quote)}"</div>` : ''}
        <div class="folder-bottom">
          <span class="brand-label">nagi</span>
          <div class="bottom-right">
            <span class="time-label">${timeStr} · ${dateTag}</span>
            <div class="barcode">${buildBarcodeHTML()}</div>
          </div>
        </div>
      </div>
    </div>`
}

function applyPortraitLayout(scene, W, H) {
  // 폴더: 하단 65% (= y: H*0.35)
  const folderTop = Math.round(H * 0.35)
  const folderH = H - folderTop
  // 표지: W*0.3 × W*0.42, 가로 중앙, top: H*0.12
  const coverW = Math.round(W * 0.30)
  const coverH = Math.round(coverW * 1.42)
  const coverX = Math.round((W - coverW) / 2)
  const coverY = Math.round(H * 0.12)
  const coverMid = coverY + Math.round(coverH / 2)

  scene.innerHTML = `
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${coverY}px; left:${coverX}px;
      width:${coverW}px; height:${coverH}px;">
      ${buildCoverImg()}
    </div>

    <div class="folder-layer" style="
      top:${coverMid}px; left:0; right:0;
      height:${H - coverMid}px;">
      <div class="folder-tab" style="width:${Math.round(W*0.34)}px;">
        <span class="folder-tab-label">${escapeHTML(state.title) || 'bookcard'}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:${Math.round(coverH/2 + 16)}px 22px 18px;">
          ${buildFolderContentHTML()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${coverY}px; left:${coverX}px;
      width:${coverW}px; height:${Math.round(coverH/2)}px;">
      ${buildCoverImg(coverW, coverH)}
    </div>`
}

function applyLandscapeLayout(scene, W, H) {
  // 폴더: 우측 70% (x: W*0.30)
  const folderLeft = Math.round(W * 0.30)
  const folderW = W - folderLeft
  // 표지: H*0.22 × H*0.31, 세로 중앙, left: W*0.04
  const coverH2 = Math.round(H * 0.68)
  const coverW2 = Math.round(coverH2 / 1.42)
  const coverX = Math.round(W * 0.04)
  const coverY = Math.round((H - coverH2) / 2)
  const coverMid = coverX + Math.round(coverW2 / 2)

  scene.innerHTML = `
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${coverY}px; left:${coverX}px;
      width:${coverW2}px; height:${coverH2}px;
      border-radius: 6px 0 0 6px;">
      ${buildCoverImg()}
    </div>

    <div class="folder-layer" style="
      top:0; left:${coverMid}px;
      width:${W - coverMid}px; height:${H}px;">
      <div class="folder-tab" style="
        top:${Math.round(H*0.12)}px; left:-1px; width:18px; height:${Math.round(H*0.36)}px;
        border-radius:9px 0 0 9px; border-right:none; border-left:1px solid rgba(255,255,255,0.85);">
      </div>
      <div class="folder-body" style="top:0; border-radius:0 20px 20px 0;">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:20px 18px 18px ${Math.round(coverW2/2 + 20)}px;">
          ${buildFolderContentHTML()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${coverY}px; left:${coverX}px;
      width:${Math.round(coverW2/2)}px; height:${coverH2}px;
      border-radius: 6px 0 0 6px;">
      ${buildCoverImg(coverW2, coverH2)}
    </div>`
}

function buildCoverImg(w, h) {
  const src = state.cover || state.userImage
  if (!src) return `<div style="width:100%;height:100%;background:var(--color-sub);opacity:0.4;"></div>`
  if (w && h) return `<img src="${src}" style="width:${w}px;height:${h}px;" alt="">`
  return `<img src="${src}" alt="">`
}

export function renderCard(container) {
  const [W, H] = SIZES[state.ratio]
  const scene = container.querySelector('.card-scene') || document.createElement('div')

  scene.className = 'card-scene'
  scene.setAttribute('data-theme', state.theme)
  scene.setAttribute('data-font', state.font)
  scene.style.width = W + 'px'
  scene.style.height = H + 'px'

  // 커스텀 로컬 폰트
  if (state.font === 'custom' && state.customFont) {
    scene.style.setProperty('--font-ko', `'${state.customFont}', sans-serif`)
  } else {
    scene.style.removeProperty('--font-ko')
  }

  // 배경
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
