(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={title:``,author:``,date:new Date,cover:null,userImage:null,quote:``,quoteEnabled:!0,rating:0,ratingEnabled:!0,ratio:`9:16`,theme:`light`,font:`modern`,customFont:``,bgPreset:`beige`,bgColor:`#F0EBE3`,bgImage:null,accentColor:`#8FAF8E`,colors:{bg:`#F0EBE3`,glass:`rgba(245,241,235,0.60)`,text:`#2C2825`,textSub:`#8C8680`,accent:`#8FAF8E`,sub:`#CCDBC5`}},t=new Set;function n(n){Object.assign(e,n),t.forEach(t=>t(e))}function r(e){return t.add(e),()=>t.delete(e)}var i={"9:16":[360,640],"3:4":[420,560],"1:1":[480,480],"4:3":[560,420],"16:9":[640,360]},a=new Set([`9:16`,`3:4`]),o={x:0,y:0};function s(){o={x:0,y:0}}function c(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function l(e){return a.has(e)}function u(e){let t=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],n=e.getDate(),r=[-2,-1,0,1,2].map(t=>{let r=new Date(e);return r.setDate(n+t),{num:r.getDate(),today:t===0}});return{day:t[e.getDay()],pills:r}}function d(e){return e.toLocaleTimeString(`ko-KR`,{hour:`2-digit`,minute:`2-digit`,hour12:!1})}function f(e){return`${e.getFullYear()}.${String(e.getMonth()+1).padStart(2,`0`)}.${String(e.getDate()).padStart(2,`0`)}`}function p(){return[2,1,1,2,1,1,3,1,2,1,1,2,1,3,1,1,2,1,1,1,2,1,2,1,1,3,1,2,1,1].map(e=>`<div class="barcode-bar" style="width:${e}px;"></div>`).join(``)}function m(e){let{day:t,pills:n}=u(e);return`
    <div class="date-row">
      <span class="day-label">${t}</span>
      <div class="date-pills">${n.map(e=>`<span class="d${e.today?` today`:``}">${e.num}</span>`).join(``)}</div>
    </div>`}function h(e){return Array.from({length:5},(t,n)=>`<span class="star${n<e?` on`:``}" data-idx="${n}">★</span>`).join(``)}function g(){let{title:t,author:n,quote:r,quoteEnabled:i,rating:a,ratingEnabled:o}=e,s=e.date instanceof Date?e.date:new Date(e.date),l=f(s),u=d(s);return`
    <div class="folder-content-inner">
      <div class="info-wrap">
        ${m(s)}
        <div class="book-title">${c(t)||`제목을 입력하세요`}</div>
        <div class="book-author">${c(n)||`저자`}</div>
        ${o?`<div class="star-row">${h(a)}</div>`:``}
        ${i&&r?`<div class="quote-block">"${c(r)}"</div>`:``}
        <div class="folder-bottom">
          <span class="brand-label">nagi</span>
          <div class="bottom-right">
            <span class="time-label">${u} · ${l}</span>
            <div class="barcode">${p()}</div>
          </div>
        </div>
      </div>
    </div>`}function _(t,n){let r=e.cover||e.userImage;return r?t&&n?`<img src="${r}" style="width:${t}px;height:${n}px;" alt="">`:`<img src="${r}" alt="">`:`<div style="width:100%;height:100%;background:var(--color-sub);opacity:0.35;border-radius:4px;"></div>`}function ee(t,n,r){let i=Math.round(n*.3),a=Math.round(i*1.42),s=Math.round((n-i)/2),l=Math.round(r*.52),u=l-Math.round(a*.55),d=u+o.y,f=s,p=Math.max(0,Math.min(a,l-d));t.dataset.layout=`portrait`,t.dataset.folderBodyTop=l,t.dataset.coverBaseX=s,t.dataset.coverBaseY=u,t.dataset.coverW=i,t.dataset.coverH=a,t.innerHTML=`
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${d}px; left:${f}px;
      width:${i}px; height:${a}px;">
      ${_()}
    </div>

    <div class="folder-layer" style="
      top:${l-22}px; left:0; right:0;
      height:${r-(l-22)}px;">
      <div class="folder-tab" style="width:${Math.round(n*.36)}px;">
        <span class="folder-tab-label">${c(e.title)||`bookcard`}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:${Math.round(a*.48+18)}px 22px 18px;">
          ${g()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${d}px; left:${f}px;
      width:${i}px; height:${p}px; overflow:hidden;">
      ${_(i,a)}
    </div>`}function te(t,n,r){let i=Math.round(r*.62),a=Math.round(i/1.42),s=Math.round((r-i)/2),l=Math.round(n*.38),u=l-Math.round(a*.45),d=u+o.x,f=s,p=Math.max(0,Math.min(a,l-d));t.dataset.layout=`landscape`,t.dataset.folderBodyLeft=l,t.dataset.coverBaseX=u,t.dataset.coverBaseY=s,t.dataset.coverW=a,t.dataset.coverH=i;let m=n-l;t.innerHTML=`
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${f}px; left:${d}px;
      width:${a}px; height:${i}px;">
      ${_()}
    </div>

    <div class="folder-layer" style="
      top:0; left:${l}px;
      width:${m}px; height:${r}px;">
      <div class="folder-tab" style="width:${Math.round(m*.5)}px; max-width:140px;">
        <span class="folder-tab-label">${c(e.title)||`bookcard`}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:28px 18px 18px 20px;">
          ${g()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${f}px; left:${d}px;
      width:${p}px; height:${i}px; overflow:hidden;">
      ${_(a,i)}
    </div>`}function ne(e){let t=e.querySelector(`.cover-back`),n=e.querySelector(`.cover-front`);if(!t)return;let r=e.dataset.layout,i=+e.dataset.folderBodyTop,a=+e.dataset.folderBodyLeft,s=+e.dataset.coverBaseX,c=+e.dataset.coverBaseY,l=+e.dataset.coverW,u=+e.dataset.coverH;[t,n].forEach(e=>{e.style.cursor=`grab`});let d=null;function f(){return e.getBoundingClientRect().width/e.offsetWidth}function p(e){let t=e.touches?.[0]??e;return{x:t.clientX,y:t.clientY}}function m(e){e.preventDefault();let r=p(e);d={px:r.x,py:r.y,ox:o.x,oy:o.y},[t,n].forEach(e=>{e.style.cursor=`grabbing`}),document.addEventListener(`mousemove`,h),document.addEventListener(`mouseup`,g),document.addEventListener(`touchmove`,h,{passive:!1}),document.addEventListener(`touchend`,g)}function h(e){if(!d)return;e.preventDefault();let m=p(e),h=f();if(r===`portrait`){let e=(m.y-d.py)/h;o={x:d.ox,y:d.oy+e};let r=c+o.y,a=Math.max(0,Math.min(u,i-r));t.style.top=r+`px`,n.style.top=r+`px`,n.style.height=a+`px`}else{let e=(m.x-d.px)/h;o={x:d.ox+e,y:d.oy};let r=s+o.x,i=Math.max(0,Math.min(l,a-r));t.style.left=r+`px`,n.style.left=r+`px`,n.style.width=i+`px`}}function g(){d=null,[t,n].forEach(e=>{e.style.cursor=`grab`}),document.removeEventListener(`mousemove`,h),document.removeEventListener(`mouseup`,g),document.removeEventListener(`touchmove`,h),document.removeEventListener(`touchend`,g)}t.addEventListener(`mousedown`,m),n.addEventListener(`mousedown`,m),t.addEventListener(`touchstart`,m,{passive:!1}),n.addEventListener(`touchstart`,m,{passive:!1})}function re(t){let[n,r]=i[e.ratio],a=t.querySelector(`.card-scene`)||document.createElement(`div`);return a.className=`card-scene`,a.setAttribute(`data-theme`,e.theme),a.setAttribute(`data-font`,e.font),a.style.width=n+`px`,a.style.height=r+`px`,e.font===`custom`&&e.customFont?a.style.setProperty(`--font-ko`,`'${e.customFont}', sans-serif`):a.style.removeProperty(`--font-ko`),e.bgPreset===`image`&&e.bgImage?(a.classList.add(`bg-image`),a.style.backgroundImage=`url(${e.bgImage})`,a.style.backgroundColor=``):(a.classList.remove(`bg-image`),a.style.backgroundImage=``,a.style.backgroundColor=e.bgColor),l(e.ratio)?ee(a,n,r):te(a,n,r),t.contains(a)||t.appendChild(a),a}function ie(e,t,n){return new Promise(r=>{let i=new Image;i.onload=()=>a(),i.onerror=()=>r(null),i.src=e;function a(){let e,a;t/n>360/380?(e=360,a=Math.round(360*n/t)):(a=380,e=Math.round(380*t/n));let o=1,s=0,c=0,l=0,u=document.createElement(`div`);u.className=`photo-editor-overlay`,u.innerHTML=`
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
        </div>`,document.body.appendChild(u);let d=u.querySelector(`.photo-editor-canvas`);d.width=e,d.height=a,d.style.width=e+`px`,d.style.height=a+`px`;let f=d.getContext(`2d`);function p(e,t){let n=s===90||s===270,r=n?i.height:i.width,a=n?i.width:i.height;return Math.max(e/r,t/a)}function m(){f.clearRect(0,0,e,a),f.save(),f.translate(e/2+c,a/2+l),f.rotate(s*Math.PI/180);let t=p(e,a);f.scale(o*t,o*t),f.drawImage(i,-i.width/2,-i.height/2),f.restore()}m();let h=null;d.addEventListener(`mousedown`,e=>{h={x:e.clientX-c,y:e.clientY-l},d.style.cursor=`grabbing`}),document.addEventListener(`mousemove`,e=>{h&&(c=e.clientX-h.x,l=e.clientY-h.y,m())}),document.addEventListener(`mouseup`,()=>{h=null,d.style.cursor=`grab`});let g=null;d.addEventListener(`touchstart`,e=>{let t=e.touches[0];g={x:t.clientX-c,y:t.clientY-l},e.preventDefault()},{passive:!1}),d.addEventListener(`touchmove`,e=>{if(!g)return;let t=e.touches[0];c=t.clientX-g.x,l=t.clientY-g.y,m(),e.preventDefault()},{passive:!1}),d.addEventListener(`touchend`,()=>{g=null}),d.addEventListener(`wheel`,e=>{e.preventDefault(),o=Math.min(5,Math.max(1,o-e.deltaY*.002)),u.querySelector(`.zoom-slider`).value=o,m()},{passive:!1}),u.querySelector(`.zoom-slider`).addEventListener(`input`,e=>{o=parseFloat(e.target.value),m()}),u.querySelectorAll(`.rotate-btn`).forEach(e=>{e.addEventListener(`click`,()=>{s=(s+e.dataset.dir*90+360)%360,c=0,l=0,m()})});function _(){document.body.removeChild(u)}u.querySelector(`.editor-confirm-btn`).addEventListener(`click`,()=>{let a=1200,u=Math.round(a*n/t),d=a/e,f=document.createElement(`canvas`);f.width=a,f.height=u;let m=f.getContext(`2d`);m.save(),m.translate(a/2+c*d,u/2+l*d),m.rotate(s*Math.PI/180);let h=p(a,u);m.scale(o*h,o*h),m.drawImage(i,-i.width/2,-i.height/2),m.restore(),r(f.toDataURL(`image/jpeg`,.92)),_()}),u.querySelector(`.editor-cancel-btn`).addEventListener(`click`,()=>{r(null),_()}),d.style.cursor=`grab`}})}var ae=`https://bookshelves-server.onrender.com`;async function oe(e,t){if(!e.trim())return[];try{let n=`${ae}/api/search?q=${encodeURIComponent(e)}&k=${encodeURIComponent(t||``)}`,r=await fetch(n);return r.ok?await r.json():[]}catch{return[]}}function se(e){e=e.toLowerCase();let t=parseInt(e.slice(1,3),16)/255,n=parseInt(e.slice(3,5),16)/255,r=parseInt(e.slice(5,7),16)/255,i=Math.max(t,n,r),a=Math.min(t,n,r),o,s,c=(i+a)/2;if(i===a)o=s=0;else{let e=i-a;switch(s=c>.5?e/(2-i-a):e/(i+a),i){case t:o=((n-r)/e+(n<r?6:0))/6;break;case n:o=((r-t)/e+2)/6;break;case r:o=((t-n)/e+4)/6;break}}return[Math.round(o*360),Math.round(s*100),Math.round(c*100)]}function v(e,t,n){t/=100,n/=100;let r=t=>(t+e/30)%12,i=t*Math.min(n,1-n),a=e=>n-i*Math.max(-1,Math.min(r(e)-3,Math.min(9-r(e),1))),o=e=>Math.round(e*255).toString(16).padStart(2,`0`);return`#${o(a(0))}${o(a(8))}${o(a(4))}`}function ce(e,t){let[n,r]=se(e);return t===`light`?{bg:v(n,Math.max(r-10,5),93),glass:`rgba(245,241,235,0.82)`,text:v(n,20,14),textSub:v(n,10,52),accent:e,sub:v(n,Math.min(r+5,60),80)}:{bg:v(n,Math.min(r,20),12),glass:`rgba(18,22,38,0.86)`,text:v(n,10,90),textSub:v(n,8,55),accent:e,sub:v(n,Math.max(r-10,5),30)}}function le(e){let t=document.documentElement;t.style.setProperty(`--color-bg`,e.bg),t.style.setProperty(`--color-glass`,e.glass),t.style.setProperty(`--color-text`,e.text),t.style.setProperty(`--color-text-sub`,e.textSub),t.style.setProperty(`--color-accent`,e.accent),t.style.setProperty(`--color-sub`,e.sub)}async function ue(){if(!window.EyeDropper)return null;try{return(await new EyeDropper().open()).sRGBHex}catch{return null}}function de(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i))return e;let n=document.implementation.createHTMLDocument(),r=n.createElement(`base`),i=n.createElement(`a`);return n.head.appendChild(r),n.body.appendChild(i),t&&(r.href=t),i.href=e,i.href}var fe=(()=>{let e=0,t=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(e+=1,`u${t()}${e}`)})();function y(e){let t=[];for(let n=0,r=e.length;n<r;n++)t.push(e[n]);return t}var b=null;function pe(e={}){return b||(e.includeStyleProperties?(b=e.includeStyleProperties,b):(b=y(window.getComputedStyle(document.documentElement)),b))}function x(e,t){let n=(e.ownerDocument.defaultView||window).getComputedStyle(e).getPropertyValue(t);return n?parseFloat(n.replace(`px`,``)):0}function me(e){let t=x(e,`border-left-width`),n=x(e,`border-right-width`);return e.clientWidth+t+n}function he(e){let t=x(e,`border-top-width`),n=x(e,`border-bottom-width`);return e.clientHeight+t+n}function S(e,t={}){return{width:t.width||me(e),height:t.height||he(e)}}function ge(){let e,t;try{t=process}catch{}let n=t&&t.env?t.env.devicePixelRatio:null;return n&&(e=parseInt(n,10),Number.isNaN(e)&&(e=1)),e||window.devicePixelRatio||1}var C=16384;function _e(e){(e.width>C||e.height>C)&&(e.width>C&&e.height>C?e.width>e.height?(e.height*=C/e.width,e.width=C):(e.width*=C/e.height,e.height=C):e.width>C?(e.height*=C/e.width,e.width=C):(e.width*=C/e.height,e.height=C))}function w(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>t(r))})},r.onerror=n,r.crossOrigin=`anonymous`,r.decoding=`async`,r.src=e})}async function ve(e){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ye(e,t,n){let r=`http://www.w3.org/2000/svg`,i=document.createElementNS(r,`svg`),a=document.createElementNS(r,`foreignObject`);return i.setAttribute(`width`,`${t}`),i.setAttribute(`height`,`${n}`),i.setAttribute(`viewBox`,`0 0 ${t} ${n}`),a.setAttribute(`width`,`100%`),a.setAttribute(`height`,`100%`),a.setAttribute(`x`,`0`),a.setAttribute(`y`,`0`),a.setAttribute(`externalResourcesRequired`,`true`),i.appendChild(a),a.appendChild(e),ve(i)}var T=(e,t)=>{if(e instanceof t)return!0;let n=Object.getPrototypeOf(e);return n===null?!1:n.constructor.name===t.name||T(n,t)};function be(e){let t=e.getPropertyValue(`content`);return`${e.cssText} content: '${t.replace(/'|"/g,``)}';`}function xe(e,t){return pe(t).map(t=>`${t}: ${e.getPropertyValue(t)}${e.getPropertyPriority(t)?` !important`:``};`).join(` `)}function Se(e,t,n,r){let i=`.${e}:${t}`,a=n.cssText?be(n):xe(n,r);return document.createTextNode(`${i}{${a}}`)}function E(e,t,n,r){let i=window.getComputedStyle(e,n),a=i.getPropertyValue(`content`);if(a===``||a===`none`)return;let o=fe();try{t.className=`${t.className} ${o}`}catch{return}let s=document.createElement(`style`);s.appendChild(Se(o,n,i,r)),t.appendChild(s)}function Ce(e,t,n){E(e,t,`:before`,n),E(e,t,`:after`,n)}var D=`application/font-woff`,O=`image/jpeg`,we={woff:D,woff2:D,ttf:`application/font-truetype`,eot:`application/vnd.ms-fontobject`,png:`image/png`,jpg:O,jpeg:O,gif:`image/gif`,tiff:`image/tiff`,svg:`image/svg+xml`,webp:`image/webp`};function Te(e){let t=/\.([^./]*?)$/g.exec(e);return t?t[1]:``}function k(e){return we[Te(e).toLowerCase()]||``}function Ee(e){return e.split(/,/)[1]}function A(e){return e.search(/^(data:)/)!==-1}function j(e,t){return`data:${t};base64,${e}`}async function M(e,t,n){let r=await fetch(e,t);if(r.status===404)throw Error(`Resource "${r.url}" not found`);let i=await r.blob();return new Promise((e,t)=>{let a=new FileReader;a.onerror=t,a.onloadend=()=>{try{e(n({res:r,result:a.result}))}catch(e){t(e)}},a.readAsDataURL(i)})}var N={};function De(e,t,n){let r=e.replace(/\?.*/,``);return n&&(r=e),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,``)),t?`[${t}]${r}`:r}async function P(e,t,n){let r=De(e,t,n.includeQueryParams);if(N[r]!=null)return N[r];n.cacheBust&&(e+=(/\?/.test(e)?`&`:`?`)+new Date().getTime());let i;try{i=j(await M(e,n.fetchRequestInit,({res:e,result:n})=>(t||=e.headers.get(`Content-Type`)||``,Ee(n))),t)}catch(t){i=n.imagePlaceholder||``;let r=`Failed to fetch resource: ${e}`;t&&(r=typeof t==`string`?t:t.message),r&&console.warn(r)}return N[r]=i,i}async function Oe(e){let t=e.toDataURL();return t===`data:,`?e.cloneNode(!1):w(t)}async function ke(e,t){if(e.currentSrc){let t=document.createElement(`canvas`),n=t.getContext(`2d`);return t.width=e.clientWidth,t.height=e.clientHeight,n?.drawImage(e,0,0,t.width,t.height),w(t.toDataURL())}let n=e.poster;return w(await P(n,k(n),t))}async function Ae(e,t){try{if(e?.contentDocument?.body)return await I(e.contentDocument.body,t,!0)}catch{}return e.cloneNode(!1)}async function je(e,t){return T(e,HTMLCanvasElement)?Oe(e):T(e,HTMLVideoElement)?ke(e,t):T(e,HTMLIFrameElement)?Ae(e,t):e.cloneNode(F(e))}var Me=e=>e.tagName!=null&&e.tagName.toUpperCase()===`SLOT`,F=e=>e.tagName!=null&&e.tagName.toUpperCase()===`SVG`;async function Ne(e,t,n){if(F(t))return t;let r=[];return r=Me(e)&&e.assignedNodes?y(e.assignedNodes()):T(e,HTMLIFrameElement)&&e.contentDocument?.body?y(e.contentDocument.body.childNodes):y((e.shadowRoot??e).childNodes),r.length===0||T(e,HTMLVideoElement)||await r.reduce((e,r)=>e.then(()=>I(r,n)).then(e=>{e&&t.appendChild(e)}),Promise.resolve()),t}function Pe(e,t,n){let r=t.style;if(!r)return;let i=window.getComputedStyle(e);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):pe(n).forEach(n=>{let a=i.getPropertyValue(n);n===`font-size`&&a.endsWith(`px`)&&(a=`${Math.floor(parseFloat(a.substring(0,a.length-2)))-.1}px`),T(e,HTMLIFrameElement)&&n===`display`&&a===`inline`&&(a=`block`),n===`d`&&t.getAttribute(`d`)&&(a=`path(${t.getAttribute(`d`)})`),r.setProperty(n,a,i.getPropertyPriority(n))})}function Fe(e,t){T(e,HTMLTextAreaElement)&&(t.innerHTML=e.value),T(e,HTMLInputElement)&&t.setAttribute(`value`,e.value)}function Ie(e,t){if(T(e,HTMLSelectElement)){let n=t,r=Array.from(n.children).find(t=>e.value===t.getAttribute(`value`));r&&r.setAttribute(`selected`,``)}}function Le(e,t,n){return T(t,Element)&&(Pe(e,t,n),Ce(e,t,n),Fe(e,t),Ie(e,t)),t}async function Re(e,t){let n=e.querySelectorAll?e.querySelectorAll(`use`):[];if(n.length===0)return e;let r={};for(let i=0;i<n.length;i++){let a=n[i].getAttribute(`xlink:href`);if(a){let n=e.querySelector(a),i=document.querySelector(a);!n&&i&&!r[a]&&(r[a]=await I(i,t,!0))}}let i=Object.values(r);if(i.length){let t=`http://www.w3.org/1999/xhtml`,n=document.createElementNS(t,`svg`);n.setAttribute(`xmlns`,t),n.style.position=`absolute`,n.style.width=`0`,n.style.height=`0`,n.style.overflow=`hidden`,n.style.display=`none`;let r=document.createElementNS(t,`defs`);n.appendChild(r);for(let e=0;e<i.length;e++)r.appendChild(i[e]);e.appendChild(n)}return e}async function I(e,t,n){return!n&&t.filter&&!t.filter(e)?null:Promise.resolve(e).then(e=>je(e,t)).then(n=>Ne(e,n,t)).then(n=>Le(e,n,t)).then(e=>Re(e,t))}var L=/url\((['"]?)([^'"]+?)\1\)/g,ze=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Be=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Ve(e){let t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,`\\$1`);return RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,`g`)}function He(e){let t=[];return e.replace(L,(e,n,r)=>(t.push(r),e)),t.filter(e=>!A(e))}async function Ue(e,t,n,r,i){try{let a=n?de(t,n):t,o=k(t),s;return s=i?j(await i(a),o):await P(a,o,r),e.replace(Ve(t),`$1${s}$3`)}catch{}return e}function We(e,{preferredFontFormat:t}){return t?e.replace(Be,e=>{for(;;){let[n,,r]=ze.exec(e)||[];if(!r)return``;if(r===t)return`src: ${n};`}}):e}function R(e){return e.search(L)!==-1}async function z(e,t,n){if(!R(e))return e;let r=We(e,n);return He(r).reduce((e,r)=>e.then(e=>Ue(e,r,t,n)),Promise.resolve(r))}async function B(e,t,n){let r=t.style?.getPropertyValue(e);if(r){let i=await z(r,null,n);return t.style.setProperty(e,i,t.style.getPropertyPriority(e)),!0}return!1}async function Ge(e,t){await B(`background`,e,t)||await B(`background-image`,e,t),await B(`mask`,e,t)||await B(`-webkit-mask`,e,t)||await B(`mask-image`,e,t)||await B(`-webkit-mask-image`,e,t)}async function Ke(e,t){let n=T(e,HTMLImageElement);if(!(n&&!A(e.src))&&!(T(e,SVGImageElement)&&!A(e.href.baseVal)))return;let r=n?e.src:e.href.baseVal,i=await P(r,k(r),t);await new Promise((r,a)=>{e.onload=r,e.onerror=t.onImageErrorHandler?(...e)=>{try{r(t.onImageErrorHandler(...e))}catch(e){a(e)}}:a;let o=e;o.decode&&=r,o.loading===`lazy`&&(o.loading=`eager`),n?(e.srcset=``,e.src=i):e.href.baseVal=i})}async function qe(e,t){let n=y(e.childNodes).map(e=>V(e,t));await Promise.all(n).then(()=>e)}async function V(e,t){T(e,Element)&&(await Ge(e,t),await Ke(e,t),await qe(e,t))}function Je(e,t){let{style:n}=e;t.backgroundColor&&(n.backgroundColor=t.backgroundColor),t.width&&(n.width=`${t.width}px`),t.height&&(n.height=`${t.height}px`);let r=t.style;return r!=null&&Object.keys(r).forEach(e=>{n[e]=r[e]}),e}var H={};async function U(e){let t=H[e];return t??(t={url:e,cssText:await(await fetch(e)).text()},H[e]=t,t)}async function W(e,t){let n=e.cssText,r=/url\(["']?([^"')]+)["']?\)/g,i=(n.match(/url\([^)]+\)/g)||[]).map(async i=>{let a=i.replace(r,`$1`);return a.startsWith(`https://`)||(a=new URL(a,e.url).href),M(a,t.fetchRequestInit,({result:e})=>(n=n.replace(i,`url(${e})`),[i,e]))});return Promise.all(i).then(()=>n)}function G(e){if(e==null)return[];let t=[],n=e.replace(/(\/\*[\s\S]*?\*\/)/gi,``),r=RegExp(`((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})`,`gi`);for(;;){let e=r.exec(n);if(e===null)break;t.push(e[0])}n=n.replace(r,``);let i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,a=RegExp(`((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})`,`gi`);for(;;){let e=i.exec(n);if(e===null){if(e=a.exec(n),e===null)break;i.lastIndex=a.lastIndex}else a.lastIndex=i.lastIndex;t.push(e[0])}return t}async function Ye(e,t){let n=[],r=[];return e.forEach(n=>{if(`cssRules`in n)try{y(n.cssRules||[]).forEach((e,i)=>{if(e.type===CSSRule.IMPORT_RULE){let a=i+1,o=e.href,s=U(o).then(e=>W(e,t)).then(e=>G(e).forEach(e=>{try{n.insertRule(e,e.startsWith(`@import`)?a+=1:n.cssRules.length)}catch(t){console.error(`Error inserting rule from remote css`,{rule:e,error:t})}})).catch(e=>{console.error(`Error loading remote css`,e.toString())});r.push(s)}})}catch(i){let a=e.find(e=>e.href==null)||document.styleSheets[0];n.href!=null&&r.push(U(n.href).then(e=>W(e,t)).then(e=>G(e).forEach(e=>{a.insertRule(e,a.cssRules.length)})).catch(e=>{console.error(`Error loading remote stylesheet`,e)})),console.error(`Error inlining remote css file`,i)}}),Promise.all(r).then(()=>(e.forEach(e=>{if(`cssRules`in e)try{y(e.cssRules||[]).forEach(e=>{n.push(e)})}catch(t){console.error(`Error while reading CSS rules from ${e.href}`,t)}}),n))}function Xe(e){return e.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>R(e.style.getPropertyValue(`src`)))}async function Ze(e,t){if(e.ownerDocument==null)throw Error(`Provided element is not within a Document`);return Xe(await Ye(y(e.ownerDocument.styleSheets),t))}function K(e){return e.trim().replace(/["']/g,``)}function Qe(e){let t=new Set;function n(e){(e.style.fontFamily||getComputedStyle(e).fontFamily).split(`,`).forEach(e=>{t.add(K(e))}),Array.from(e.children).forEach(e=>{e instanceof HTMLElement&&n(e)})}return n(e),t}async function $e(e,t){let n=await Ze(e,t),r=Qe(e);return(await Promise.all(n.filter(e=>r.has(K(e.style.fontFamily))).map(e=>{let n=e.parentStyleSheet?e.parentStyleSheet.href:null;return z(e.cssText,n,t)}))).join(`
`)}async function et(e,t){let n=t.fontEmbedCSS==null?t.skipFonts?null:await $e(e,t):t.fontEmbedCSS;if(n){let t=document.createElement(`style`),r=document.createTextNode(n);t.appendChild(r),e.firstChild?e.insertBefore(t,e.firstChild):e.appendChild(t)}}async function tt(e,t={}){let{width:n,height:r}=S(e,t),i=await I(e,t,!0);return await et(i,t),await V(i,t),Je(i,t),await ye(i,n,r)}async function nt(e,t={}){let{width:n,height:r}=S(e,t),i=await w(await tt(e,t)),a=document.createElement(`canvas`),o=a.getContext(`2d`),s=t.pixelRatio||ge(),c=t.canvasWidth||n,l=t.canvasHeight||r;return a.width=c*s,a.height=l*s,t.skipAutoScale||_e(a),a.style.width=`${c}`,a.style.height=`${l}`,t.backgroundColor&&(o.fillStyle=t.backgroundColor,o.fillRect(0,0,a.width,a.height)),o.drawImage(i,0,0,a.width,a.height),a}async function q(e,t={}){return(await nt(e,t)).toDataURL()}var rt={pixelRatio:3,skipFonts:!1,cacheBust:!0};async function it(e){try{let t=await q(e,rt),n=document.createElement(`a`);n.download=`bookcard-${Date.now()}.png`,n.href=t,document.body.appendChild(n),n.click(),document.body.removeChild(n)}catch(e){throw Error(`PNG 저장에 실패했습니다: ${e.message}`)}}async function at(e){try{let t=await q(e,rt),n=await(await fetch(t)).blob();await navigator.clipboard.write([new ClipboardItem({"image/png":n})])}catch(e){throw Error(`클립보드 복사에 실패했습니다: ${e.message}`)}}function J(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}var Y=`nagi_ttb_key`;function X(){return localStorage.getItem(Y)||``}function ot(e){localStorage.setItem(Y,e.trim())}document.body.insertAdjacentHTML(`beforeend`,`
  <div id="onboarding-overlay">
    <div id="onboarding-modal">
      <div class="modal-title">알라딘 TTB 키 입력</div>
      <div class="modal-desc">
        책 검색 기능을 사용하려면 알라딘 TTB API 키가 필요해요.<br>
        키는 <a href="https://www.aladin.co.kr/ttb/wblog_list.aspx" target="_blank" rel="noopener">알라딘 파트너스</a>에서 발급받을 수 있어요.
      </div>
      <input id="ttb-key-input" type="text" placeholder="TTB 키를 입력하세요">
      <button id="ttb-key-save">저장하고 시작하기</button>
    </div>
  </div>`);function st(){document.getElementById(`onboarding-overlay`).classList.remove(`hidden`)}function ct(){document.getElementById(`onboarding-overlay`).classList.add(`hidden`)}document.getElementById(`ttb-key-save`).addEventListener(`click`,()=>{let e=document.getElementById(`ttb-key-input`).value.trim();e&&(ot(e),ct())}),document.getElementById(`ttb-key-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&document.getElementById(`ttb-key-save`).click()}),X()||st(),document.getElementById(`panel`).innerHTML=`
  <div class="panel-section">
    <div class="panel-section-title" style="display:flex;align-items:center;justify-content:space-between;">
      책 검색
      <button class="key-setting-btn" id="change-key-btn">TTB 키 변경</button>
    </div>
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
      ${[1,2,3,4,5].map(e=>`<button class="star-btn" data-val="${e}">★</button>`).join(``)}
    </div>
  </div>

  <div class="panel-section">
    <div class="panel-section-title">화면 비율</div>
    <div class="ratio-buttons">
      ${[`9:16`,`3:4`,`1:1`,`4:3`,`16:9`].map(e=>`<button class="ratio-btn${e===`9:16`?` active`:``}" data-ratio="${e}">${e}</button>`).join(``)}
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
      <option value="custom">직접 입력 (로컬 폰트)</option>
    </select>
    <input id="custom-font-input" class="text-input" type="text" placeholder="폰트 이름 (예: 나눔명조)" style="display:none">
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
`,document.getElementById(`preview`).innerHTML=`<div id="preview-inner"></div>`;var Z=document.getElementById(`preview-inner`),Q=new Date;document.getElementById(`date-input`).value=`${Q.getFullYear()}-${String(Q.getMonth()+1).padStart(2,`0`)}-${String(Q.getDate()).padStart(2,`0`)}`,n({date:Q});function lt(){le(ce(e.accentColor,e.theme)),ne(re(Z)),dt(),ut()}function ut(){document.querySelectorAll(`#star-input .star-btn`).forEach((t,n)=>{t.classList.toggle(`on`,n<e.rating)})}function dt(){let e=Z.querySelector(`.card-scene`);if(!e)return;let t=e.offsetWidth,n=e.offsetHeight,r=document.getElementById(`preview`).offsetWidth-80,i=document.getElementById(`preview`).offsetHeight-80,a=Math.min(r/t,i/n,1);Z.style.transform=`scale(${a})`}window.addEventListener(`resize`,dt);var ft;document.getElementById(`search-input`).addEventListener(`input`,e=>{clearTimeout(ft),ft=setTimeout(()=>$(e.target.value),400)}),document.getElementById(`search-btn`).addEventListener(`click`,()=>{$(document.getElementById(`search-input`).value)});async function $(e){if(!e.trim())return;let t=document.getElementById(`search-results`);t.innerHTML=`<div style="padding:8px 12px;font-size:12px;color:#8C8680">검색 중...</div>`,t.classList.add(`open`);let r=await oe(e,X());if(!r.length){t.innerHTML=`<div style="padding:8px 12px;font-size:12px;color:#8C8680">결과 없음</div>`;return}t.innerHTML=r.map((e,t)=>`
    <div class="search-result-item" data-idx="${t}">
      <img src="${J(e.cover||``)}" onerror="this.style.display='none'">
      <div>
        <div class="search-result-title">${J(e.title)}</div>
        <div class="search-result-author">${J(e.author)}</div>
      </div>
    </div>`).join(``),t.querySelectorAll(`.search-result-item`).forEach(e=>{e.addEventListener(`click`,()=>{let i=r[+e.dataset.idx];n({title:i.title,author:i.author,cover:i.cover||null}),document.getElementById(`title-input`).value=i.title,document.getElementById(`author-input`).value=i.author,t.classList.remove(`open`),document.getElementById(`search-input`).value=``})})}document.getElementById(`change-key-btn`).addEventListener(`click`,()=>{document.getElementById(`ttb-key-input`).value=X(),st()}),document.addEventListener(`click`,e=>{document.getElementById(`search-wrap`).contains(e.target)||document.getElementById(`search-results`).classList.remove(`open`)}),document.getElementById(`title-input`).addEventListener(`input`,e=>n({title:e.target.value})),document.getElementById(`author-input`).addEventListener(`input`,e=>n({author:e.target.value})),document.getElementById(`date-input`).addEventListener(`change`,e=>{n({date:new Date(e.target.value)})}),document.getElementById(`cover-upload-btn`).addEventListener(`click`,()=>{document.getElementById(`cover-file`).click()}),document.getElementById(`cover-file`).addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let r=new FileReader;r.onload=e=>n({cover:null,userImage:e.target.result}),r.readAsDataURL(t)}),document.getElementById(`quote-toggle`).addEventListener(`click`,function(){n({quoteEnabled:this.classList.toggle(`on`)})}),document.getElementById(`quote-input`).addEventListener(`input`,e=>n({quote:e.target.value})),document.getElementById(`rating-toggle`).addEventListener(`click`,function(){n({ratingEnabled:this.classList.toggle(`on`)})}),document.getElementById(`star-input`).addEventListener(`click`,e=>{let t=e.target.closest(`.star-btn`);t&&n({rating:+t.dataset.val})}),document.querySelectorAll(`.ratio-btn`).forEach(e=>{e.addEventListener(`click`,function(){document.querySelectorAll(`.ratio-btn`).forEach(e=>e.classList.remove(`active`)),this.classList.add(`active`),s(),n({ratio:this.dataset.ratio})})});var pt={white:`#FFFFFF`,beige:`#F0EBE3`,gray:`#9E9A94`,black:`#1A1A1A`};document.querySelectorAll(`.bg-swatch`).forEach(e=>{e.addEventListener(`click`,function(){document.querySelectorAll(`.bg-swatch`).forEach(e=>e.classList.remove(`active`)),this.classList.add(`active`);let e=this.dataset.bgPreset;n({bgPreset:e,bgColor:pt[e],bgImage:null})})}),document.getElementById(`bg-color-input`).addEventListener(`input`,e=>{n({bgPreset:`custom`,bgColor:e.target.value,bgImage:null})}),document.getElementById(`bg-image-btn`).addEventListener(`click`,()=>{document.getElementById(`bg-file`).click()}),document.getElementById(`bg-file`).addEventListener(`change`,t=>{let r=t.target.files[0];if(!r)return;let i=new FileReader;i.onload=async t=>{let[r,i]={"9:16":[9,16],"3:4":[3,4],"1:1":[1,1],"4:3":[4,3],"16:9":[16,9]}[e.ratio],a=await ie(t.target.result,r,i);a&&n({bgPreset:`image`,bgImage:a})},i.readAsDataURL(r)}),document.getElementById(`accent-picker`).addEventListener(`input`,e=>{n({accentColor:e.target.value})}),document.getElementById(`eyedropper-btn`).addEventListener(`click`,async()=>{let e=await ue();e&&(document.getElementById(`accent-picker`).value=e,n({accentColor:e}))}),document.getElementById(`font-select`).addEventListener(`change`,e=>{let t=e.target.value,r=document.getElementById(`custom-font-input`);t===`custom`?(r.style.display=`block`,r.focus()):(r.style.display=`none`,n({font:t,customFont:``}))}),document.getElementById(`custom-font-input`).addEventListener(`input`,e=>{n({customFont:e.target.value.trim()})}),document.getElementById(`theme-toggle`).addEventListener(`click`,function(){n({theme:this.classList.toggle(`on`)?`dark`:`light`})}),document.getElementById(`save-btn`).addEventListener(`click`,async()=>{let e=Z.querySelector(`.card-scene`);if(e){document.getElementById(`save-btn`).textContent=`저장 중...`;try{await it(e)}finally{document.getElementById(`save-btn`).textContent=`PNG 저장`}}}),document.getElementById(`clipboard-btn`).addEventListener(`click`,async()=>{let e=Z.querySelector(`.card-scene`);if(e){document.getElementById(`clipboard-btn`).textContent=`복사 중...`;try{await at(e),document.getElementById(`clipboard-btn`).textContent=`✓ 복사됨`,setTimeout(()=>{document.getElementById(`clipboard-btn`).textContent=`클립보드`},2e3)}catch{document.getElementById(`clipboard-btn`).textContent=`클립보드`}}}),r(lt),lt();