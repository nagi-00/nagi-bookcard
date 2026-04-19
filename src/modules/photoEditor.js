// src/modules/photoEditor.js
// 이미지 편집기: 이동 · 확대 · 회전 · 반전
// 캔버스 비율 = 책 표지 비율(1:1.42). 캔버스 경계 = 저장 범위.
//
// 사용감 개선 (P0~P2 일괄 적용):
//  - 줌 최소값 1.0 (이미지가 캔버스를 항상 덮음 → 여백 저장 방지)
//  - 커서 기준 휠 줌 + 2-finger 핀치 줌 (중심점 기준)
//  - 회전 시 ox/oy를 같은 각도로 회전 → 보던 지점 중앙 유지
//  - 팬 범위 clamp (±cW/2, ±cH/2) → 이미지가 화면 밖으로 완전히 빠지는 것 방지
//  - 현재 배율 표시 + 초기화 버튼
//  - 키보드 단축키: Enter 적용 · Esc 취소 · R/Shift+R 회전 · H/V 반전 · 0 초기화
//  - 포커스된 INPUT/BUTTON에서 Enter는 편집 적용을 트리거하지 않음
//  - 모달 외부 클릭 → 취소
//  - 로드 실패 시 토스트 알림
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
      const cW = 260, cH = 370
      const BG = '#F8F6F2'
      const MIN_SCALE = 1, MAX_SCALE = 5

      let scale = 1, ox = 0, oy = 0, rot = 0
      let fx = false, fy = false
      let imgDrag = null
      let pinch   = null   // { d0, s0, ax, ay }

      const overlay = document.createElement('div')
      overlay.className = 'photo-editor-overlay'
      overlay.innerHTML = `
        <div class="photo-editor-modal" role="dialog" aria-label="이미지 편집">
          <div class="photo-editor-title">이미지 편집</div>
          <div class="photo-editor-canvas-wrap">
            <canvas class="photo-editor-canvas" width="${cW}" height="${cH}"
              style="cursor:grab;"></canvas>
          </div>
          <div class="photo-editor-controls">
            <span class="editor-label">확대</span>
            <input type="range" class="zoom-slider"
              min="${MIN_SCALE}" max="${MAX_SCALE}" step="0.01" value="1">
            <span class="zoom-readout">1.00×</span>
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

      const canvas   = overlay.querySelector('.photo-editor-canvas')
      const ctx      = canvas.getContext('2d')
      const slider   = overlay.querySelector('.zoom-slider')
      const readout  = overlay.querySelector('.zoom-readout')

      function baseFit() {
        const rotated = rot % 180 !== 0
        const iw = rotated ? img.height : img.width
        const ih = rotated ? img.width  : img.height
        return Math.max(cW / iw, cH / ih)
      }

      function clampPan() {
        ox = Math.max(-cW/2, Math.min(cW/2, ox))
        oy = Math.max(-cH/2, Math.min(cH/2, oy))
      }

      function paint(c, w, h, s) {
        c.fillStyle = BG
        c.fillRect(0, 0, w, h)
        c.save()
        c.translate(w/2 + ox*s, h/2 + oy*s)
        c.rotate(rot * Math.PI / 180)
        const bf = baseFit()
        c.scale(scale * bf * s * (fx ? -1 : 1), scale * bf * s * (fy ? -1 : 1))
        c.drawImage(img, -img.width/2, -img.height/2)
        c.restore()
      }

      function draw() {
        paint(ctx, cW, cH, 1)
        slider.value = scale
        readout.textContent = scale.toFixed(2) + '×'
      }

      draw()

      const ac = new AbortController()
      const signal = ac.signal

      // ── 캔버스 좌표 변환 ──
      function canvasPoint(clientX, clientY) {
        const rect = canvas.getBoundingClientRect()
        return {
          x: (clientX - rect.left) * (cW / rect.width),
          y: (clientY - rect.top)  * (cH / rect.height),
        }
      }

      // 커서 위치를 고정점으로 삼아 scale 변경
      function zoomAt(cx, cy, newScale) {
        const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
        if (clamped === scale) return
        const k = clamped / scale
        // 앵커(cx, cy) 기준으로 (ox, oy)를 비례 이동
        const px = cx - cW/2, py = cy - cH/2
        ox = px + (ox - px) * k
        oy = py + (oy - py) * k
        scale = clamped
        clampPan()
        draw()
      }

      // ── 드래그 (1-finger 팬) ──
      function onDown(e) {
        if (e.touches && e.touches.length >= 2) {
          const [t1, t2] = e.touches
          const d0 = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
          const mid = canvasPoint((t1.clientX + t2.clientX) / 2, (t1.clientY + t2.clientY) / 2)
          pinch = { d0, s0: scale, ax: mid.x, ay: mid.y }
          imgDrag = null
          return
        }
        if (e.type === 'touchstart') e.preventDefault()
        const t = e.touches?.[0] ?? e
        imgDrag = { sx: t.clientX, sy: t.clientY, ox0: ox, oy0: oy }
        canvas.style.cursor = 'grabbing'
      }

      function onMove(e) {
        if (pinch && e.touches && e.touches.length >= 2) {
          e.preventDefault()
          const [t1, t2] = e.touches
          const d = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
          zoomAt(pinch.ax, pinch.ay, pinch.s0 * (d / pinch.d0))
          return
        }
        if (!imgDrag) return
        if (e.type === 'touchmove') e.preventDefault()
        const t = e.touches?.[0] ?? e
        ox = imgDrag.ox0 + t.clientX - imgDrag.sx
        oy = imgDrag.oy0 + t.clientY - imgDrag.sy
        clampPan()
        draw()
      }

      function onUp(e) {
        if (e?.touches && e.touches.length >= 1) {
          pinch = null
          return
        }
        imgDrag = null; pinch = null
        canvas.style.cursor = 'grab'
      }

      canvas.addEventListener('mousedown',  onDown, { signal })
      canvas.addEventListener('touchstart', onDown, { passive: false, signal })
      document.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mouseup',    onUp,   { signal })
      document.addEventListener('touchmove',  onMove, { passive: false, signal })
      document.addEventListener('touchend',   onUp,   { signal })
      document.addEventListener('touchcancel', onUp,  { signal })

      // ── 휠 줌 (커서 기준) ──
      canvas.addEventListener('wheel', e => {
        e.preventDefault()
        // deltaMode 정규화: 0=pixel, 1=line(~16px), 2=page(~800px)
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 800 : 1
        const dy = e.deltaY * unit
        const factor = Math.exp(-dy * 0.0015)
        const p = canvasPoint(e.clientX, e.clientY)
        zoomAt(p.x, p.y, scale * factor)
      }, { passive: false, signal })

      // ── 슬라이더 줌 (캔버스 중앙 기준) ──
      slider.addEventListener('input', e => {
        zoomAt(cW/2, cH/2, parseFloat(e.target.value))
      }, { signal })

      // ── 회전 (보던 지점을 중앙에 유지) ──
      function rotateBy(delta) {
        const θ = delta * Math.PI / 180
        const c = Math.cos(θ), s = Math.sin(θ)
        const nox = ox*c - oy*s
        const noy = ox*s + oy*c
        ox = nox; oy = noy
        rot = (rot + delta + 360) % 360
        clampPan()
        draw()
      }

      function reset() {
        scale = 1; ox = 0; oy = 0; rot = 0; fx = false; fy = false; draw()
      }

      overlay.querySelector('#pe-rot-ccw').addEventListener('click', () => rotateBy(-90), { signal })
      overlay.querySelector('#pe-rot-cw' ).addEventListener('click', () => rotateBy(+90), { signal })
      overlay.querySelector('#pe-flip-h' ).addEventListener('click', () => { fx = !fx; draw() }, { signal })
      overlay.querySelector('#pe-flip-v' ).addEventListener('click', () => { fy = !fy; draw() }, { signal })
      overlay.querySelector('#pe-reset'  ).addEventListener('click', reset, { signal })

      // ── 정리 & 결과 ──
      function cleanup() {
        ac.abort()
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      }

      function apply() {
        const OUT_LONG = 1200
        const sc = OUT_LONG / Math.max(cW, cH)
        const out  = document.createElement('canvas')
        out.width  = Math.round(cW * sc)
        out.height = Math.round(cH * sc)
        paint(out.getContext('2d'), out.width, out.height, sc)
        cleanup()
        resolve(out.toDataURL('image/jpeg', 0.92))
      }

      function cancel() {
        cleanup()
        resolve(null)
      }

      // ── 키보드 ──
      document.addEventListener('keydown', e => {
        const tag = e.target?.tagName
        const typing = tag === 'INPUT' || tag === 'TEXTAREA'

        if (e.key === 'Escape') { e.preventDefault(); cancel(); return }
        if (e.key === 'Enter'  && !typing && tag !== 'BUTTON') {
          e.preventDefault(); apply(); return
        }
        if (typing) return

        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault()
          rotateBy(e.shiftKey ? -90 : +90)
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault(); fx = !fx; draw()
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault(); fy = !fy; draw()
        } else if (e.key === '0') {
          e.preventDefault(); reset()
        }
      }, { signal })

      // 버튼
      overlay.querySelector('.editor-cancel-btn').addEventListener('click', cancel, { signal })
      overlay.querySelector('.editor-confirm-btn').addEventListener('click', apply,  { signal })

      // 모달 외부(backdrop) 클릭 → 취소
      overlay.addEventListener('mousedown', e => {
        if (e.target === overlay) cancel()
      }, { signal })
    }
  })
}

// ── 미니 토스트 ──
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
