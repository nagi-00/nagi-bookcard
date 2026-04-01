// src/main.js
import './styles/main.css'
import { state, setState, subscribe } from './state.js'
import { renderCard } from './modules/card.js'
import { searchBooks } from './modules/search.js'
import { deriveColors, applyCssVars, pickColorWithEyeDropper } from './modules/colorSystem.js'
import { exportToPng, exportToClipboard } from './modules/export.js'

// ── 패널 HTML 주입 ──
document.getElementById('panel').innerHTML = `
  <div class="panel-section">
    <div class="panel-section-title">책 검색</div>
    <div id="search-wrap">
      <input id="search-input" type="text" placeholder="책 제목 검색...">
      <button id="search-btn">🔍</button>
    </div>
    <div id="search-results"></div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">책 정보</div>
    <input id="title-input" class="text-input" type="text" placeholder="제목 *">
    <input id="author-input" class="text-input" type="text" placeholder="저자 *">
    <input id="date-input" class="text-input" type="date">
    <button id="cover-upload-btn">📖 표지 이미지 업로드</button>
    <input id="cover-file" type="file" accept="image/*" style="display:none">
  </div>

  <div class="panel-section">
    <div class="toggle-row">
      <label>감상 / 구절</label>
      <button class="toggle on" id="quote-toggle"><div class="toggle-knob"></div></button>
    </div>
    <textarea id="quote-input" class="text-input" placeholder="오늘의 한 문장..."></textarea>
    <div class="toggle-row">
      <label>별점</label>
      <button class="toggle on" id="rating-toggle"><div class="toggle-knob"></div></button>
    </div>
    <div id="star-input">
      ${[1,2,3,4,5].map(i => `<button class="star-btn" data-val="${i}">★</button>`).join('')}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">화면 비율</div>
    <div class="ratio-buttons">
      ${['9:16','3:4','1:1','4:3','16:9'].map(r =>
        `<button class="ratio-btn${r==='9:16'?' active':''}" data-ratio="${r}">${r}</button>`
      ).join('')}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">배경</div>
    <div class="bg-presets">
      <div class="bg-swatch active" data-bg-preset="beige" style="background:#F0EBE3" title="베이지"></div>
      <div class="bg-swatch" data-bg-preset="white" style="background:#FFFFFF" title="화이트"></div>
      <div class="bg-swatch" data-bg-preset="gray" style="background:#9E9A94" title="그레이"></div>
      <div class="bg-swatch" data-bg-preset="black" style="background:#1A1A1A" title="블랙"></div>
      <input id="bg-color-input" type="color" value="#F0EBE3" title="커스텀">
      <button id="bg-image-btn" class="bg-image-btn">사진 업로드</button>
      <input id="bg-file" type="file" accept="image/*" style="display:none">
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">컬러</div>
    <div class="color-row">
      <input id="accent-picker" type="color" value="#8FAF8E">
      <button id="eyedropper-btn" class="eyedropper-btn">🎨 스포이드</button>
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">폰트</div>
    <select id="font-select">
      <option value="modern">Modern — Pretendard</option>
      <option value="literary">Literary — Noto Serif KR</option>
      <option value="soft">Soft — Gowun Dodum</option>
    </select>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">테마</div>
    <div class="theme-toggle-wrap">
      <span class="theme-label">라이트</span>
      <button class="toggle" id="theme-toggle"><div class="toggle-knob"></div></button>
      <span class="theme-label">다크</span>
    </div>
  </div>

  <div class="panel-section">
    <div class="export-buttons">
      <button class="export-btn secondary" id="clipboard-btn">클립보드</button>
      <button class="export-btn primary" id="save-btn">PNG 저장</button>
    </div>
  </div>
`

// 미리보기 컨테이너
document.getElementById('preview').innerHTML = `<div id="preview-inner"></div>`
const previewInner = document.getElementById('preview-inner')

// ── 초기 날짜 설정 ──
const today = new Date()
document.getElementById('date-input').value = today.toISOString().split('T')[0]
setState({ date: today })

// ── 카드 렌더링 + 스케일 ──
function update() {
  const colors = deriveColors(state.accentColor, state.theme)
  setState({ colors })
  applyCssVars(colors)

  renderCard(previewInner)
  scalePreview()
}

function scalePreview() {
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  const W = scene.offsetWidth, H = scene.offsetHeight
  const avW = document.getElementById('preview').offsetWidth - 80
  const avH = document.getElementById('preview').offsetHeight - 80
  const scale = Math.min(avW / W, avH / H, 1)
  previewInner.style.transform = `scale(${scale})`
}

