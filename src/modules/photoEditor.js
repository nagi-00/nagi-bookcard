// src/modules/photoEditor.js
// 업로드 이미지 편집기 — 원본 비율을 유지한 채 사각형 크롭
//
// 사용 흐름:
//  1) 업로드한 이미지를 원본 비율 그대로 캔버스에 표시 (최대 480×520에 맞춰 축소)
//  2) 사각형 크롭 오버레이로 원하는 영역 선택 (기본값: 전체)
//  3) 귀퉁이 드래그로 자유 비율 조정 · 내부 드래그로 이동
//  4) 1:1 프리셋 버튼으로 정사각 고정 / 자유 버튼으로 해제
//  5) 회전·반전 지원 (보존된 크롭 위치는 회전 시 전체 선택으로 초기화)
//  6) 키보드: Enter 적용 · Esc 취소 · R/Shift+R 회전 · H/V 반전 · 0 초기화
//  7) 모달 외부 클릭 → 취소 · 로드 실패 시 토스트
export function openPhotoEditor(imgSrc) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => initEditor()
    img.onerror = () => {
      showToast('이미지를 불러오지 못했습니다')
      resolve(null)
    }
    img.src = imgSrc

    function initEditor() {
      const MAX_W = 480, MAX_H = 520
      const BG = '#F8F6F2'
      const MIN_CROP = 24
      const HANDLE = 12

      let rot = 0, fx = false, fy = false
      let ratio = 'free'      // 'free' | '1:1'
      let cW = 0, cH = 0
      let crop = { x: 0, y: 0, w: 0, h: 0 }
      let drag = null         // { mode, sx, sy, c0 }

      function recomputeCanvas() {
        const rotated = rot % 180 !== 0
        const iw = rotated ? img.height : img.width
        const ih = rotated ? img.width  : img.height
        const fit = Math.min(MAX_W / iw, MAX_H / ih, 1)
        cW = Math.max(1, Math.round(iw * fit))
        cH = Math.max(1, Math.round(ih * fit))
      }

      function resetCropToFull() {
        crop = { x: 0, y: 0, w: cW, h: cH }
        if (ratio === '1:1') applyRatioConstraint()
      }

      function applyRatioConstraint() {
        const s = Math.min(crop.w, crop.h, cW, cH)
        const cx = crop.x + crop.w / 2
        const cy = crop.y + crop.h / 2
        let x = Math.round(cx - s / 2)
        let y = Math.round(cy - s / 2)
        x = Math.max(0, Math.min(cW - s, x))
        y = Math.max(0, Math.min(cH - s, y))
        crop = { x, y, w: s, h: s }
      }

      recomputeCanvas()
      resetCropToFull()

      const overlay = document.createElement('div')
      overlay.className = 'photo-editor-overlay'
      overlay.innerHTML = `
        <div class="photo-editor-modal" role="dialog" aria-label="이미지 편집">
          <div class="photo-editor-title">이미지 편집</div>
          <div class="photo-editor-canvas-wrap">
            <canvas class="photo-editor-canvas"></canvas>
          </div>
          <div class="photo-editor-controls">
            <span class="editor-label">비율</span>
            <div class="editor-btn-row">
              <button class="edit-btn ratio-btn active" id="pe-free">자유</button>
              <button class="edit-btn ratio-btn" id="pe-1-1">1:1</button>
            </div>
          </div>
          <div class="photo-editor-controls">
            <div class="editor-btn-row" style="flex:1;">
              <button class="edit-btn" id="pe-rot-ccw" title="반시계 회전 (Shift+R)">↺</button>
              <button class="edit-btn" id="pe-rot-cw"  title="시계 회전 (R)">↻</button>
              <button class="edit-btn" id="pe-flip-h"  title="좌우 반전 (H)">⇄</button>
              <button class="edit-btn" id="pe-flip-v"  title="상하 반전 (V)">↕</button>
              <button class="edit-btn" id="pe-reset"   title="초기화 (0)">↻0</button>
            </div>
          </div>
          <div class="photo-editor-actions">
            <button class="editor-cancel-btn" type="button">취소 (Esc)</button>
            <button class="editor-confirm-btn" type="button">적용 (Enter)</button>
          </div>
        </div>`
      document.body.appendChild(overlay)

      const canvas = overlay.querySelector('.photo-editor-canvas')
      const ctx    = canvas.getContext('2d')

      function syncCanvasSize() {
        canvas.width  = cW
        canvas.height = cH
        canvas.style.width  = cW + 'px'
        canvas.style.height = cH + 'px'
      }

      function paintImageInto(c, w, h) {
        c.save()
        c.translate(w / 2, h / 2)
        c.rotate(rot * Math.PI / 180)
        const rotated = rot % 180 !== 0
        const iw = rotated ? img.height : img.width
        const ih = rotated ? img.width  : img.height
        const k = Math.min(w / iw, h / ih)
        c.scale(k * (fx ? -1 : 1), k * (fy ? -1 : 1))
        c.drawImage(img, -img.width / 2, -img.height / 2)
        c.restore()
      }

      function drawCropOverlay() {
        const { x, y, w, h } = crop
        ctx.save()
        ctx.fillStyle = 'rgba(26,24,22,0.38)'
        ctx.fillRect(0, 0, cW, y)
        ctx.fillRect(0, y, x, h)
        ctx.fillRect(x + w, y, cW - x - w, h)
        ctx.fillRect(0, y + h, cW, cH - y - h)

        ctx.strokeStyle = 'rgba(255,255,255,0.95)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5)

        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (const t of [1/3, 2/3]) {
          ctx.moveTo(x + w * t, y);     ctx.lineTo(x + w * t, y + h)
          ctx.moveTo(x,         y + h*t); ctx.lineTo(x + w,     y + h * t)
        }
        ctx.stroke()

        ctx.fillStyle = '#fff'
        const hs = HANDLE
        for (const [hx, hy] of [
          [x, y],
          [x + w - hs, y],
          [x, y + h - hs],
          [x + w - hs, y + h - hs],
        ]) ctx.fillRect(hx, hy, hs, hs)
        ctx.restore()
      }

      function draw() {
        syncCanvasSize()
        ctx.fillStyle = BG
        ctx.fillRect(0, 0, cW, cH)
        paintImageInto(ctx, cW, cH)
        drawCropOverlay()
      }

      draw()

      const ac = new AbortController()
      const signal = ac.signal

      function canvasPoint(clientX, clientY) {
        const rect = canvas.getBoundingClientRect()
        return {
          x: (clientX - rect.left) * (cW / rect.width),
          y: (clientY - rect.top)  * (cH / rect.height),
        }
      }

      function hitTest(px, py) {
        const { x, y, w, h } = crop
        const R = 20
        if (Math.abs(px - x)     < R && Math.abs(py - y)     < R) return 'tl'
        if (Math.abs(px - (x+w)) < R && Math.abs(py - y)     < R) return 'tr'
        if (Math.abs(px - x)     < R && Math.abs(py - (y+h)) < R) return 'bl'
        if (Math.abs(px - (x+w)) < R && Math.abs(py - (y+h)) < R) return 'br'
        if (px > x && px < x + w && py > y && py < y + h)         return 'move'
        return null
      }

      function cursorFor(mode) {
        if (mode === 'tl' || mode === 'br') return 'nwse-resize'
        if (mode === 'tr' || mode === 'bl') return 'nesw-resize'
        if (mode === 'move') return 'move'
        return 'default'
      }

      function clampResized(x, y, w, h) {
        x = Math.max(0, Math.min(cW - MIN_CROP, x))
        y = Math.max(0, Math.min(cH - MIN_CROP, y))
        w = Math.max(MIN_CROP, Math.min(cW - x, w))
        h = Math.max(MIN_CROP, Math.min(cH - y, h))
        return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }
      }

      function resizeWith(mode, dx, dy, c0) {
        let x = c0.x, y = c0.y, w = c0.w, h = c0.h
        if (mode === 'tl') { x = c0.x + dx; y = c0.y + dy; w = c0.w - dx; h = c0.h - dy }
        else if (mode === 'tr') { y = c0.y + dy; w = c0.w + dx; h = c0.h - dy }
        else if (mode === 'bl') { x = c0.x + dx; w = c0.w - dx; h = c0.h + dy }
        else if (mode === 'br') { w = c0.w + dx; h = c0.h + dy }

        if (ratio === '1:1') {
          const desired = Math.max(MIN_CROP, Math.min(w, h))
          let maxS
          if (mode === 'br')      maxS = Math.min(cW - c0.x,     cH - c0.y)
          else if (mode === 'tr') maxS = Math.min(cW - c0.x,     c0.y + c0.h)
          else if (mode === 'bl') maxS = Math.min(c0.x + c0.w,   cH - c0.y)
          else                    maxS = Math.min(c0.x + c0.w,   c0.y + c0.h)
          const s = Math.max(MIN_CROP, Math.min(desired, maxS))
          if (mode === 'br')      { x = c0.x;            y = c0.y }
          else if (mode === 'tr') { x = c0.x;            y = c0.y + c0.h - s }
          else if (mode === 'bl') { x = c0.x + c0.w - s; y = c0.y }
          else                    { x = c0.x + c0.w - s; y = c0.y + c0.h - s }
          w = s; h = s
        }

        return clampResized(x, y, w, h)
      }

      function onDown(e) {
        if (e.touches && e.touches.length > 1) return
        if (e.type === 'touchstart') e.preventDefault()
        const t = e.touches?.[0] ?? e
        const p = canvasPoint(t.clientX, t.clientY)
        const mode = hitTest(p.x, p.y)
        if (!mode) return
        drag = { mode, sx: p.x, sy: p.y, c0: { ...crop } }
        canvas.style.cursor = cursorFor(mode)
      }

      function onMove(e) {
        const t = e.touches?.[0] ?? e
        const p = canvasPoint(t.clientX, t.clientY)

        if (!drag) {
          canvas.style.cursor = cursorFor(hitTest(p.x, p.y))
          return
        }

        if (e.type === 'touchmove') e.preventDefault()
        const dx = p.x - drag.sx, dy = p.y - drag.sy

        if (drag.mode === 'move') {
          const x = Math.max(0, Math.min(cW - drag.c0.w, drag.c0.x + dx))
          const y = Math.max(0, Math.min(cH - drag.c0.h, drag.c0.y + dy))
          crop = { ...drag.c0, x: Math.round(x), y: Math.round(y) }
        } else {
          crop = resizeWith(drag.mode, dx, dy, drag.c0)
        }
        draw()
      }

      function onUp() {
        drag = null
        canvas.style.cursor = 'default'
      }

      canvas.addEventListener('mousedown',  onDown, { signal })
      canvas.addEventListener('touchstart', onDown, { passive: false, signal })
      canvas.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mouseup',    onUp,   { signal })
      document.addEventListener('touchmove',  onMove, { passive: false, signal })
      document.addEventListener('touchend',   onUp,   { signal })
      document.addEventListener('touchcancel', onUp,  { signal })

      function setRatio(r) {
        ratio = r
        overlay.querySelector('#pe-free').classList.toggle('active', r === 'free')
        overlay.querySelector('#pe-1-1').classList.toggle('active', r === '1:1')
        if (r === '1:1') applyRatioConstraint()
        draw()
      }

      function rotateBy(delta) {
        rot = (rot + delta + 360) % 360
        recomputeCanvas()
        resetCropToFull()
        draw()
      }

      function reset() {
        rot = 0; fx = false; fy = false
        ratio = 'free'
        overlay.querySelector('#pe-free').classList.add('active')
        overlay.querySelector('#pe-1-1').classList.remove('active')
        recomputeCanvas()
        resetCropToFull()
        draw()
      }

      overlay.querySelector('#pe-free').addEventListener('click', () => setRatio('free'), { signal })
      overlay.querySelector('#pe-1-1').addEventListener('click', () => setRatio('1:1'),  { signal })
      overlay.querySelector('#pe-rot-ccw').addEventListener('click', () => rotateBy(-90), { signal })
      overlay.querySelector('#pe-rot-cw' ).addEventListener('click', () => rotateBy(+90), { signal })
      overlay.querySelector('#pe-flip-h' ).addEventListener('click', () => { fx = !fx; draw() }, { signal })
      overlay.querySelector('#pe-flip-v' ).addEventListener('click', () => { fy = !fy; draw() }, { signal })
      overlay.querySelector('#pe-reset'  ).addEventListener('click', reset, { signal })

      function cleanup() {
        ac.abort()
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      }

      function apply() {
        const LONG = 1200
        const s = LONG / Math.max(crop.w, crop.h)
        const outW = Math.max(1, Math.round(crop.w * s))
        const outH = Math.max(1, Math.round(crop.h * s))
        const out  = document.createElement('canvas')
        out.width  = outW
        out.height = outH
        const c = out.getContext('2d')
        c.fillStyle = BG
        c.fillRect(0, 0, outW, outH)
        c.translate(-crop.x * s, -crop.y * s)
        paintImageInto(c, cW * s, cH * s)
        cleanup()
        resolve(out.toDataURL('image/jpeg', 0.92))
      }

      function cancel() {
        cleanup()
        resolve(null)
      }

      document.addEventListener('keydown', e => {
        const tag = e.target?.tagName
        const typing = tag === 'INPUT' || tag === 'TEXTAREA'
        if (e.key === 'Escape') { e.preventDefault(); cancel(); return }
        if (e.key === 'Enter'  && !typing && tag !== 'BUTTON') {
          e.preventDefault(); apply(); return
        }
        if (typing) return
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault(); rotateBy(e.shiftKey ? -90 : +90)
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault(); fx = !fx; draw()
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault(); fy = !fy; draw()
        } else if (e.key === '0') {
          e.preventDefault(); reset()
        }
      }, { signal })

      overlay.querySelector('.editor-cancel-btn').addEventListener('click', cancel, { signal })
      overlay.querySelector('.editor-confirm-btn').addEventListener('click', apply,  { signal })

      overlay.addEventListener('mousedown', e => {
        if (e.target === overlay) cancel()
      }, { signal })
    }
  })
}

function showToast(msg) {
  const t = document.createElement('div')
  t.className = 'photo-editor-toast'
  t.textContent = msg
  document.body.appendChild(t)
  requestAnimationFrame(() => t.classList.add('show'))
  setTimeout(() => {
    t.classList.remove('show')
    setTimeout(() => t.remove(), 250)
  }, 2200)
}
