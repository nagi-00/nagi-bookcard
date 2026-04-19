// src/main.js
import './styles/main.css'
import { state, setState, subscribe } from './state.js'
import { renderCard, initCoverDrag, initCardDrag, resetCardOffset } from './modules/card.js'
import { openPhotoEditor } from './modules/photoEditor.js'
import { openCropUI } from './modules/cropExport.js'
import { searchBooks } from './modules/search.js'
import { deriveColors, applyCssVars, pickColorWithEyeDropper } from './modules/colorSystem.js'
import { exportToPng, exportToClipboard } from './modules/export.js'
import { escapeHTML as esc } from './modules/util.js'

// ── TTB 키 관리 ──
const TTB_KEY_STORAGE = 'nagi_ttb_key'
function getTtbKey() { return localStorage.getItem(TTB_KEY_STORAGE) || '' }
function saveTtbKey(key) { localStorage.setItem(TTB_KEY_STORAGE, key.trim()) }

// ── 온보딩 모달 ──
document.body.insertAdjacentHTML('beforeend', `
  <div id="onboarding-overlay">
    <div id="onboarding-modal">
      <div class="modal-title">TTB key</div>
      <div class="modal-desc">
        책 검색 기능을 사용하려면 알라딘 TTB API 키가 필요합니다.<br>
        키는 <a href="https://www.aladin.co.kr/ttb/wblog_manage.aspx" target="_blank" rel="noopener">알라딘 Thanks to Bloggers↗</a>에서 발급받을 수 있습니다.
      </div>
      <input id="ttb-key-input" type="text" placeholder="TTB key here">
      <div class="modal-btns">
        <button id="ttb-key-skip">직접 입력하기</button>
        <button id="ttb-key-save">Save & Start</button>
      </div>
    </div>
  </div>`)

function showOnboarding() { document.getElementById('onboarding-overlay').classList.remove('hidden') }
function hideOnboarding() { document.getElementById('onboarding-overlay').classList.add('hidden') }

document.getElementById('ttb-key-save').addEventListener('click', () => {
  const key = document.getElementById('ttb-key-input').value.trim()
  if (!key) return
  saveTtbKey(key)
  hideOnboarding()
})
document.getElementById('ttb-key-skip').addEventListener('click', () => {
  hideOnboarding()
})
document.getElementById('ttb-key-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('ttb-key-save').click()
})
// ESC: only allow dismissal when a TTB key already exists (so first-run users aren't softlocked out)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return
  const overlay = document.getElementById('onboarding-overlay')
  if (overlay && !overlay.classList.contains('hidden') && getTtbKey()) hideOnboarding()
})
if (!getTtbKey()) showOnboarding()

