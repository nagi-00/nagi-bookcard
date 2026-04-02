// src/main.js
import './styles/main.css'
import { state, setState, subscribe } from './state.js'
import { renderCard } from './modules/card.js'
import { searchBooks } from './modules/search.js'
import { deriveColors, applyCssVars, pickColorWithEyeDropper } from './modules/colorSystem.js'
import { exportToPng, exportToClipboard } from './modules/export.js'

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── 패널 HTML 주입 ──
document.getElementById('panel').innerHTML = `
  <div class="panel-section">
    <div class="panel-section-title">sᴇᴀʀᴄʜ</div>
    <div id="search-wrap">
      <input id="search-input" type="text" placeholder="ғᴏʀ...">
      <button id="search-btn"><svg height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="#ffffff"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg></button>
    </div>
    <div id="search-results"></div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ʙᴏᴏᴋ ɪɴғᴏ</div>
    <input id="title-input" class="text-input" type="text" placeholder="ᴛɪᴛʟᴇ *">
    <input id="author-input" class="text-input" type="text" placeholder="ᴀᴜᴛʜᴏʀ *">
    <input id="date-input" class="text-input" type="date">
    <button id="cover-upload-btn"><svg height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="#ffffff"><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></svg>ᴜᴘʟᴏᴀᴅ ᴍʏ ᴏᴡɴ</button>
    <input id="cover-file" type="file" accept="image/*" style="display:none">
  </div>

  <div class="panel-section">
    <div class="toggle-row">
      <label>ɴᴏᴛᴇs & ǫᴜᴏᴛᴇs</label>
      <button class="toggle on" id="quote-toggle"><div class="toggle-knob"></div></button>
    </div>
    <textarea id="quote-input" class="text-input" placeholder="ɴᴏᴛᴇs & ǫᴜᴏᴛᴇs"></textarea>
    <div class="toggle-row">
      <label>sᴛᴀʀ</label>
      <button class="toggle on" id="rating-toggle"><div class="toggle-knob"></div></button>
    </div>
    <div id="star-input">
      ${[1,2,3,4,5].map(i => `<button class="star-btn" data-val="${i}">★</button>`).join('')}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ʀᴀᴛɪᴏ</div>
    <div class="ratio-buttons">
      ${['9:16','3:4','1:1','4:3','16:9'].map(r =>
        `<button class="ratio-btn${r==='9:16'?' active':''}" data-ratio="${r}">${r}</button>`
      ).join('')}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ʙᴀᴄᴋɢʀᴏᴜɴᴅs</div>
    <div class="bg-presets">
      <div class="bg-swatch active" data-bg-preset="beige" style="background:#F0EBE3" title="ᴏᴀᴛᴍɪʟʟ"></div>
      <div class="bg-swatch" data-bg-preset="white" style="background:#FFFFFF" title="sɴᴏᴡ"></div>
      <div class="bg-swatch" data-bg-preset="gray" style="background:#9E9A94" title="ᴍᴏᴜsᴇ"></div>
      <div class="bg-swatch" data-bg-preset="black" style="background:#1A1A1A" title="ʙʟᴀɴᴋ"></div>
      <input id="bg-color-input" type="color" value="#F0EBE3" title="ᴄᴜsᴛᴏᴍ">
      <button id="bg-image-btn" class="bg-image-btn">ᴜᴘʟᴏᴀᴅ ᴍʏ ᴏᴡɴ</button>
      <input id="bg-file" type="file" accept="image/*" style="display:none">
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ᴄᴏʟᴏʀ</div>
    <div class="color-row">
      <input id="accent-picker" type="color" value="#8FAF8E">
      <button id="eyedropper-btn" class="eyedropper-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.63596 10.2927L9.70703 3.22168L18.1923 11.707L11.1212 18.778C10.3402 19.5591 9.07387 19.5591 8.29282 18.778L2.63596 13.1212C1.85492 12.3401 1.85492 11.0738 2.63596 10.2927Z" fill="#ffffff"/>
<path d="M8.29297 1.80762L9.70718 3.22183" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.9991 15C19.9991 15 22.9991 17.9934 22.9994 19.8865C22.9997 21.5422 21.6552 22.8865 19.9997 22.8865C18.3442 22.8865 17.012 21.5422 17 19.8865C17.0098 17.9924 19.9991 15 19.9991 15Z" fill="#ffffff" stroke-miterlimit="1.5"/>
</svg> ᴘɪᴄᴋ ᴍʏ ᴏᴡɴ</button>
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ғᴏɴᴛs</div>
    <select id="font-select">
      <option value="modern">Modern — Pretendard</option>
      <option value="literary">Literary — Noto Serif KR</option>
      <option value="soft">Soft — Gowun Dodum</option>
    </select>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">ғᴏʟᴅᴇʀ ᴄᴏʟᴏʀ</div>
    <div class="theme-toggle-wrap">
      <span class="theme-label">ʟɪɢʜᴛ</span>
      <button class="toggle" id="theme-toggle"><div class="toggle-knob"></div></button>
      <span class="theme-label">ᴅᴀʀᴋ</span>
    </div>
  </div>

  <div class="panel-section">
    <div class="export-buttons">
      <button class="export-btn secondary" id="clipboard-btn">ᴄᴏᴘʏ ᴛᴏ ᴄʟɪᴘʙᴏᴀʀᴅ</button>
      <button class="export-btn primary" id="save-btn">sᴀᴠᴇ ᴛᴏ .ᴘɴɢ</button>
    </div>
  </div>
`

// 미리보기 컨테이너
document.getElementById('preview').innerHTML = `<div id="preview-inner"></div>`
const previewInner = document.getElementById('preview-inner')

// ── 초기 날짜 설정 ──
const today = new Date()
document.getElementById('date-input').value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
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
  results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680">sᴇᴀʀᴄʜɪɴɢ...</div>'
  results.classList.add('open')
  const books = await searchBooks(q)
  if (!books.length) {
    results.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#8C8680"> ɴᴏ ʀᴇsᴜʟᴛs.</div>'
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
  document.getElementById('save-btn').textContent = 'sᴀᴠɪɴɢ...'
  try {
    await exportToPng(scene)
  } finally {
    document.getElementById('save-btn').textContent = 'sᴀᴠᴇ ᴛᴏ .ᴘɴɢ'
  }
})
document.getElementById('clipboard-btn').addEventListener('click', async () => {
  const scene = previewInner.querySelector('.card-scene')
  if (!scene) return
  document.getElementById('clipboard-btn').textContent = 'ᴄᴏᴘʏɪɴɢ...'
  try {
    await exportToClipboard(scene)
    document.getElementById('clipboard-btn').textContent = 'ᴅᴏɴᴇ!'
    setTimeout(() => { document.getElementById('clipboard-btn').textContent = 'ᴄʟɪᴘʙᴏᴀʀᴅ' }, 2000)
  } catch {
    document.getElementById('clipboard-btn').textContent = 'ᴄʟɪᴘʙᴏᴀʀᴅ'
  }
})

// ── 상태 변경 → 카드 재렌더링 ──
subscribe(update)

// ── 초기 렌더링 ──
update()