window.addEventListener('resize', scalePreview)

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
  results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680">검색 중...</div>'
  results.classList.add('open')
  const books = await searchBooks(q)
  if (!books.length) {
    results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680">결과 없음</div>'
    return
  }
  results.innerHTML = books.map((b, i) => `
    <div class="search-result-item" data-idx="${i}">
      <img src="${b.cover||''}" onerror="this.style.display='none'">
      <div>
        <div class="search-result-title">${b.title}</div>
        <div class="search-result-author">${b.author}</div>
      </div>
    </div>`).join('')
  results.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const b = books[+el.dataset.idx]
      setState({ title: b.title, author: b.author, cover: b.cover || null })
      document.getElementById('title-input').value = b.title
      document.getElementById('author-input').value = b.author
      results.classList.remove('open')
      document.getElementById('search-input').value = ''
    })
  })
}

// 닫기
document.addEventListener('click', e => {
  if (!document.getElementById('search-wrap').contains(e.target)) {
    document.getElementById('search-results').classList.remove('open')
  }
})

// 제목/저자
document.getElementById('title-input').addEventListener('input', e => setState({ title: e.target.value }))
document.getElementById('author-input').addEventListener('input', e => setState({ author: e.target.value }))

// 날짜
document.getElementById('date-input').addEventListener('change', e => {
  setState({ date: new Date(e.target.value) })
})

// 표지 업로드
document.getElementById('cover-upload-btn').addEventListener('click', () => {
  document.getElementById('cover-file').click()
})
document.getElementById('cover-file').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = ev => setState({ cover: null, userImage: ev.target.result })
  reader.readAsDataURL(file)
})

// 감상 토글
document.getElementById('quote-toggle').addEventListener('click', function() {
  const on = this.classList.toggle('on')
  setState({ quoteEnabled: on })
})
document.getElementById('quote-input').addEventListener('input', e => setState({ quote: e.target.value }))

// 별점 토글
document.getElementById('rating-toggle').addEventListener('click', function() {
  const on = this.classList.toggle('on')
  setState({ ratingEnabled: on })
})

// 별점 클릭
document.getElementById('star-input').addEventListener('click', e => {
  const btn = e.target.closest('.star-btn'); if (!btn) return
  const val = +btn.dataset.val
  setState({ rating: val })
  document.querySelectorAll('#star-input .star-btn').forEach((b, i) => {
    b.classList.toggle('on', i < val)
  })
})

// 비율
document.querySelectorAll('.ratio-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'))
    this.classList.add('active')
    setState({ ratio: this.dataset.ratio })
  })
})

// 배경 프리셋
const BG_PRESETS = { white:'#FFFFFF', beige:'#F0EBE3', gray:'#9E9A94', black:'#1A1A1A' }
document.querySelectorAll('.bg-swatch').forEach(el => {
  el.addEventListener('click', function() {
    document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'))
    this.classList.add('active')
    const preset = this.dataset.bgPreset
    setState({ bgPreset: preset, bgColor: BG_PRESETS[preset], bgImage: null })
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
  reader.onload = ev => setState({ bgPreset: 'image', bgImage: ev.target.result })
  reader.readAsDataURL(file)
})

// 액센트 컬러
document.getElementById('accent-picker').addEventListener('input', e => {
  setState({ accentColor: e.target.value })
})

// 스포이드
document.getElementById('eyedropper-btn').addEventListener('click', async () => {
  const hex = await pickColorWithEyeDropper()
  if (hex) {
    document.getElementById('accent-picker').value = hex
    setState({ accentColor: hex })
  }
})

// 폰트
document.getElementById('font-select').addEventListener('change', e => {
  setState({ font: e.target.value })
})

// 테마
document.getElementById('theme-toggle').addEventListener('click', function() {
  const isDark = this.classList.toggle('on')
  setState({ theme: isDark ? 'dark' : 'light' })
})

// 내보내기
document.getElementById('save-btn').addEventListener('click', async () => {
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  document.getElementById('save-btn').textContent = '저장 중...'
  try {
    await exportToPng(scene)
  } finally {
    document.getElementById('save-btn').textContent = 'PNG 저장'
  }
})
document.getElementById('clipboard-btn').addEventListener('click', async () => {
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  document.getElementById('clipboard-btn').textContent = '복사 중...'
  try {
    await exportToClipboard(scene)
    document.getElementById('clipboard-btn').textContent = '✓ 복사됨'
    setTimeout(() => { document.getElementById('clipboard-btn').textContent = '클립보드' }, 2000)
  } catch {
    document.getElementById('clipboard-btn').textContent = '클립보드'
  }
})

// ── 상태 변경 → 카드 재렌더링 ──
subscribe(update)

// ── 초기 렌더링 ──
update()