// ── 패널 HTML 주입 ──
document.getElementById('panel').innerHTML = `
  <div class="panel-section">
    <div class="panel-section-title" style="display:flex;align-items:center;justify-content:space-between;">
      SEARCH
      <button class="key-setting-btn" id="change-key-btn">TTB KEY</button>
    </div>
    <div id="search-wrap">
      <input id="search-input" type="text" placeholder="Search...">
      <button id="search-btn"><svg height="14" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg></button>
    </div>
    <div id="search-results"></div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title collapsible-header" data-target="book-info-body">
      BOOK INFO <span class="collapse-arrow">▲</span>
    </div>
    <div id="book-info-body" class="collapsible-body" style="display:flex;">
      <input id="title-input" class="text-input" type="text" placeholder="Title *">
      <input id="author-input" class="text-input" type="text" placeholder="Author *">
      <input id="publisher-input" class="text-input" type="text" placeholder="Publisher">
      <input id="pages-input" class="text-input" type="number" placeholder="Pages" min="1">
    </div>
  </div>

  <div class="panel-section">
    <div class="toggle-row">
      <label>Date</label>
      <button class="toggle on" id="date-toggle"><div class="toggle-knob"></div></button>
    </div>
    <input id="date-input" class="text-input" type="date">
  </div>

  <div class="panel-section">
    <button id="cover-upload-btn"><svg height="14" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></svg> Upload image</button>
    <input id="cover-file" type="file" accept="image/*" style="display:none">
    <div id="book-thumb-wrap"></div>
    <div style="font-size:10px;color:#B8B2AA;margin-top:2px;">Drag to move · scroll to zoom</div>
  </div>

  <div class="panel-section">
    <div class="toggle-row">
      <label>Notes &amp; Quotes</label>
      <button class="toggle on" id="quote-toggle"><div class="toggle-knob"></div></button>
    </div>
    <textarea id="quote-input" class="text-input" placeholder="Notes &amp; quotes"></textarea>
    <button id="synopsis-btn" class="synopsis-btn">Get synopsis</button>
    <div class="toggle-row">
      <label>Star</label>
      <button class="toggle on" id="rating-toggle"><div class="toggle-knob"></div></button>
    </div>
    <div id="star-input">
      ${[1,2,3,4,5].map(i => `<button class="star-btn" data-val="${i}">★</button>`).join('')}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">CARD RATIO</div>
    <div class="ratio-buttons" id="card-ratio-buttons">
      ${['9:16','3:4','1:1','4:3','16:9'].map(r =>
        `<button class="ratio-btn${r==='9:16'?' active':''}" data-ratio="${r}">${r}</button>`
      ).join('')}
    </div>
    <div style="font-size:10px;color:#B8B2AA;margin-top:2px;">Drag card to move · scroll to zoom</div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">BACKGROUNDS</div>
    <div class="bg-presets">
      <div class="bg-swatch active" data-bg-preset="beige" style="background:#F0EBE3" title="Oatmilk"></div>
      <div class="bg-swatch" data-bg-preset="white" style="background:#FFFFFF" title="Snow"></div>
      <div class="bg-swatch" data-bg-preset="gray" style="background:#9E9A94" title="Mouse"></div>
      <div class="bg-swatch" data-bg-preset="black" style="background:#1A1A1A" title="Blank"></div>
      <input id="bg-color-input" type="color" value="#F0EBE3" title="Custom">
      <button id="bg-image-btn" class="bg-image-btn">Upload image</button>
      <input id="bg-file" type="file" accept="image/*" style="display:none">
    </div>
  </div>

  <div class="panel-section">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="panel-section-title" style="margin:0;">THEME COLOR</span>
        <input id="accent-picker" type="color" value="#8FAF8E">
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="panel-section-title" style="margin:0;">FONT COLOR</span>
        <input id="text-color-picker" type="color" value="#2C2825">
      </div>
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">EFFECT</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:11px;color:#8C8680;white-space:nowrap;">Blur</span>
      <input id="glass-blur-input" type="range" min="0" max="30" value="14" style="flex:1;accent-color:#8FAF8E;">
      <span id="glass-blur-val" style="font-size:11px;color:#8C8680;width:24px;text-align:right;">14</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:11px;color:#8C8680;white-space:nowrap;">Shadow</span>
      <input id="shadow-input" type="range" min="0" max="200" value="100" style="flex:1;accent-color:#8FAF8E;">
      <span id="shadow-val" style="font-size:11px;color:#8C8680;width:24px;text-align:right;">100</span>
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">FONTS</div>
    <select id="font-select">
      <option value="modern">Modern — Pretendard</option>
      <option value="literary">Literary — Noto Serif KR</option>
      <option value="soft">Soft — Gowun Dodum</option>
      <option value="local">Local font...</option>
    </select>
    <div id="local-font-chip" style="display:none;">
      <span id="local-font-chip-name"></span>
      <button id="local-font-chip-clear" title="Clear">×</button>
    </div>
    <div id="local-font-wrap">
      <div class="local-font-search-row">
        <input id="local-font-search" class="text-input" type="text" placeholder="Search fonts...">
        <span id="local-font-count"></span>
      </div>
      <div id="local-font-list"></div>
    </div>
  </div>

  <div class="panel-section">
    <div class="export-buttons">
      <button class="export-btn secondary" id="clipboard-btn">Copy to clipboard</button>
      <button class="export-btn primary" id="save-btn">Save to .png</button>
    </div>
    <div style="text-align:center;padding-top:2px;">
      <span style="font-size:9px;color:#B8B2AA;letter-spacing:0.1em;font-family:'Inter',sans-serif;text-transform:lowercase;">ⓒ nagi</span>
    </div>
  </div>
`

