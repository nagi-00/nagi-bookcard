(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={title:``,author:``,date:new Date,cover:null,userImage:null,quote:``,quoteEnabled:!0,rating:0,ratingEnabled:!0,ratio:`9:16`,theme:`light`,font:`modern`,customFont:``,bgPreset:`beige`,bgColor:`#F0EBE3`,bgImage:null,accentColor:`#8FAF8E`,colors:{bg:`#F0EBE3`,glass:`rgba(245,241,235,0.60)`,text:`#2C2825`,textSub:`#8C8680`,accent:`#8FAF8E`,sub:`#CCDBC5`}},t=new Set;function n(n){Object.assign(e,n),t.forEach(t=>t(e))}function r(e){return t.add(e),()=>t.delete(e)}var i={"9:16":[360,640],"3:4":[420,560],"1:1":[480,480],"4:3":[560,420],"16:9":[640,360]},a=new Set([`9:16`,`3:4`]);function o(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function s(e){return a.has(e)}function c(e){let t=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`][e.getDay()],n=e.getDate();return{day:t,pills:[-2,-1,0,1,2].map(t=>{let r=new Date(e);return r.setDate(n+t),{num:r.getDate(),today:t===0}})}}function l(e){return e.toLocaleTimeString(`ko-KR`,{hour:`2-digit`,minute:`2-digit`,hour12:!1})}function ee(e){return`${e.getFullYear()}.${String(e.getMonth()+1).padStart(2,`0`)}.${String(e.getDate()).padStart(2,`0`)}`}function te(){return[100,55,80,100,45,90,65,100,52,80,100,60].map(e=>`<div class="barcode-bar" style="height:${e}%"></div>`).join(``)}function ne(e){let{day:t,pills:n}=c(e);return`
    <div class="date-row">
      <span class="day-label">${t}</span>
      <div class="date-pills">${n.map(e=>`<span class="d${e.today?` today`:``}">${e.num}</span>`).join(``)}</div>
    </div>`}function re(e){return Array.from({length:5},(t,n)=>`<span class="star${n<e?` on`:``}" data-idx="${n}">★</span>`).join(``)}function u(){let{title:t,author:n,quote:r,quoteEnabled:i,rating:a,ratingEnabled:s}=e,c=e.date instanceof Date?e.date:new Date(e.date),u=ee(c),d=l(c);return`
    <i class="folder-arrow">↗</i>
    <div class="folder-content-inner">
      <div class="info-wrap">
        ${ne(c)}
        <div class="book-title">${o(t)||`제목을 입력하세요`}</div>
        <div class="book-author">${o(n)||`저자`}</div>
        ${s?`<div class="star-row">${re(a)}</div>`:``}
        ${i&&r?`<div class="quote-block">"${o(r)}"</div>`:``}
        <div class="folder-bottom">
          <span class="brand-label">nagi</span>
          <div class="bottom-right">
            <span class="time-label">${d} · ${u}</span>
            <div class="barcode">${te()}</div>
          </div>
        </div>
      </div>
    </div>`}function d(t,n,r){r-Math.round(r*.35);let i=Math.round(n*.3),a=Math.round(i*1.42),s=Math.round((n-i)/2),c=Math.round(r*.12),l=c+Math.round(a/2);t.innerHTML=`
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${c}px; left:${s}px;
      width:${i}px; height:${a}px;">
      ${f()}
    </div>

    <div class="folder-layer" style="
      top:${l}px; left:0; right:0;
      height:${r-l}px;">
      <div class="folder-tab" style="width:${Math.round(n*.34)}px;">
        <span class="folder-tab-label">${o(e.title)||`bookcard`}</span>
      </div>
      <div class="folder-body">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:${Math.round(a/2+16)}px 22px 18px;">
          ${u()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${c}px; left:${s}px;
      width:${i}px; height:${Math.round(a/2)}px;">
      ${f(i,a)}
    </div>`}function ie(e,t,n){t-Math.round(t*.3);let r=Math.round(n*.68),i=Math.round(r/1.42),a=Math.round(t*.04),o=Math.round((n-r)/2),s=a+Math.round(i/2);e.innerHTML=`
    <div class="card-bg-overlay"></div>

    <div class="cover-back" style="
      top:${o}px; left:${a}px;
      width:${i}px; height:${r}px;
      border-radius: 6px 0 0 6px;">
      ${f()}
    </div>

    <div class="folder-layer" style="
      top:0; left:${s}px;
      width:${t-s}px; height:${n}px;">
      <div class="folder-tab" style="
        top:${Math.round(n*.12)}px; left:-1px; width:18px; height:${Math.round(n*.36)}px;
        border-radius:9px 0 0 9px; border-right:none; border-left:1px solid rgba(255,255,255,0.85);">
      </div>
      <div class="folder-body" style="top:0; border-radius:0 20px 20px 0;">
        <div class="folder-glass"></div>
        <div class="folder-content" style="padding:20px 18px 18px ${Math.round(i/2+20)}px;">
          ${u()}
        </div>
      </div>
    </div>

    <div class="cover-front" style="
      top:${o}px; left:${a}px;
      width:${Math.round(i/2)}px; height:${r}px;
      border-radius: 6px 0 0 6px;">
      ${f(i,r)}
    </div>`}function f(t,n){let r=e.cover||e.userImage;return r?t&&n?`<img src="${r}" style="width:${t}px;height:${n}px;" alt="">`:`<img src="${r}" alt="">`:`<div style="width:100%;height:100%;background:var(--color-sub);opacity:0.4;"></div>`}function ae(t){let[n,r]=i[e.ratio],a=t.querySelector(`.card-scene`)||document.createElement(`div`);return a.className=`card-scene`,a.setAttribute(`data-theme`,e.theme),a.setAttribute(`data-font`,e.font),a.style.width=n+`px`,a.style.height=r+`px`,e.font===`custom`&&e.customFont?a.style.setProperty(`--font-ko`,`'${e.customFont}', sans-serif`):a.style.removeProperty(`--font-ko`),e.bgPreset===`image`&&e.bgImage?(a.classList.add(`bg-image`),a.style.backgroundImage=`url(${e.bgImage})`,a.style.backgroundColor=``):(a.classList.remove(`bg-image`),a.style.backgroundImage=``,a.style.backgroundColor=e.bgColor),s(e.ratio)?d(a,n,r):ie(a,n,r),t.contains(a)||t.appendChild(a),a}var oe=`https://bookshelves-server.onrender.com`;async function se(e,t){if(!e.trim())return[];try{let n=`${oe}/api/search?q=${encodeURIComponent(e)}&k=${encodeURIComponent(t||``)}`,r=await fetch(n);return r.ok?await r.json():[]}catch{return[]}}function ce(e){e=e.toLowerCase();let t=parseInt(e.slice(1,3),16)/255,n=parseInt(e.slice(3,5),16)/255,r=parseInt(e.slice(5,7),16)/255,i=Math.max(t,n,r),a=Math.min(t,n,r),o,s,c=(i+a)/2;if(i===a)o=s=0;else{let e=i-a;switch(s=c>.5?e/(2-i-a):e/(i+a),i){case t:o=((n-r)/e+(n<r?6:0))/6;break;case n:o=((r-t)/e+2)/6;break;case r:o=((t-n)/e+4)/6;break}}return[Math.round(o*360),Math.round(s*100),Math.round(c*100)]}function p(e,t,n){t/=100,n/=100;let r=t=>(t+e/30)%12,i=t*Math.min(n,1-n),a=e=>n-i*Math.max(-1,Math.min(r(e)-3,Math.min(9-r(e),1))),o=e=>Math.round(e*255).toString(16).padStart(2,`0`);return`#${o(a(0))}${o(a(8))}${o(a(4))}`}function le(e,t){let[n,r]=ce(e);return t===`light`?{bg:p(n,Math.max(r-10,5),93),glass:`rgba(245,241,235,0.60)`,text:p(n,20,14),textSub:p(n,10,52),accent:e,sub:p(n,Math.min(r+5,60),80)}:{bg:p(n,Math.min(r,20),12),glass:`rgba(18,22,38,0.68)`,text:p(n,10,90),textSub:p(n,8,55),accent:e,sub:p(n,Math.max(r-10,5),30)}}function ue(e){let t=document.documentElement;t.style.setProperty(`--color-bg`,e.bg),t.style.setProperty(`--color-glass`,e.glass),t.style.setProperty(`--color-text`,e.text),t.style.setProperty(`--color-text-sub`,e.textSub),t.style.setProperty(`--color-accent`,e.accent),t.style.setProperty(`--color-sub`,e.sub)}async function de(){if(!window.EyeDropper)return null;try{return(await new EyeDropper().open()).sRGBHex}catch{return null}}function fe(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i))return e;let n=document.implementation.createHTMLDocument(),r=n.createElement(`base`),i=n.createElement(`a`);return n.head.appendChild(r),n.body.appendChild(i),t&&(r.href=t),i.href=e,i.href}var pe=(()=>{let e=0,t=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(e+=1,`u${t()}${e}`)})();function m(e){let t=[];for(let n=0,r=e.length;n<r;n++)t.push(e[n]);return t}var h=null;function g(e={}){return h||(e.includeStyleProperties?(h=e.includeStyleProperties,h):(h=m(window.getComputedStyle(document.documentElement)),h))}function _(e,t){let n=(e.ownerDocument.defaultView||window).getComputedStyle(e).getPropertyValue(t);return n?parseFloat(n.replace(`px`,``)):0}function me(e){let t=_(e,`border-left-width`),n=_(e,`border-right-width`);return e.clientWidth+t+n}function he(e){let t=_(e,`border-top-width`),n=_(e,`border-bottom-width`);return e.clientHeight+t+n}function v(e,t={}){return{width:t.width||me(e),height:t.height||he(e)}}function ge(){let e,t;try{t=process}catch{}let n=t&&t.env?t.env.devicePixelRatio:null;return n&&(e=parseInt(n,10),Number.isNaN(e)&&(e=1)),e||window.devicePixelRatio||1}var y=16384;function _e(e){(e.width>y||e.height>y)&&(e.width>y&&e.height>y?e.width>e.height?(e.height*=y/e.width,e.width=y):(e.width*=y/e.height,e.height=y):e.width>y?(e.height*=y/e.width,e.width=y):(e.width*=y/e.height,e.height=y))}function b(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>t(r))})},r.onerror=n,r.crossOrigin=`anonymous`,r.decoding=`async`,r.src=e})}async function ve(e){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ye(e,t,n){let r=`http://www.w3.org/2000/svg`,i=document.createElementNS(r,`svg`),a=document.createElementNS(r,`foreignObject`);return i.setAttribute(`width`,`${t}`),i.setAttribute(`height`,`${n}`),i.setAttribute(`viewBox`,`0 0 ${t} ${n}`),a.setAttribute(`width`,`100%`),a.setAttribute(`height`,`100%`),a.setAttribute(`x`,`0`),a.setAttribute(`y`,`0`),a.setAttribute(`externalResourcesRequired`,`true`),i.appendChild(a),a.appendChild(e),ve(i)}var x=(e,t)=>{if(e instanceof t)return!0;let n=Object.getPrototypeOf(e);return n===null?!1:n.constructor.name===t.name||x(n,t)};function be(e){let t=e.getPropertyValue(`content`);return`${e.cssText} content: '${t.replace(/'|"/g,``)}';`}function xe(e,t){return g(t).map(t=>`${t}: ${e.getPropertyValue(t)}${e.getPropertyPriority(t)?` !important`:``};`).join(` `)}function Se(e,t,n,r){let i=`.${e}:${t}`,a=n.cssText?be(n):xe(n,r);return document.createTextNode(`${i}{${a}}`)}function S(e,t,n,r){let i=window.getComputedStyle(e,n),a=i.getPropertyValue(`content`);if(a===``||a===`none`)return;let o=pe();try{t.className=`${t.className} ${o}`}catch{return}let s=document.createElement(`style`);s.appendChild(Se(o,n,i,r)),t.appendChild(s)}function Ce(e,t,n){S(e,t,`:before`,n),S(e,t,`:after`,n)}var C=`application/font-woff`,w=`image/jpeg`,we={woff:C,woff2:C,ttf:`application/font-truetype`,eot:`application/vnd.ms-fontobject`,png:`image/png`,jpg:w,jpeg:w,gif:`image/gif`,tiff:`image/tiff`,svg:`image/svg+xml`,webp:`image/webp`};function Te(e){let t=/\.([^./]*?)$/g.exec(e);return t?t[1]:``}function T(e){return we[Te(e).toLowerCase()]||``}function Ee(e){return e.split(/,/)[1]}function E(e){return e.search(/^(data:)/)!==-1}function D(e,t){return`data:${t};base64,${e}`}async function O(e,t,n){let r=await fetch(e,t);if(r.status===404)throw Error(`Resource "${r.url}" not found`);let i=await r.blob();return new Promise((e,t)=>{let a=new FileReader;a.onerror=t,a.onloadend=()=>{try{e(n({res:r,result:a.result}))}catch(e){t(e)}},a.readAsDataURL(i)})}var k={};function De(e,t,n){let r=e.replace(/\?.*/,``);return n&&(r=e),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,``)),t?`[${t}]${r}`:r}async function A(e,t,n){let r=De(e,t,n.includeQueryParams);if(k[r]!=null)return k[r];n.cacheBust&&(e+=(/\?/.test(e)?`&`:`?`)+new Date().getTime());let i;try{i=D(await O(e,n.fetchRequestInit,({res:e,result:n})=>(t||=e.headers.get(`Content-Type`)||``,Ee(n))),t)}catch(t){i=n.imagePlaceholder||``;let r=`Failed to fetch resource: ${e}`;t&&(r=typeof t==`string`?t:t.message),r&&console.warn(r)}return k[r]=i,i}async function Oe(e){let t=e.toDataURL();return t===`data:,`?e.cloneNode(!1):b(t)}async function ke(e,t){if(e.currentSrc){let t=document.createElement(`canvas`),n=t.getContext(`2d`);return t.width=e.clientWidth,t.height=e.clientHeight,n?.drawImage(e,0,0,t.width,t.height),b(t.toDataURL())}let n=e.poster;return b(await A(n,T(n),t))}async function Ae(e,t){try{if(e?.contentDocument?.body)return await M(e.contentDocument.body,t,!0)}catch{}return e.cloneNode(!1)}async function je(e,t){return x(e,HTMLCanvasElement)?Oe(e):x(e,HTMLVideoElement)?ke(e,t):x(e,HTMLIFrameElement)?Ae(e,t):e.cloneNode(j(e))}var Me=e=>e.tagName!=null&&e.tagName.toUpperCase()===`SLOT`,j=e=>e.tagName!=null&&e.tagName.toUpperCase()===`SVG`;async function Ne(e,t,n){if(j(t))return t;let r=[];return r=Me(e)&&e.assignedNodes?m(e.assignedNodes()):x(e,HTMLIFrameElement)&&e.contentDocument?.body?m(e.contentDocument.body.childNodes):m((e.shadowRoot??e).childNodes),r.length===0||x(e,HTMLVideoElement)||await r.reduce((e,r)=>e.then(()=>M(r,n)).then(e=>{e&&t.appendChild(e)}),Promise.resolve()),t}function Pe(e,t,n){let r=t.style;if(!r)return;let i=window.getComputedStyle(e);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):g(n).forEach(n=>{let a=i.getPropertyValue(n);n===`font-size`&&a.endsWith(`px`)&&(a=`${Math.floor(parseFloat(a.substring(0,a.length-2)))-.1}px`),x(e,HTMLIFrameElement)&&n===`display`&&a===`inline`&&(a=`block`),n===`d`&&t.getAttribute(`d`)&&(a=`path(${t.getAttribute(`d`)})`),r.setProperty(n,a,i.getPropertyPriority(n))})}function Fe(e,t){x(e,HTMLTextAreaElement)&&(t.innerHTML=e.value),x(e,HTMLInputElement)&&t.setAttribute(`value`,e.value)}function Ie(e,t){if(x(e,HTMLSelectElement)){let n=t,r=Array.from(n.children).find(t=>e.value===t.getAttribute(`value`));r&&r.setAttribute(`selected`,``)}}function Le(e,t,n){return x(t,Element)&&(Pe(e,t,n),Ce(e,t,n),Fe(e,t),Ie(e,t)),t}async function Re(e,t){let n=e.querySelectorAll?e.querySelectorAll(`use`):[];if(n.length===0)return e;let r={};for(let i=0;i<n.length;i++){let a=n[i].getAttribute(`xlink:href`);if(a){let n=e.querySelector(a),i=document.querySelector(a);!n&&i&&!r[a]&&(r[a]=await M(i,t,!0))}}let i=Object.values(r);if(i.length){let t=`http://www.w3.org/1999/xhtml`,n=document.createElementNS(t,`svg`);n.setAttribute(`xmlns`,t),n.style.position=`absolute`,n.style.width=`0`,n.style.height=`0`,n.style.overflow=`hidden`,n.style.display=`none`;let r=document.createElementNS(t,`defs`);n.appendChild(r);for(let e=0;e<i.length;e++)r.appendChild(i[e]);e.appendChild(n)}return e}async function M(e,t,n){return!n&&t.filter&&!t.filter(e)?null:Promise.resolve(e).then(e=>je(e,t)).then(n=>Ne(e,n,t)).then(n=>Le(e,n,t)).then(e=>Re(e,t))}var N=/url\((['"]?)([^'"]+?)\1\)/g,ze=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Be=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Ve(e){let t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,`\\$1`);return RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,`g`)}function He(e){let t=[];return e.replace(N,(e,n,r)=>(t.push(r),e)),t.filter(e=>!E(e))}async function Ue(e,t,n,r,i){try{let a=n?fe(t,n):t,o=T(t),s;return s=i?D(await i(a),o):await A(a,o,r),e.replace(Ve(t),`$1${s}$3`)}catch{}return e}function We(e,{preferredFontFormat:t}){return t?e.replace(Be,e=>{for(;;){let[n,,r]=ze.exec(e)||[];if(!r)return``;if(r===t)return`src: ${n};`}}):e}function P(e){return e.search(N)!==-1}async function F(e,t,n){if(!P(e))return e;let r=We(e,n);return He(r).reduce((e,r)=>e.then(e=>Ue(e,r,t,n)),Promise.resolve(r))}async function I(e,t,n){let r=t.style?.getPropertyValue(e);if(r){let i=await F(r,null,n);return t.style.setProperty(e,i,t.style.getPropertyPriority(e)),!0}return!1}async function Ge(e,t){await I(`background`,e,t)||await I(`background-image`,e,t),await I(`mask`,e,t)||await I(`-webkit-mask`,e,t)||await I(`mask-image`,e,t)||await I(`-webkit-mask-image`,e,t)}async function Ke(e,t){let n=x(e,HTMLImageElement);if(!(n&&!E(e.src))&&!(x(e,SVGImageElement)&&!E(e.href.baseVal)))return;let r=n?e.src:e.href.baseVal,i=await A(r,T(r),t);await new Promise((r,a)=>{e.onload=r,e.onerror=t.onImageErrorHandler?(...e)=>{try{r(t.onImageErrorHandler(...e))}catch(e){a(e)}}:a;let o=e;o.decode&&=r,o.loading===`lazy`&&(o.loading=`eager`),n?(e.srcset=``,e.src=i):e.href.baseVal=i})}async function qe(e,t){let n=m(e.childNodes).map(e=>L(e,t));await Promise.all(n).then(()=>e)}async function L(e,t){x(e,Element)&&(await Ge(e,t),await Ke(e,t),await qe(e,t))}function Je(e,t){let{style:n}=e;t.backgroundColor&&(n.backgroundColor=t.backgroundColor),t.width&&(n.width=`${t.width}px`),t.height&&(n.height=`${t.height}px`);let r=t.style;return r!=null&&Object.keys(r).forEach(e=>{n[e]=r[e]}),e}var R={};async function z(e){let t=R[e];return t??(t={url:e,cssText:await(await fetch(e)).text()},R[e]=t,t)}async function B(e,t){let n=e.cssText,r=/url\(["']?([^"')]+)["']?\)/g,i=(n.match(/url\([^)]+\)/g)||[]).map(async i=>{let a=i.replace(r,`$1`);return a.startsWith(`https://`)||(a=new URL(a,e.url).href),O(a,t.fetchRequestInit,({result:e})=>(n=n.replace(i,`url(${e})`),[i,e]))});return Promise.all(i).then(()=>n)}function V(e){if(e==null)return[];let t=[],n=e.replace(/(\/\*[\s\S]*?\*\/)/gi,``),r=RegExp(`((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})`,`gi`);for(;;){let e=r.exec(n);if(e===null)break;t.push(e[0])}n=n.replace(r,``);let i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,a=RegExp(`((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})`,`gi`);for(;;){let e=i.exec(n);if(e===null){if(e=a.exec(n),e===null)break;i.lastIndex=a.lastIndex}else a.lastIndex=i.lastIndex;t.push(e[0])}return t}async function Ye(e,t){let n=[],r=[];return e.forEach(n=>{if(`cssRules`in n)try{m(n.cssRules||[]).forEach((e,i)=>{if(e.type===CSSRule.IMPORT_RULE){let a=i+1,o=e.href,s=z(o).then(e=>B(e,t)).then(e=>V(e).forEach(e=>{try{n.insertRule(e,e.startsWith(`@import`)?a+=1:n.cssRules.length)}catch(t){console.error(`Error inserting rule from remote css`,{rule:e,error:t})}})).catch(e=>{console.error(`Error loading remote css`,e.toString())});r.push(s)}})}catch(i){let a=e.find(e=>e.href==null)||document.styleSheets[0];n.href!=null&&r.push(z(n.href).then(e=>B(e,t)).then(e=>V(e).forEach(e=>{a.insertRule(e,a.cssRules.length)})).catch(e=>{console.error(`Error loading remote stylesheet`,e)})),console.error(`Error inlining remote css file`,i)}}),Promise.all(r).then(()=>(e.forEach(e=>{if(`cssRules`in e)try{m(e.cssRules||[]).forEach(e=>{n.push(e)})}catch(t){console.error(`Error while reading CSS rules from ${e.href}`,t)}}),n))}function Xe(e){return e.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>P(e.style.getPropertyValue(`src`)))}async function Ze(e,t){if(e.ownerDocument==null)throw Error(`Provided element is not within a Document`);return Xe(await Ye(m(e.ownerDocument.styleSheets),t))}function H(e){return e.trim().replace(/["']/g,``)}function Qe(e){let t=new Set;function n(e){(e.style.fontFamily||getComputedStyle(e).fontFamily).split(`,`).forEach(e=>{t.add(H(e))}),Array.from(e.children).forEach(e=>{e instanceof HTMLElement&&n(e)})}return n(e),t}async function $e(e,t){let n=await Ze(e,t),r=Qe(e);return(await Promise.all(n.filter(e=>r.has(H(e.style.fontFamily))).map(e=>{let n=e.parentStyleSheet?e.parentStyleSheet.href:null;return F(e.cssText,n,t)}))).join(`
`)}async function et(e,t){let n=t.fontEmbedCSS==null?t.skipFonts?null:await $e(e,t):t.fontEmbedCSS;if(n){let t=document.createElement(`style`),r=document.createTextNode(n);t.appendChild(r),e.firstChild?e.insertBefore(t,e.firstChild):e.appendChild(t)}}async function tt(e,t={}){let{width:n,height:r}=v(e,t),i=await M(e,t,!0);return await et(i,t),await L(i,t),Je(i,t),await ye(i,n,r)}async function nt(e,t={}){let{width:n,height:r}=v(e,t),i=await b(await tt(e,t)),a=document.createElement(`canvas`),o=a.getContext(`2d`),s=t.pixelRatio||ge(),c=t.canvasWidth||n,l=t.canvasHeight||r;return a.width=c*s,a.height=l*s,t.skipAutoScale||_e(a),a.style.width=`${c}`,a.style.height=`${l}`,t.backgroundColor&&(o.fillStyle=t.backgroundColor,o.fillRect(0,0,a.width,a.height)),o.drawImage(i,0,0,a.width,a.height),a}async function U(e,t={}){return(await nt(e,t)).toDataURL()}var W={pixelRatio:3,skipFonts:!1,cacheBust:!0};async function rt(e){try{let t=await U(e,W),n=document.createElement(`a`);n.download=`bookcard-${Date.now()}.png`,n.href=t,document.body.appendChild(n),n.click(),document.body.removeChild(n)}catch(e){throw Error(`PNG 저장에 실패했습니다: ${e.message}`)}}async function it(e){try{let t=await U(e,W),n=await(await fetch(t)).blob();await navigator.clipboard.write([new ClipboardItem({"image/png":n})])}catch(e){throw Error(`클립보드 복사에 실패했습니다: ${e.message}`)}}function G(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}var K=`nagi_ttb_key`;function q(){return localStorage.getItem(K)||``}function at(e){localStorage.setItem(K,e.trim())}document.body.insertAdjacentHTML(`beforeend`,`
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
  </div>`);function J(){document.getElementById(`onboarding-overlay`).classList.remove(`hidden`)}function ot(){document.getElementById(`onboarding-overlay`).classList.add(`hidden`)}document.getElementById(`ttb-key-save`).addEventListener(`click`,()=>{let e=document.getElementById(`ttb-key-input`).value.trim();e&&(at(e),ot())}),document.getElementById(`ttb-key-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&document.getElementById(`ttb-key-save`).click()}),q()||J(),document.getElementById(`panel`).innerHTML=`
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
`,document.getElementById(`preview`).innerHTML=`<div id="preview-inner"></div>`;var Y=document.getElementById(`preview-inner`),X=new Date;document.getElementById(`date-input`).value=`${X.getFullYear()}-${String(X.getMonth()+1).padStart(2,`0`)}-${String(X.getDate()).padStart(2,`0`)}`,n({date:X});function Z(){ue(le(e.accentColor,e.theme)),ae(Y),Q(),st()}function st(){document.querySelectorAll(`#star-input .star-btn`).forEach((t,n)=>{t.classList.toggle(`on`,n<e.rating)})}function Q(){let e=Y.querySelector(`.card-scene`);if(!e)return;let t=e.offsetWidth,n=e.offsetHeight,r=document.getElementById(`preview`).offsetWidth-80,i=document.getElementById(`preview`).offsetHeight-80,a=Math.min(r/t,i/n,1);Y.style.transform=`scale(${a})`}window.addEventListener(`resize`,Q);var $;document.getElementById(`search-input`).addEventListener(`input`,e=>{clearTimeout($),$=setTimeout(()=>ct(e.target.value),400)}),document.getElementById(`search-btn`).addEventListener(`click`,()=>{ct(document.getElementById(`search-input`).value)});async function ct(e){if(!e.trim())return;let t=document.getElementById(`search-results`);t.innerHTML=`<div style="padding:8px 12px;font-size:12px;color:#8C8680">검색 중...</div>`,t.classList.add(`open`);let r=await se(e,q());if(!r.length){t.innerHTML=`<div style="padding:8px 12px;font-size:12px;color:#8C8680">결과 없음</div>`;return}t.innerHTML=r.map((e,t)=>`
    <div class="search-result-item" data-idx="${t}">
      <img src="${G(e.cover||``)}" onerror="this.style.display='none'">
      <div>
        <div class="search-result-title">${G(e.title)}</div>
        <div class="search-result-author">${G(e.author)}</div>
      </div>
    </div>`).join(``),t.querySelectorAll(`.search-result-item`).forEach(e=>{e.addEventListener(`click`,()=>{let i=r[+e.dataset.idx];n({title:i.title,author:i.author,cover:i.cover||null}),document.getElementById(`title-input`).value=i.title,document.getElementById(`author-input`).value=i.author,t.classList.remove(`open`),document.getElementById(`search-input`).value=``})})}document.getElementById(`change-key-btn`).addEventListener(`click`,()=>{document.getElementById(`ttb-key-input`).value=q(),J()}),document.addEventListener(`click`,e=>{document.getElementById(`search-wrap`).contains(e.target)||document.getElementById(`search-results`).classList.remove(`open`)}),document.getElementById(`title-input`).addEventListener(`input`,e=>n({title:e.target.value})),document.getElementById(`author-input`).addEventListener(`input`,e=>n({author:e.target.value})),document.getElementById(`date-input`).addEventListener(`change`,e=>{n({date:new Date(e.target.value)})}),document.getElementById(`cover-upload-btn`).addEventListener(`click`,()=>{document.getElementById(`cover-file`).click()}),document.getElementById(`cover-file`).addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let r=new FileReader;r.onload=e=>n({cover:null,userImage:e.target.result}),r.readAsDataURL(t)}),document.getElementById(`quote-toggle`).addEventListener(`click`,function(){n({quoteEnabled:this.classList.toggle(`on`)})}),document.getElementById(`quote-input`).addEventListener(`input`,e=>n({quote:e.target.value})),document.getElementById(`rating-toggle`).addEventListener(`click`,function(){n({ratingEnabled:this.classList.toggle(`on`)})}),document.getElementById(`star-input`).addEventListener(`click`,e=>{let t=e.target.closest(`.star-btn`);t&&n({rating:+t.dataset.val})}),document.querySelectorAll(`.ratio-btn`).forEach(e=>{e.addEventListener(`click`,function(){document.querySelectorAll(`.ratio-btn`).forEach(e=>e.classList.remove(`active`)),this.classList.add(`active`),n({ratio:this.dataset.ratio})})});var lt={white:`#FFFFFF`,beige:`#F0EBE3`,gray:`#9E9A94`,black:`#1A1A1A`};document.querySelectorAll(`.bg-swatch`).forEach(e=>{e.addEventListener(`click`,function(){document.querySelectorAll(`.bg-swatch`).forEach(e=>e.classList.remove(`active`)),this.classList.add(`active`);let e=this.dataset.bgPreset;n({bgPreset:e,bgColor:lt[e],bgImage:null})})}),document.getElementById(`bg-color-input`).addEventListener(`input`,e=>{n({bgPreset:`custom`,bgColor:e.target.value,bgImage:null})}),document.getElementById(`bg-image-btn`).addEventListener(`click`,()=>{document.getElementById(`bg-file`).click()}),document.getElementById(`bg-file`).addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let r=new FileReader;r.onload=e=>n({bgPreset:`image`,bgImage:e.target.result}),r.readAsDataURL(t)}),document.getElementById(`accent-picker`).addEventListener(`input`,e=>{n({accentColor:e.target.value})}),document.getElementById(`eyedropper-btn`).addEventListener(`click`,async()=>{let e=await de();e&&(document.getElementById(`accent-picker`).value=e,n({accentColor:e}))}),document.getElementById(`font-select`).addEventListener(`change`,e=>{let t=e.target.value,r=document.getElementById(`custom-font-input`);t===`custom`?(r.style.display=`block`,r.focus()):(r.style.display=`none`,n({font:t,customFont:``}))}),document.getElementById(`custom-font-input`).addEventListener(`input`,e=>{n({customFont:e.target.value.trim()})}),document.getElementById(`theme-toggle`).addEventListener(`click`,function(){n({theme:this.classList.toggle(`on`)?`dark`:`light`})}),document.getElementById(`save-btn`).addEventListener(`click`,async()=>{let e=Y.querySelector(`.card-scene`);if(e){document.getElementById(`save-btn`).textContent=`저장 중...`;try{await rt(e)}finally{document.getElementById(`save-btn`).textContent=`PNG 저장`}}}),document.getElementById(`clipboard-btn`).addEventListener(`click`,async()=>{let e=Y.querySelector(`.card-scene`);if(e){document.getElementById(`clipboard-btn`).textContent=`복사 중...`;try{await it(e),document.getElementById(`clipboard-btn`).textContent=`✓ 복사됨`,setTimeout(()=>{document.getElementById(`clipboard-btn`).textContent=`클립보드`},2e3)}catch{document.getElementById(`clipboard-btn`).textContent=`클립보드`}}}),r(Z),Z();