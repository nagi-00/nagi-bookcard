// src/modules/photoEditor.js

export function openPhotoEditor(imgSrc, ratioW, ratioH) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => initEditor()
    img.onerror = () => resolve(null)
    img.src = imgSrc

    function initEditor() {
      const MAX_W = 360, MAX_H = 380
      let dispW, dispH
      if (ratioW / ratioH > MAX_W / MAX_H) {
        dispW = MAX_W
        dispH = Math.round(MAX_W * ratioH / ratioW)
      } else {
        dispH = MAX_H
        dispW = Math.round(MAX_H * ratioW / ratioH)
      }

      let scale = 1
      let rotation = 0  // 0 | 90 | 180 | 270
      let offsetX = 0, offsetY = 0

      const overlay = document.createElement('div')
      overlay.className = 'photo-editor-overlay'
      overlay.innerHTML = `
        <div class="photo-editor-modal">
          <div class="photo-editor-title">배경 편집</div>
          <div class="photo-editor-canvas-wrap">
            <canvas class="photo-editor-canvas"></canvas>
          </div>
          <div class="photo-editor-controls">
            <span class="editor-label">확대</span>
            <input type="range" class="zoom-slider" min="1" max="5" step="0.01" value="1">
            <div class="rotate-btns">
              <button class="rotate-btn" data-dir="-1">↺</button>
              <button class="rotate-btn" data-dir="1">↻</button>
            </div>
          </div>
          <div class="photo-editor-actions">
            <button class="editor-cancel-btn">취소</button>
            <button class="editor-confirm-btn">적용</button>
          </div>
        </div>`
      document.body.appendChild(overlay)

      const canvas = overlay.querySelector('.photo-editor-canvas')
      canvas.width = dispW
      canvas.height = dispH
      canvas.style.width = dispW + 'px'
      canvas.style.height = dispH + 'px'
      const ctx = canvas.getContext('2d')

      function baseFit(w, h) {
        const isVert = rotation === 90 || rotation === 270
        const iw = isVert ? img.height : img.width
        const ih = isVert ? img.width : img.height
        return Math.max(w / iw, h / ih)
      }

      function draw() {
        ctx.clearRect(0, 0, dispW, dispH)
        ctx.save()
        ctx.translate(dispW / 2 + offsetX, dispH / 2 + offsetY)
        ctx.rotate(rotation * Math.PI / 180)
        const bf = baseFit(dispW, dispH)
        ctx.scale(scale * bf, scale * bf)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        ctx.restore()
      }

      draw()

      // Mouse drag
      let dragStart = null
      canvas.addEventListener('mousedown', e => {
        dragStart = { x: e.clientX - offsetX, y: e.clientY - offsetY }
        canvas.style.cursor = 'grabbing'
      })
      document.addEventListener('mousemove', e => {
        if (!dragStart) return
        offsetX = e.clientX - dragStart.x
        offsetY = e.clientY - dragStart.y
        draw()
      })
      document.addEventListener('mouseup', () => {
        dragStart = null
        canvas.style.cursor = 'grab'
      })

      // Touch drag
      let touchStart = null
      canvas.addEventListener('touchstart', e => {
        const t = e.touches[0]
        touchStart = { x: t.clientX - offsetX, y: t.clientY - offsetY }
        e.preventDefault()
      }, { passive: false })
      canvas.addEventListener('touchmove', e => {
        if (!touchStart) return
        const t = e.touches[0]
        offsetX = t.clientX - touchStart.x
        offsetY = t.clientY - touchStart.y
        draw()
        e.preventDefault()
      }, { passive: false })
      canvas.addEventListener('touchend', () => { touchStart = null })

      // Wheel zoom
      canvas.addEventListener('wheel', e => {
        e.preventDefault()
        scale = Math.min(5, Math.max(1, scale - e.deltaY * 0.002))
        overlay.querySelector('.zoom-slider').value = scale
        draw()
      }, { passive: false })

      // Slider zoom
      overlay.querySelector('.zoom-slider').addEventListener('input', e => {
        scale = parseFloat(e.target.value)
        draw()
      })

      // Rotate buttons
      overlay.querySelectorAll('.rotate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          rotation = (rotation + +btn.dataset.dir * 90 + 360) % 360
          offsetX = 0; offsetY = 0
          draw()
        })
      })

      function cleanup() {
        document.body.removeChild(overlay)
      }

      overlay.querySelector('.editor-confirm-btn').addEventListener('click', () => {
        const OUT_W = 1200
        const OUT_H = Math.round(OUT_W * ratioH / ratioW)
        const sc = OUT_W / dispW
        const offCanvas = document.createElement('canvas')
        offCanvas.width = OUT_W
        offCanvas.height = OUT_H
        const offCtx = offCanvas.getContext('2d')
        offCtx.save()
        offCtx.translate(OUT_W / 2 + offsetX * sc, OUT_H / 2 + offsetY * sc)
        offCtx.rotate(rotation * Math.PI / 180)
        const bf = baseFit(OUT_W, OUT_H)
        offCtx.scale(scale * bf, scale * bf)
        offCtx.drawImage(img, -img.width / 2, -img.height / 2)
        offCtx.restore()
        resolve(offCanvas.toDataURL('image/jpeg', 0.92))
        cleanup()
      })

      overlay.querySelector('.editor-cancel-btn').addEventListener('click', () => {
        resolve(null)
        cleanup()
      })

      canvas.style.cursor = 'grab'
    }
  })
}
