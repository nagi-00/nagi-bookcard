// src/modules/photoEditor.js
// 이미지 편집기: 이동 · 확대 · 회전 · 반전 (캔버스 경계 = 저장 범위)
// 캔버스 비율은 책 표지와 동일(1:1.42)이라 프리뷰와 삽입 결과가 일치함.
export function openPhotoEditor(imgSrc) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => initEditor()
    img.onerror = () => resolve(null)
    img.src = imgSrc

    function initEditor() {
      const cW = 260, cH = 370   // 1 : 1.42 (책 표지 비율)
      const BG = '#F8F6F2'        // 투명 영역을 채울 색 (모달 배경과 동일)

      let scale = 1, ox = 0, oy = 0, rot = 0
      let fx = false, fy = false
      let imgDrag = null

      const overlay = document.createElement('div')
      overlay.className = 'photo-editor-overlay'
      overlay.innerHTML = `
        <div class="photo-editor-modal">
          <div class="photo-editor-title">이미지 편집</div>
          <div class="photo-editor-canvas-wrap">
            <canvas class="photo-editor-canvas" width="${cW}" height="${cH}"
              style="width:${cW}px;height:${cH}px;cursor:grab;display:block;"></canvas>
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
          <div class="photo-editor-actions">
            <button class="editor-cancel-btn">취소</button>
            <button class="editor-confirm-btn">적용</button>
          </div>
        </div>`
      document.body.appendChild(overlay)

      const canvas = overlay.querySelector('.photo-editor-canvas')
      const ctx    = canvas.getContext('2d')

      function baseFit() {
        const rotated = rot % 180 !== 0
        const iw = rotated ? img.height : img.width
        const ih = rotated ? img.width  : img.height
        return Math.max(cW / iw, cH / ih)
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

      function draw() { paint(ctx, cW, cH, 1) }
      draw()

      const ac = new AbortController()
      const signal = ac.signal

      function onDown(e) {
        if (e.type === 'touchstart') e.preventDefault()
        const t = e.touches?.[0] ?? e
        imgDrag = { sx: t.clientX, sy: t.clientY, ox0: ox, oy0: oy }
        canvas.style.cursor = 'grabbing'
      }
      function onMove(e) {
        if (!imgDrag) return
        if (e.type === 'touchmove') e.preventDefault()
        const t = e.touches?.[0] ?? e
        ox = imgDrag.ox0 + t.clientX - imgDrag.sx
        oy = imgDrag.oy0 + t.clientY - imgDrag.sy
        draw()
      }
      function onUp() {
        imgDrag = null
        canvas.style.cursor = 'grab'
      }

      canvas.addEventListener('mousedown',  onDown, { signal })
      canvas.addEventListener('touchstart', onDown, { passive: false, signal })
      document.addEventListener('mousemove',  onMove, { signal })
      document.addEventListener('mouseup',    onUp,   { signal })
      document.addEventListener('touchmove',  onMove, { passive: false, signal })
      document.addEventListener('touchend',   onUp,   { signal })

      canvas.addEventListener('wheel', e => {
        e.preventDefault()
        scale = Math.min(5, Math.max(0.5, scale - e.deltaY * 0.002))
        overlay.querySelector('.zoom-slider').value = scale
        draw()
      }, { passive: false, signal })

      overlay.querySelector('.zoom-slider').addEventListener('input', e => {
        scale = parseFloat(e.target.value); draw()
      }, { signal })

      overlay.querySelector('#pe-rot-ccw').addEventListener('click', () => { rot = (rot-90+360)%360; draw() }, { signal })
      overlay.querySelector('#pe-rot-cw' ).addEventListener('click', () => { rot = (rot+90)%360;      draw() }, { signal })
      overlay.querySelector('#pe-flip-h' ).addEventListener('click', () => { fx = !fx; draw() }, { signal })
      overlay.querySelector('#pe-flip-v' ).addEventListener('click', () => { fy = !fy; draw() }, { signal })

      function cleanup() {
        ac.abort()
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      }

      function apply() {
        // 긴 변이 1200px이 되도록 스케일
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

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); cancel() }
        else if (e.key === 'Enter') { e.preventDefault(); apply() }
      }, { signal })

      overlay.querySelector('.editor-cancel-btn').addEventListener('click', cancel, { signal })
      overlay.querySelector('.editor-confirm-btn').addEventListener('click', apply,  { signal })
    }
  })
}
