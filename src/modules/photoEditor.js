// src/modules/photoEditor.js
// 이미지 편집기: 이동 · 확대 · 회전 · 반전 · 자르기 (1:1 / 자유)
export function openPhotoEditor(imgSrc) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => initEditor()
    img.onerror = () => resolve(null)
    img.src = imgSrc

    function initEditor() {
      const D = 340   // 정방형 프리뷰 캔버스 크기

      // 이미지 상태
      let scale = 1, ox = 0, oy = 0, rot = 0
      let fx = false, fy = false   // flip X/Y

      // 크롭 상태 — 기본값: 전체 캔버스
      let crop   = { x: 0, y: 0, w: D, h: D }
      let aspect = '1:1'   // '1:1' | 'free'

      // 드래그 상태
      let imgDrag  = null   // { sx, sy, ox0, oy0 }
      let cropDrag = null   // { handle, sx, sy, c0 }

      // ── UI 구성 ──
      const overlay = document.createElement('div')
      overlay.className = 'photo-editor-overlay'
      overlay.innerHTML = `
        <div class="photo-editor-modal">
          <div class="photo-editor-title">이미지 편집</div>
          <div class="photo-editor-canvas-wrap">
            <canvas class="photo-editor-canvas" width="${D}" height="${D}"
              style="width:${D}px;height:${D}px;cursor:grab;display:block;"></canvas>
          </div>
          <div class="photo-editor-controls">
            <span class="editor-label">확대</span>
            <input type="range" class="zoom-slider" min="0.5" max="5" step="0.01" value="1">
            <div class="editor-btn-row">
              <button class="edit-btn" id="pe-rot-ccw" title="반시계 회전">↺</button>
              <button class="edit-btn" id="pe-rot-cw"  title="시계 회전">↻</button>
              <button class="edit-btn" id="pe-flip-h"  title="좌우 반전">⇄</button>
              <button class="edit-btn" id="pe-flip-v"  title="상하 반전">↕</button>
            </div>
          </div>
          <div class="photo-editor-crop-row">
            <span class="editor-label">자르기</span>
            <button class="crop-btn active" id="pe-1-1">1:1</button>
            <button class="crop-btn" id="pe-free">자유</button>
            <button class="crop-btn" id="pe-full">전체</button>
          </div>
          <div class="photo-editor-actions">
            <button class="editor-cancel-btn">취소</button>
            <button class="editor-confirm-btn">적용</button>
          </div>
        </div>`
      document.body.appendChild(overlay)

      const canvas = overlay.querySelector('.photo-editor-canvas')
      const ctx    = canvas.getContext('2d')

      // ── 헬퍼 ──
      function baseFit() {
        const rotated = rot % 180 !== 0
        const iw = rotated ? img.height : img.width
        const ih = rotated ? img.width  : img.height
        return Math.max(D / iw, D / ih)
      }

      function canvasPos(e) {
        const rect = canvas.getBoundingClientRect()
        const t = e.touches?.[0] ?? e
        return {
          x: (t.clientX - rect.left) * (D / rect.width),
          y: (t.clientY - rect.top)  * (D / rect.height),
        }
      }

      // 코너 핸들 히트 테스트
      function hitHandle(px, py) {
        const { x, y, w, h } = crop
        const R = 14
        if (Math.abs(px - x)     < R && Math.abs(py - y)     < R) return 'tl'
        if (Math.abs(px - (x+w)) < R && Math.abs(py - y)     < R) return 'tr'
        if (Math.abs(px - x)     < R && Math.abs(py - (y+h)) < R) return 'bl'
        if (Math.abs(px - (x+w)) < R && Math.abs(py - (y+h)) < R) return 'br'
        if (px > x+R && px < x+w-R && py > y+R && py < y+h-R)     return 'inside'
        return null
      }

      // ── 그리기 ──
      function draw() {
        ctx.clearRect(0, 0, D, D)

        // 이미지
        ctx.save()
        ctx.translate(D/2 + ox, D/2 + oy)
        ctx.rotate(rot * Math.PI / 180)
        const bf = baseFit()
        ctx.scale(scale * bf * (fx ? -1 : 1), scale * bf * (fy ? -1 : 1))
        ctx.drawImage(img, -img.width/2, -img.height/2)
        ctx.restore()

        // 크롭 오버레이
        const { x, y, w, h } = crop
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(0, 0, D, y)
        ctx.fillRect(0, y+h, D, D-y-h)
        ctx.fillRect(0, y, x, h)
        ctx.fillRect(x+w, y, D-x-w, h)

        // 크롭 테두리
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(x+0.75, y+0.75, w-1.5, h-1.5)

        // 삼등분 가이드
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 0.5
        for (const t of [1/3, 2/3]) {
          ctx.beginPath(); ctx.moveTo(x + w*t, y); ctx.lineTo(x + w*t, y+h); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(x, y + h*t); ctx.lineTo(x+w, y + h*t); ctx.stroke()
        }

        // 코너 핸들
        const hs = 10
        ctx.fillStyle = '#fff'
        for (const [cx, cy] of [[x,y],[x+w-hs,y],[x,y+h-hs],[x+w-hs,y+h-hs]]) {
          ctx.fillRect(cx, cy, hs, hs)
        }
      }

      draw()

      const ac = new AbortController()
      const signal = ac.signal

      // ── 이벤트 ──
      function onDown(e) {
        if (e.type === 'touchstart') e.preventDefault()
        const p = canvasPos(e)
        const hit = hitHandle(p.x, p.y)
        if (hit && hit !== 'inside') {
          cropDrag = { handle: hit, sx: p.x, sy: p.y, c0: { ...crop } }
          canvas.style.cursor = 'nwse-resize'
        } else if (hit === 'inside') {
          cropDrag = { handle: 'move', sx: p.x, sy: p.y, c0: { ...crop } }
          canvas.style.cursor = 'move'
        } else {
          const t = e.touches?.[0] ?? e
          imgDrag = { sx: t.clientX, sy: t.clientY, ox0: ox, oy0: oy }
          canvas.style.cursor = 'grabbing'
        }
      }

      function onMove(e) {
        if (e.type === 'touchmove') e.preventDefault()

        if (cropDrag) {
          const p  = canvasPos(e)
          const dx = p.x - cropDrag.sx, dy = p.y - cropDrag.sy
          const c0 = cropDrag.c0
          const MIN = 20
          let { x, y, w, h } = c0

          if (cropDrag.handle === 'move') {
            x = Math.max(0, Math.min(D-w, x+dx))
            y = Math.max(0, Math.min(D-h, y+dy))
          } else if (cropDrag.handle === 'tl') {
            x = Math.max(0, Math.min(c0.x+c0.w-MIN, c0.x+dx))
            y = Math.max(0, Math.min(c0.y+c0.h-MIN, c0.y+dy))
            w = c0.x+c0.w - x; h = c0.y+c0.h - y
          } else if (cropDrag.handle === 'tr') {
            y = Math.max(0, Math.min(c0.y+c0.h-MIN, c0.y+dy))
            w = Math.max(MIN, Math.min(D-x, c0.w+dx)); h = c0.y+c0.h - y
          } else if (cropDrag.handle === 'bl') {
            x = Math.max(0, Math.min(c0.x+c0.w-MIN, c0.x+dx))
            w = c0.x+c0.w - x; h = Math.max(MIN, Math.min(D-y, c0.h+dy))
          } else if (cropDrag.handle === 'br') {
            w = Math.max(MIN, Math.min(D-x, c0.w+dx))
            h = Math.max(MIN, Math.min(D-y, c0.h+dy))
          }

          // 1:1 비율 강제
          if (aspect === '1:1') {
            const s = Math.max(w, h)
            if (cropDrag.handle === 'tl') { x = c0.x+c0.w-s; y = c0.y+c0.h-s }
            else if (cropDrag.handle === 'tr') { y = c0.y+c0.h-s }
            else if (cropDrag.handle === 'bl') { x = c0.x+c0.w-s }
            w = s; h = s
            x = Math.max(0, x); y = Math.max(0, y)
            const ss = Math.min(w, D-x, D-y)
            w = ss; h = ss
          }

          crop = { x: Math.round(x), y: Math.round(y), w: Math.max(MIN, Math.round(w)), h: Math.max(MIN, Math.round(h)) }
          draw()
          return
        }

        if (imgDrag) {
          const t = e.touches?.[0] ?? e
          ox = imgDrag.ox0 + t.clientX - imgDrag.sx
          oy = imgDrag.oy0 + t.clientY - imgDrag.sy
          draw()
        }
      }

      function onUp() {
        cropDrag = null; imgDrag = null
        canvas.style.cursor = 'grab'
      }

      canvas.addEventListener('mousedown',  onDown, { signal })
      canvas.addEventListener('touchstart', onDown, { passive: false, signal })
      document.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mouseup',    onUp, { signal })
      document.addEventListener('touchmove',  onMove, { passive: false, signal })
      document.addEventListener('touchend',   onUp, { signal })

      canvas.addEventListener('wheel', e => {
        e.preventDefault()
        scale = Math.min(5, Math.max(0.5, scale - e.deltaY * 0.002))
        overlay.querySelector('.zoom-slider').value = scale
        draw()
      }, { passive: false, signal })

      overlay.querySelector('.zoom-slider').addEventListener('input', e => {
        scale = parseFloat(e.target.value); draw()
      })

      overlay.querySelector('#pe-rot-ccw').addEventListener('click', () => { rot = (rot-90+360)%360; draw() })
      overlay.querySelector('#pe-rot-cw').addEventListener('click',  () => { rot = (rot+90)%360; draw() })
      overlay.querySelector('#pe-flip-h').addEventListener('click',  () => { fx = !fx; draw() })
      overlay.querySelector('#pe-flip-v').addEventListener('click',  () => { fy = !fy; draw() })

      overlay.querySelector('#pe-1-1').addEventListener('click', () => {
        aspect = '1:1'
        overlay.querySelector('#pe-1-1').classList.add('active')
        overlay.querySelector('#pe-free').classList.remove('active')
        const s  = Math.min(crop.w, crop.h, D)
        const cx = Math.max(0, Math.min(D-s, crop.x + (crop.w-s)/2))
        const cy = Math.max(0, Math.min(D-s, crop.y + (crop.h-s)/2))
        crop = { x: Math.round(cx), y: Math.round(cy), w: s, h: s }
        draw()
      })
      overlay.querySelector('#pe-free').addEventListener('click', () => {
        aspect = 'free'
        overlay.querySelector('#pe-free').classList.add('active')
        overlay.querySelector('#pe-1-1').classList.remove('active')
      })
      overlay.querySelector('#pe-full').addEventListener('click', () => {
        crop = { x: 0, y: 0, w: D, h: D }
        draw()
      }, { signal })

      // ESC to cancel
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          resolve(null)
          cleanup()
        }
      }, { signal })

      // ── 정리 ──
      function cleanup() {
        ac.abort()
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      }

      overlay.querySelector('.editor-cancel-btn').addEventListener('click', () => {
        cleanup(); resolve(null)
      }, { signal })

      overlay.querySelector('.editor-confirm-btn').addEventListener('click', () => {
        const { x: cx, y: cy, w: cw, h: ch } = crop
        const OUT = 1200
        const sc  = OUT / Math.max(cw, ch)
        const tW  = Math.round(D * sc)
        const tH  = Math.round(D * sc)

        // 전체 장면 렌더링
        const tmp  = document.createElement('canvas')
        tmp.width  = tW; tmp.height = tH
        const tctx = tmp.getContext('2d')
        tctx.save()
        tctx.translate(tW/2 + ox*sc, tH/2 + oy*sc)
        tctx.rotate(rot * Math.PI / 180)
        const bf = baseFit()
        tctx.scale(scale * bf * sc * (fx ? -1 : 1), scale * bf * sc * (fy ? -1 : 1))
        tctx.drawImage(img, -img.width/2, -img.height/2)
        tctx.restore()

        // 크롭 영역만 출력
        const out  = document.createElement('canvas')
        out.width  = Math.round(cw * sc)
        out.height = Math.round(ch * sc)
        out.getContext('2d').drawImage(tmp, Math.round(cx*sc), Math.round(cy*sc), out.width, out.height, 0, 0, out.width, out.height)

        cleanup()
        resolve(out.toDataURL('image/jpeg', 0.92))
      })
    }
  })
}
