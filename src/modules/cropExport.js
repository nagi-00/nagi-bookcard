// src/modules/cropExport.js
// 내보내기용 크롭 선택 UI — card-scene 위에 오버레이로 표시
// resolve: { x, y, w, h } (scene 픽셀), null = 취소
export function openCropUI(scene) {
  return new Promise(resolve => {
    const W = scene.offsetWidth
    const H = scene.offsetHeight
    let ratio = '1:1'
    let drag  = null   // { mode, sx, sy, c0 }

    // 기본 크롭: 가운데 정방형
    let crop = centeredSquare()
    function centeredSquare() {
      const s = Math.min(W, H)
      return { x: Math.round((W-s)/2), y: Math.round((H-s)/2), w: s, h: s }
    }

    // ── DOM ──
    const overlay = document.createElement('div')
    overlay.className = 'crop-export-overlay'

    const canvas = document.createElement('canvas')
    canvas.className = 'crop-export-canvas'
    canvas.width  = W
    canvas.height = H

    const bar = document.createElement('div')
    bar.className = 'crop-export-bar'
    bar.innerHTML = `
      <div class="crop-ratio-group">
        <button class="ce-ratio-btn active" id="ce-1-1">1:1</button>
        <button class="ce-ratio-btn" id="ce-free">자유</button>
      </div>
      <div class="crop-action-group">
        <button class="ce-cancel-btn" id="ce-cancel">취소</button>
        <button class="ce-confirm-btn" id="ce-confirm">내보내기</button>
      </div>`

    overlay.appendChild(canvas)
    overlay.appendChild(bar)
    const prevPos = scene.style.position
    scene.style.position = 'relative'
    scene.appendChild(overlay)

    const ctx = canvas.getContext('2d')

    // ── 그리기 ──
    function draw() {
      ctx.clearRect(0, 0, W, H)
      // 어두운 오버레이
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, W, H)
      // 크롭 영역 투명하게
      const { x, y, w, h } = crop
      ctx.clearRect(x, y, w, h)
      // 테두리
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 2
      ctx.strokeRect(x+1, y+1, w-2, h-2)
      // 삼등분 가이드
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      for (const t of [1/3, 2/3]) {
        ctx.beginPath(); ctx.moveTo(x+w*t, y); ctx.lineTo(x+w*t, y+h); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, y+h*t); ctx.lineTo(x+w, y+h*t); ctx.stroke()
      }
      // 코너 핸들
      const hs = 12
      ctx.fillStyle = '#fff'
      for (const [cx, cy] of [[x,y],[x+w-hs,y],[x,y+h-hs],[x+w-hs,y+h-hs]]) ctx.fillRect(cx, cy, hs, hs)
    }

    // ── 히트 테스트 ──
    function hitHandle(px, py) {
      const { x, y, w, h } = crop
      const R = 18
      if (Math.abs(px-x)     < R && Math.abs(py-y)     < R) return 'tl'
      if (Math.abs(px-(x+w)) < R && Math.abs(py-y)     < R) return 'tr'
      if (Math.abs(px-x)     < R && Math.abs(py-(y+h)) < R) return 'bl'
      if (Math.abs(px-(x+w)) < R && Math.abs(py-(y+h)) < R) return 'br'
      if (px > x+R && px < x+w-R && py > y+R && py < y+h-R) return 'move'
      return 'create'
    }

    function canvasPos(e) {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches?.[0] ?? e
      return {
        x: (t.clientX - rect.left) * (W / rect.width),
        y: (t.clientY - rect.top)  * (H / rect.height),
      }
    }

    // ── 드래그 ──
    function onDown(e) {
      e.preventDefault()
      const p = canvasPos(e)
      drag = { mode: hitHandle(p.x, p.y), sx: p.x, sy: p.y, c0: { ...crop } }
    }

    function onMove(e) {
      e.preventDefault()
      if (!drag) return
      const p  = canvasPos(e)
      const dx = p.x - drag.sx, dy = p.y - drag.sy
      const c0 = drag.c0
      const MIN = 20
      let { x, y, w, h } = c0

      if (drag.mode === 'create') {
        x = Math.max(0, Math.min(p.x, drag.sx))
        y = Math.max(0, Math.min(p.y, drag.sy))
        w = Math.abs(dx); h = Math.abs(dy)
        if (ratio === '1:1') { const s = Math.max(w, h); w = s; h = s }
        w = Math.min(w, W-x); h = Math.min(h, H-y)
      } else if (drag.mode === 'move') {
        x = Math.max(0, Math.min(W-w, x+dx))
        y = Math.max(0, Math.min(H-h, y+dy))
      } else {
        if (drag.mode === 'tl') {
          x = Math.max(0, Math.min(c0.x+c0.w-MIN, c0.x+dx))
          y = Math.max(0, Math.min(c0.y+c0.h-MIN, c0.y+dy))
          w = c0.x+c0.w - x; h = c0.y+c0.h - y
        } else if (drag.mode === 'tr') {
          y = Math.max(0, Math.min(c0.y+c0.h-MIN, c0.y+dy))
          w = Math.max(MIN, Math.min(W-x, c0.w+dx)); h = c0.y+c0.h - y
        } else if (drag.mode === 'bl') {
          x = Math.max(0, Math.min(c0.x+c0.w-MIN, c0.x+dx))
          w = c0.x+c0.w - x; h = Math.max(MIN, Math.min(H-y, c0.h+dy))
        } else if (drag.mode === 'br') {
          w = Math.max(MIN, Math.min(W-x, c0.w+dx))
          h = Math.max(MIN, Math.min(H-y, c0.h+dy))
        }
        if (ratio === '1:1') {
          const s = Math.max(w, h)
          if (drag.mode === 'tl') { x = c0.x+c0.w-s; y = c0.y+c0.h-s }
          else if (drag.mode === 'tr') { y = c0.y+c0.h-s }
          else if (drag.mode === 'bl') { x = c0.x+c0.w-s }
          w = s; h = s
          x = Math.max(0, x); y = Math.max(0, y)
          const ss = Math.min(w, W-x, H-y)
          w = ss; h = ss
        }
      }

      crop = {
        x: Math.round(Math.max(0, x)),
        y: Math.round(Math.max(0, y)),
        w: Math.round(Math.max(MIN, w)),
        h: Math.round(Math.max(MIN, h)),
      }
      draw()
    }

    function onUp() { drag = null }

    canvas.addEventListener('mousedown',  onDown)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('touchmove',  onMove, { passive: false })
    document.addEventListener('touchend',   onUp)

    function cleanup() {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onUp)
      scene.removeChild(overlay)
      scene.style.position = prevPos
    }

    bar.querySelector('#ce-cancel').addEventListener('click',  () => { cleanup(); resolve(null) })
    bar.querySelector('#ce-confirm').addEventListener('click', () => { cleanup(); resolve({ ...crop }) })

    bar.querySelector('#ce-1-1').addEventListener('click', () => {
      ratio = '1:1'
      bar.querySelector('#ce-1-1').classList.add('active')
      bar.querySelector('#ce-free').classList.remove('active')
      const s  = Math.min(crop.w, crop.h)
      const cx = Math.max(0, Math.min(W-s, crop.x + (crop.w-s)/2))
      const cy = Math.max(0, Math.min(H-s, crop.y + (crop.h-s)/2))
      crop = { x: Math.round(cx), y: Math.round(cy), w: s, h: s }
      draw()
    })
    bar.querySelector('#ce-free').addEventListener('click', () => {
      ratio = 'free'
      bar.querySelector('#ce-free').classList.add('active')
      bar.querySelector('#ce-1-1').classList.remove('active')
    })

    draw()
  })
}