// 미리보기 컨테이너
document.getElementById('preview').innerHTML = `<div id="preview-inner"></div>`
const previewInner = document.getElementById('preview-inner')

// ── 도서 표지 교체 헬퍼 (단일) ──
function setBook(src) {
  if (!src) return
  setState({ books: [{ id: 0, src, x: 0, y: 0, scale: 1 }], nextBookId: 1 })
}

// ── 초기 입력 필드 채우기 ──
document.getElementById('title-input').value     = state.title
document.getElementById('author-input').value    = state.author
document.getElementById('quote-input').value     = state.quote

// ── Collapsible 섹션 ──
document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', () => {
    const targetId = header.dataset.target
    const body = document.getElementById(targetId)
    const arrow = header.querySelector('.collapse-arrow')
    const isOpen = body.style.display !== 'none'
    body.style.display = isOpen ? 'none' : 'flex'
    if (arrow) arrow.textContent = isOpen ? '▼' : '▲'
  })
})

// ── 초기 날짜 설정 ──
const today = new Date()
document.getElementById('date-input').value =
  `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
setState({ date: today })

// ── 캔버스 크기: 미리보기 컨테이너 기반 ──
function getCanvasSize() {
  const p = document.getElementById('preview')
  return [Math.max(240, p.clientWidth - 80), Math.max(240, p.clientHeight - 80)]
}

// ── 카드 렌더링 ──
function update() {
  const colors = deriveColors(state.accentColor, state.textColorHex, state.bgColor)
  applyCssVars(colors)
  const [W, H] = getCanvasSize()
  const scene  = renderCard(previewInner, W, H)
  previewInner.style.transform = ''
  initCoverDrag(scene)
  initCardDrag(scene)
  initPreviewControls(scene)
  syncStarUI()
  syncBookList()
}

function syncStarUI() {
  document.querySelectorAll('#star-input .star-btn').forEach((b, i) => {
    b.classList.toggle('on', i < state.rating)
  })
}

function syncBookList() {
  const wrap = document.getElementById('book-thumb-wrap')
  if (!wrap) return
  if (!state.books.length) { wrap.innerHTML = ''; return }
  const book = state.books[0]
  wrap.innerHTML = `
    <div class="book-list-item">
      <img class="book-thumb" src="${esc(book.src || '')}" alt="" onerror="this.style.display='none'">
    </div>`
}

function initPreviewControls(scene) {
  if (!scene) return

  // 책 표지 편집 (✏) — 로컬 이미지는 에디터, 외부 URL은 파일 교체
  scene.querySelectorAll('.book-edit-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      const book = state.books[0]
      if (book?.src?.startsWith('data:')) {
        const result = await openPhotoEditor(book.src)
        if (result) setBook(result)
      } else {
        document.getElementById('cover-file').click()
      }
    })
  })

  // 책 표지 삭제 (✕)
  scene.querySelectorAll('.book-del-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      setState({ books: [] })
    })
  })

  // 배경 편집 (✏) → 현재 bgImage를 photoEditor로 재편집
  const bgEditBtn = scene.querySelector('.bg-edit-btn')
  if (bgEditBtn) {
    bgEditBtn.addEventListener('click', async e => {
      e.stopPropagation()
      if (!state.bgImage) return
      const result = await openPhotoEditor(state.bgImage)
      if (result) setState({ bgPreset: 'image', bgImage: result })
    })
  }

  // 배경 삭제 (✕)
  const bgDelBtn = scene.querySelector('.bg-del-btn')
  if (bgDelBtn) {
    bgDelBtn.addEventListener('click', e => {
      e.stopPropagation()
      setState({ bgPreset: 'beige', bgColor: '#F0EBE3', bgImage: null })
      document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'))
      document.querySelector('.bg-swatch[data-bg-preset="beige"]')?.classList.add('active')
    })
  }
}

// resize 시 debounce 후 재렌더링
let _resizeTimer = null
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer)
  _resizeTimer = setTimeout(update, 120)
})

// ── 이벤트 바인딩 ──

// 검색
let searchTimeout
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => runSearch(e.target.value), 400)
})
document.getElementById('search-btn').addEventListener('click', () => {
  runSearch(document.getElementById('search-input').value)
})

async function runSearch(q) {
  if (!q.trim()) return
  const results = document.getElementById('search-results')
  results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680">Searching...</div>'
  results.classList.add('open')
  const books = await searchBooks(q, getTtbKey())
  if (!books.length) {
    results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680">No results.</div>'
    return
  }
  results.innerHTML = books.map((b, i) => `
    <div class="search-result-item" data-idx="${i}">
      <img src="${esc(b.cover||'')}" onerror="this.style.display='none'">
      <div>
        <div class="search-result-title">${esc(b.title)}</div>
        <div class="search-result-author">${esc(b.author)}</div>
      </div>
    </div>`).join('')
  results.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const b = books[+el.dataset.idx]
      setState({
        title: b.title || '',
        author: b.author || '',
        publisher: b.publisher || '',
        description: b.description || '',
      })
      document.getElementById('title-input').value = b.title || ''
      document.getElementById('author-input').value = b.author || ''
      document.getElementById('publisher-input').value = b.publisher || ''
      if (b.cover) setBook(b.cover)
      results.classList.remove('open')
      document.getElementById('search-input').value = ''
    })
  })
}

// TTB 키 변경
document.getElementById('change-key-btn').addEventListener('click', () => {
  document.getElementById('ttb-key-input').value = getTtbKey()
  showOnboarding()
})

// 검색창 닫기
document.addEventListener('click', e => {
  if (!document.getElementById('search-wrap').contains(e.target)) {
    document.getElementById('search-results').classList.remove('open')
  }
})

// 제목 / 저자 / 출판사 / 페이지
document.getElementById('title-input').addEventListener('input', e => setState({ title: e.target.value }))
document.getElementById('author-input').addEventListener('input', e => setState({ author: e.target.value }))
document.getElementById('publisher-input').addEventListener('input', e => setState({ publisher: e.target.value }))
document.getElementById('pages-input').addEventListener('input', e => {
  const raw = e.target.value
  if (raw === '') { setState({ pages: '' }); return }
  const n = Math.max(1, Math.min(99999, Math.floor(Number(raw))))
  if (Number.isNaN(n)) return
  if (String(n) !== raw) e.target.value = String(n)
  setState({ pages: String(n) })
})

// 날짜 (빈 값/잘못된 값은 무시, 기존 시·분·초 보존)
document.getElementById('date-input').addEventListener('change', e => {
  const val = e.target.value
  if (!val) return
  const [y, m, d] = val.split('-').map(Number)
  if (!y || !m || !d) return
  const prev = state.date instanceof Date && !isNaN(state.date) ? state.date : new Date()
  const next = new Date(prev)
  next.setFullYear(y, m - 1, d)
  if (isNaN(next)) return
  setState({ date: next })
})

// 도서 표지 업로드 (단일)
document.getElementById('cover-upload-btn').addEventListener('click', () => {
  document.getElementById('cover-file').click()
})
document.getElementById('cover-file').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    const result = await openPhotoEditor(ev.target.result)
    if (result) setBook(result)
  }
  reader.readAsDataURL(file)
  e.target.value = ''
})

// synopsis 불러오기 (HTML 엔티티 디코딩)
function decodeHTML(html) {
  const ta = document.createElement('textarea')
  ta.innerHTML = html
  return ta.value
}
document.getElementById('synopsis-btn').addEventListener('click', () => {
  if (!state.description) return
  const decoded = decodeHTML(state.description)
  document.getElementById('quote-input').value = decoded
  setState({ quote: decoded })
})

// 감상 토글
document.getElementById('quote-toggle').addEventListener('click', function() {
  setState({ quoteEnabled: this.classList.toggle('on') })
})
document.getElementById('quote-input').addEventListener('input', e => setState({ quote: e.target.value }))

// 별점 토글
document.getElementById('rating-toggle').addEventListener('click', function() {
  setState({ ratingEnabled: this.classList.toggle('on') })
})

// 별점 클릭
document.getElementById('star-input').addEventListener('click', e => {
  const btn = e.target.closest('.star-btn'); if (!btn) return
  setState({ rating: +btn.dataset.val })
})

// CARD RATIO
document.querySelectorAll('#card-ratio-buttons .ratio-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#card-ratio-buttons .ratio-btn').forEach(b => b.classList.remove('active'))
    this.classList.add('active')
    resetCardOffset()
    setState({ cardRatio: this.dataset.ratio })
  })
})

// 배경 프리셋
const BG_PRESETS      = { white:'#FFFFFF', beige:'#F0EBE3', gray:'#9E9A94', black:'#1A1A1A' }
const BG_DEFAULT_TEXT = { white: '#2C2825', beige: '#2C2825', gray: '#F0EBE3', black: '#F0EBE3' }
document.querySelectorAll('.bg-swatch').forEach(el => {
  el.addEventListener('click', function() {
    document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'))
    this.classList.add('active')
    const preset = this.dataset.bgPreset
    const newTextColorHex = BG_DEFAULT_TEXT[preset] || state.textColorHex
    const picker = document.getElementById('text-color-picker')
    if (picker) picker.value = newTextColorHex
    setState({ bgPreset: preset, bgColor: BG_PRESETS[preset], bgImage: null, textColorHex: newTextColorHex })
  })
})
document.getElementById('bg-color-input').addEventListener('input', e => {
  setState({ bgPreset: 'custom', bgColor: e.target.value, bgImage: null })
})
document.getElementById('bg-image-btn').addEventListener('click', () => {
  document.getElementById('bg-file').click()
})
document.getElementById('bg-file').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    const result = await openPhotoEditor(ev.target.result)
    if (result) setState({ bgPreset: 'image', bgImage: result })
  }
  reader.readAsDataURL(file)
})

// 액센트 컬러
document.getElementById('accent-picker').addEventListener('input', e => {
  setState({ accentColor: e.target.value })
})

// 날짜 토글
document.getElementById('date-toggle').addEventListener('click', function() {
  const on = this.classList.toggle('on')
  document.getElementById('date-input').style.display = on ? '' : 'none'
  setState({ dateEnabled: on })
})

// 글래스 블러
document.getElementById('glass-blur-input').addEventListener('input', e => {
  const val = +e.target.value
  document.getElementById('glass-blur-val').textContent = val
  setState({ glassBlur: val })
})

// 그림자 강도
document.getElementById('shadow-input').addEventListener('input', e => {
  const val = +e.target.value
  document.getElementById('shadow-val').textContent = val
  setState({ bookShadow: val / 100 })
})

// 폰트
document.getElementById('font-select').addEventListener('change', async e => {
  const val = e.target.value
  const localWrap = document.getElementById('local-font-wrap')
  if (val === 'local') {
    localWrap.classList.add('open')
    document.getElementById('local-font-chip').style.display = 'none'
    await loadLocalFonts()
  } else {
    localWrap.classList.remove('open')
    document.getElementById('local-font-chip').style.display = 'none'
    setState({ font: val, customFont: '' })
  }
})

document.getElementById('local-font-search').addEventListener('input', e => {
  renderLocalFonts(_localFonts)
})

document.getElementById('local-font-chip-clear').addEventListener('click', () => {
  document.getElementById('local-font-chip').style.display = 'none'
  document.getElementById('local-font-wrap').classList.remove('open')
  document.getElementById('font-select').value = 'modern'
  setState({ font: 'modern', customFont: '' })
})

let _localFonts = []
async function loadLocalFonts() {
  const list = document.getElementById('local-font-list')
  if (_localFonts.length) { renderLocalFonts(_localFonts); return }
  if (!window.queryLocalFonts) {
    list.innerHTML = '<div class="local-font-unavail">Chrome 103+ 필요</div>'
    return
  }
  list.innerHTML = '<div class="local-font-unavail">불러오는 중...</div>'
  try {
    const fonts = await window.queryLocalFonts()
    const seen = new Set()
    _localFonts = fonts.filter(f => {
      if (seen.has(f.family)) return false
      seen.add(f.family); return true
    })
    renderLocalFonts(_localFonts)
  } catch {
    list.innerHTML = '<div class="local-font-unavail">폰트 접근 권한이 필요합니다.</div>'
  }
}

function renderLocalFonts(fonts) {
  const list = document.getElementById('local-font-list')
  const countEl = document.getElementById('local-font-count')
  const q = document.getElementById('local-font-search').value.toLowerCase()
  const filtered = q ? fonts.filter(f => f.family.toLowerCase().includes(q)) : fonts
  const shown = filtered.slice(0, 120)
  if (countEl) countEl.textContent = filtered.length ? `${filtered.length}` : ''
  if (!filtered.length) {
    list.innerHTML = '<div class="local-font-unavail">검색 결과 없음</div>'
    return
  }
  list.innerHTML = shown.map(f =>
    `<div class="local-font-item${state.customFont === f.family ? ' active' : ''}" data-family="${esc(f.family)}" style="font-family:'${esc(f.family)}';">${esc(f.family)}</div>`
  ).join('')
  list.querySelectorAll('.local-font-item').forEach(el => {
    el.addEventListener('click', () => {
      const family = el.dataset.family
      list.querySelectorAll('.local-font-item').forEach(i => i.classList.remove('active'))
      el.classList.add('active')
      setState({ font: 'custom', customFont: family })
      document.getElementById('local-font-wrap').classList.remove('open')
      const chip = document.getElementById('local-font-chip')
      document.getElementById('local-font-chip-name').textContent = family
      chip.style.display = 'flex'
    })
  })
}

// 폰트 색 피커
document.getElementById('text-color-picker').addEventListener('input', e => {
  setState({ textColorHex: e.target.value })
})

// 내보내기 (크롭 UI 선택 후 저장)
document.getElementById('save-btn').addEventListener('click', async () => {
  const btn = document.getElementById('save-btn')
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  const cropRect = await openCropUI(scene)
  if (!cropRect) return
  btn.textContent = 'Saving...'
  try {
    await exportToPng(scene, cropRect)
  } finally {
    btn.textContent = 'Save to .png'
  }
})
document.getElementById('clipboard-btn').addEventListener('click', async () => {
  const btn = document.getElementById('clipboard-btn')
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  const cropRect = await openCropUI(scene)
  if (!cropRect) return
  btn.textContent = 'Copying...'
  try {
    await exportToClipboard(scene, cropRect)
    btn.textContent = 'Done!'
    setTimeout(() => { btn.textContent = 'Copy to clipboard' }, 2000)
  } catch {
    btn.textContent = 'Copy to clipboard'
  }
})

// ── 상태 변경 → 카드 재렌더링 ──
subscribe(update)

// ── 초기 렌더링 ──
update()
