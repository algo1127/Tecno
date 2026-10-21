/* ==========================================================================
   sim-wifi.js · Simulador de Bandas Wi-Fi y Seguridad (WPA)
   [Drop & Play Version - CSS incluido, animaciones fluidas]
   ========================================================================== */
(function (global) {
'use strict';

const CSS_STYLES = `
.wlan {
  --bg: #0f1620; --panel: #16202c; --panel-2: #1d2a38; --line: #2a3a4d;
  --txt: #e6eef7; --muted: #93a6bb; --accent: #4f9dff; 
  --c24: #f2a33c; --c24-bg: rgba(242, 163, 60, 0.15);
  --c5: #12b5a5; --c5-bg: rgba(18, 181, 165, 0.15);
  --sec-wep: #ff5c5c; --sec-wpa: #ffd23d; --sec-wpa2: #4f9dff; --sec-wpa3: #3ddc97;
  color: var(--txt); background: var(--bg);
  font: 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 20px; border-radius: 14px; max-width: 900px; margin: 0 auto;
}
@media (prefers-color-scheme: light) {
  .wlan { --bg:#f5f8fc; --panel:#fff; --panel-2:#eef3f9; --line:#d6e0ec;
          --txt:#152232; --muted:#5b6f86; --c24-bg: rgba(242, 163, 60, 0.1); --c5-bg: rgba(18, 181, 165, 0.1); }
}
.wlan *, .wlan *::before, .wlan *::after { box-sizing: border-box; }

.wlan__head { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; margin-bottom:20px; }
.wlan__head h2 { margin:0; font-size:1.25rem; }
.wlan__head p { margin:2px 0 0; color:var(--muted); font-size:.85rem; }

/* --- SECCIÓN BANDAS --- */
.wlan__bands { display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px; }
@media (max-width: 600px) { .wlan__bands { grid-template-columns: 1fr; } }

.wlan__visual { 
  background:var(--panel); border:1px solid var(--line); border-radius:12px; 
  padding:30px 20px; display:flex; flex-direction:column; align-items:center; 
  position:relative; min-height:280px; overflow:hidden;
}

.wlan__router {
  width:60px; height:60px; background:var(--panel-2); border:2px solid var(--line);
  border-radius:12px; display:flex; align-items:center; justify-content:center;
  z-index:2; position:relative; margin-bottom:20px;
}
.wlan__router svg { width:32px; height:32px; fill:var(--muted); transition:fill .3s; }

.wlan__waves {
  position:absolute; top:50%; left:50%; transform:translate(-50%, -60%);
  width:200px; height:200px; border-radius:50%; pointer-events:none; z-index:1;
}
.wlan__wave {
  position:absolute; inset:0; border-radius:50%; border:2px solid transparent;
  opacity:0; transform:scale(0.5);
}
.wlan.is-24 .wlan__router svg { fill:var(--c24); }
.wlan.is-24 .wlan__wave { border-color:var(--c24); animation: ripple24 3s infinite ease-out; }
.wlan.is-24 .wlan__wave:nth-child(2) { animation-delay: 1s; }
.wlan.is-24 .wlan__wave:nth-child(3) { animation-delay: 2s; }

.wlan.is-5 .wlan__router svg { fill:var(--c5); }
.wlan.is-5 .wlan__wave { border-color:var(--c5); animation: ripple5 1.5s infinite ease-out; }
.wlan.is-5 .wlan__wave:nth-child(2) { animation-delay: 0.5s; }
.wlan.is-5 .wlan__wave:nth-child(3) { animation-delay: 1s; }

@keyframes ripple24 {
  0% { transform:scale(0.5); opacity:0.8; border-width:3px; }
  100% { transform:scale(2.5); opacity:0; border-width:0px; }
}
@keyframes ripple5 {
  0% { transform:scale(0.5); opacity:0.8; border-width:3px; }
  100% { transform:scale(1.5); opacity:0; border-width:0px; }
}

.wlan__wall {
  position:absolute; bottom:20px; left:50%; transform:translateX(-50%);
  width:80%; height:8px; background:repeating-linear-gradient(90deg, var(--line) 0, var(--line) 10px, transparent 10px, transparent 15px);
  border-radius:4px; opacity:0.6;
}
.wlan__wall-label {
  position:absolute; bottom:4px; left:50%; transform:translateX(-50%);
  font-size:.65rem; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; white-space:nowrap;
}

.wlan__controls { display:flex; flex-direction:column; gap:16px; }
.wlan__toggles { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.wlan__toggle {
  appearance:none; border:2px solid var(--line); background:var(--panel);
  color:var(--txt); padding:14px; border-radius:10px; cursor:pointer;
  font:600 .95rem/1 inherit; text-align:center; transition:all .2s;
}
.wlan__toggle:hover { border-color:var(--muted); }
.wlan__toggle.active-24 { border-color:var(--c24); background:var(--c24-bg); color:var(--c24); }
.wlan__toggle.active-5 { border-color:var(--c5); background:var(--c5-bg); color:var(--c5); }

.wlan__meters { display:flex; flex-direction:column; gap:14px; margin-top:10px; }
.wlan__meter { display:flex; flex-direction:column; gap:6px; }
.wlan__meter-label { display:flex; justify-content:space-between; font-size:.8rem; color:var(--muted); font-weight:600; }
.wlan__meter-track { height:8px; background:var(--panel-2); border-radius:4px; overflow:hidden; }
.wlan__meter-fill { height:100%; border-radius:4px; transition:width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s; width:0%; }

.wlan__caption {
  margin-top:auto; padding:14px; background:var(--panel-2); border-radius:8px;
  font-size:.85rem; line-height:1.5; color:var(--txt); border-left:3px solid var(--accent);
  transition:all 0.3s;
}

/* --- SECCIÓN SEGURIDAD --- */
.wlan__security { margin-top:10px; }
.wlan__sec-title { font-size:1rem; margin-bottom:12px; color:var(--txt); }
.wlan__sec-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:16px; }
@media (max-width: 600px) { .wlan__sec-grid { grid-template-columns:1fr 1fr; } }

.wlan__sec-card {
  background:var(--panel); border:1px solid var(--line); border-radius:10px;
  padding:14px 10px; text-align:center; cursor:pointer; transition:all .2s;
  position:relative; overflow:hidden;
}
.wlan__sec-card:hover { transform:translateY(-2px); border-color:var(--muted); }
.wlan__sec-card.active { border-width:2px; }
.wlan__sec-card[data-sec="wep"].active { border-color:var(--sec-wep); background:rgba(255,92,92,0.1); }
.wlan__sec-card[data-sec="wpa"].active { border-color:var(--sec-wpa); background:rgba(255,210,61,0.1); }
.wlan__sec-card[data-sec="wpa2"].active { border-color:var(--sec-wpa2); background:rgba(79,157,255,0.1); }
.wlan__sec-card[data-sec="wpa3"].active { border-color:var(--sec-wpa3); background:rgba(61,220,151,0.1); }

.wlan__sec-year { font-size:.7rem; color:var(--muted); font-weight:600; margin-bottom:4px; }
.wlan__sec-name { font-size:.9rem; font-weight:700; color:var(--txt); margin-bottom:8px; }
.wlan__sec-icon { width:24px; height:24px; margin:0 auto; fill:var(--muted); transition:fill .3s; }
.wlan__sec-card.active .wlan__sec-icon { fill:var(--txt); }

.wlan__sec-detail {
  background:var(--panel); border:1px solid var(--line); border-radius:10px;
  padding:16px; display:flex; gap:16px; align-items:flex-start;
  transition:all 0.3s;
}
.wlan__sec-shield {
  flex-shrink:0; width:50px; height:50px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:var(--panel-2); border:2px solid var(--line);
  transition:all 0.4s;
}
.wlan__sec-shield svg { width:24px; height:24px; fill:var(--muted); transition:fill 0.4s; }
.wlan__sec-card[data-sec="wep"].active ~ .wlan__sec-detail .wlan__sec-shield { border-color:var(--sec-wep); }
.wlan__sec-card[data-sec="wep"].active ~ .wlan__sec-detail .wlan__sec-shield svg { fill:var(--sec-wep); }
.wlan__sec-card[data-sec="wpa"].active ~ .wlan__sec-detail .wlan__sec-shield { border-color:var(--sec-wpa); }
.wlan__sec-card[data-sec="wpa"].active ~ .wlan__sec-detail .wlan__sec-shield svg { fill:var(--sec-wpa); }
.wlan__sec-card[data-sec="wpa2"].active ~ .wlan__sec-detail .wlan__sec-shield { border-color:var(--sec-wpa2); }
.wlan__sec-card[data-sec="wpa2"].active ~ .wlan__sec-detail .wlan__sec-shield svg { fill:var(--sec-wpa2); }
.wlan__sec-card[data-sec="wpa3"].active ~ .wlan__sec-detail .wlan__sec-shield { border-color:var(--sec-wpa3); box-shadow:0 0 20px rgba(61,220,151,0.3); }
.wlan__sec-card[data-sec="wpa3"].active ~ .wlan__sec-detail .wlan__sec-shield svg { fill:var(--sec-wpa3); }

.wlan__sec-text h4 { margin:0 0 6px; font-size:1rem; color:var(--txt); }
.wlan__sec-text p { margin:0; font-size:.85rem; color:var(--muted); line-height:1.5; }
.wlan__sec-text strong { color:var(--txt); }
`;

let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected || document.getElementById('wlan-sim-styles')) return;
  const s = document.createElement('style');
  s.id = 'wlan-sim-styles';
  s.textContent = CSS_STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

const ICON_ROUTER = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;
const ICON_LOCK_OPEN = `<svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg>`;
const ICON_LOCK_HALF = `<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;
const ICON_LOCK_FULL = `<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`; // Using same as half for simplicity, but styled differently
const ICON_SHIELD = `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;

const TPL = `
<div class="wlan" id="wlanApp">
  <header class="wlan__head">
    <div>
      <h2>Wi-Fi: Bandas y Seguridad</h2>
      <p>Comprende el equilibrio entre frecuencia, cobertura y la evolución del cifrado inalámbrico.</p>
    </div>
  </header>

  <div class="wlan__bands">
    <div class="wlan__visual">
      <div class="wlan__router">${ICON_ROUTER}</div>
      <div class="wlan__waves">
        <div class="wlan__wave"></div>
        <div class="wlan__wave"></div>
        <div class="wlan__wave"></div>
      </div>
      <div class="wlan__wall"></div>
      <div class="wlan__wall-label">Obstáculo (Pared)</div>
    </div>

    <div class="wlan__controls">
      <div class="wlan__toggles">
        <button class="wlan__toggle active-24" data-band="24">2.4 GHz</button>
        <button class="wlan__toggle" data-band="5">5 GHz</button>
      </div>

      <div class="wlan__meters">
        <div class="wlan__meter">
          <div class="wlan__meter-label"><span>Velocidad Máx.</span><span id="speedVal">~54 Mbps</span></div>
          <div class="wlan__meter-track"><div class="wlan__meter-fill" id="speedFill" style="width:38%; background:var(--c24)"></div></div>
        </div>
        <div class="wlan__meter">
          <div class="wlan__meter-label"><span>Cobertura / Penetración</span><span id="covVal">Alta</span></div>
          <div class="wlan__meter-track"><div class="wlan__meter-fill" id="covFill" style="width:86%; background:var(--c24)"></div></div>
        </div>
      </div>

      <div class="wlan__caption" id="bandCaption">
        <strong>2.4 GHz:</strong> Mayor cobertura y penetración de obstáculos, pero menor velocidad y más interferencias (microondas, Bluetooth, otros Wi-Fi).
      </div is-24>
    </div>
  </div>

  <div class="wlan__security">
    <h3 class="wlan__sec-title">Evolución de la Seguridad Wi-Fi</h3>
    <div class="wlan__sec-grid" id="secGrid">
      <div class="wlan__sec-card active" data-sec="wep">
        <div class="wlan__sec-year">1997</div>
        <div class="wlan__sec-name">WEP</div>
        <div class="wlan__sec-icon">${ICON_LOCK_OPEN}</div>
      </div>
      <div class="wlan__sec-card" data-sec="wpa">
        <div class="wlan__sec-year">2003</div>
        <div class="wlan__sec-name">WPA</div>
        <div class="wlan__sec-icon">${ICON_LOCK_HALF}</div>
      </div>
      <div class="wlan__sec-card" data-sec="wpa2">
        <div class="wlan__sec-year">2004</div>
        <div class="wlan__sec-name">WPA2</div>
        <div class="wlan__sec-icon">${ICON_LOCK_FULL}</div>
      </div>
      <div class="wlan__sec-card" data-sec="wpa3">
        <div class="wlan__sec-year">2018</div>
        <div class="wlan__sec-name">WPA3</div>
        <div class="wlan__sec-icon">${ICON_SHIELD}</div>
      </div>
    </div>

    <div class="wlan__sec-detail" id="secDetail">
      <div class="wlan__sec-shield" id="secShieldIcon">${ICON_LOCK_OPEN}</div>
      <div class="wlan__sec-text">
        <h4 id="secTitle">WEP · Wired Equivalent Privacy</h4>
        <p id="secDesc">Uno de los primeros protocolos. Se demostró que era <strong>vulnerable a varios tipos de ataques</strong> en minutos. Hoy no debe usarse bajo ninguna circunstancia.</p>
      </div
    </div>
  </div>
</div>
`;

class WlanUI {
  constructor(root) {
    this.root = root;
    root.innerHTML = TPL;
    
    this.el = {
      app: root.querySelector('#wlanApp'),
      toggles: root.querySelectorAll('.wlan__toggle'),
      speedFill: root.querySelector('#speedFill'),
      speedVal: root.querySelector('#speedVal'),
      covFill: root.querySelector('#covFill'),
      covVal: root.querySelector('#covVal'),
      caption: root.querySelector('#bandCaption'),
      secCards: root.querySelectorAll('.wlan__sec-card'),
      secTitle: root.querySelector('#secTitle'),
      secDesc: root.querySelector('#secDesc'),
      secShield: root.querySelector('#secShieldIcon')
    };

    this.data = {
      '24': {
        speed: '38%', speedText: '~54-150 Mbps',
        cov: '86%', covText: 'Alta',
        color: 'var(--c24)',
        text: '<strong>2.4 GHz:</strong> Mayor cobertura y penetración de obstáculos (la onda es más larga), pero menor velocidad y más interferencias (microondas, Bluetooth, otros Wi-Fi).'
      },
      '5': {
        speed: '88%', speedText: '~400-1200+ Mbps',
        cov: '42%', covText: 'Media/Baja',
        color: 'var(--5)',
        text: '<strong>5 GHz:</strong> Mayor tasa de transmisión de datos (canales más anchos, menos interferencias), pero menor alcance y peor penetración de paredes (la onda es más corta y se dispersa).'
      }
    };

    this.secData = {
      wep: { title: 'WEP · Wired Equivalent Privacy (1997)', desc: 'Cifrado RC4 estático. <strong>Vulnerable a ataques de inyección</strong> que permiten descifrar la clave en minutos. Obsoleto y peligroso.', icon: ICON_LOCK_OPEN },
      wpa: { title: 'WPA · Wi-Fi Protected Access (2003)', desc: 'Mejora transitoria con <strong>claves dinámicas (TKIP)</strong> para parchear WEP mientras se desarrollaba WPA2. Hoy se considera insuficiente.', icon: ICON_LOCK_HALF },
      wpa2: { title: 'WPA2 (2004)', desc: 'Introduce cifrado fuerte <strong>AES-CCM</strong>. Fue el estándar recomendado durante más de una década y sigue siendo el mínimo exigible en redes actuales.', icon: ICON_LOCK_FULL },
      wpa3: { title: 'WPA3 (2018) · El estándar actual', desc: 'Seguridad <strong>superior</strong>: protege contra ataques de diccionario (emparejamiento SAE), cifra el tráfico incluso en redes abiertas (OWE) y requiere 192 bits en modo Enterprise.', icon: ICON_SHIELD }
    };

    this.bind();
    this.setBand('24');
    this.setSecurity('wep');
  }

  bind() {
    this.el.toggles.forEach(btn => {
      btn.addEventListener('click', () => this.setBand(btn.dataset.band));
    });

    this.el.secCards.forEach(card => {
      card.addEventListener('click', () => this.setSecurity(card.dataset.sec));
    });
  }

  setBand(band) {
    const d = this.data[band];
    
    // Update UI classes
    this.el.app.classList.remove('is-24', 'is-5');
    this.el.app.classList.add(`is-${band}`);
    
    this.el.toggles.forEach(t => {
      t.classList.remove('active-24', 'active-5');
      if (t.dataset.band === band) t.classList.add(`active-${band}`);
    });

    // Animate meters
    this.el.speedFill.style.width = d.speed;
    this.el.speedFill.style.backgroundColor = d.color;
    this.el.speedVal.textContent = d.speedText;
    
    this.el.covFill.style.width = d.cov;
    this.el.covFill.style.backgroundColor = d.color;
    this.el.covVal.textContent = d.covText;

    // Update caption with fade effect
    this.el.caption.style.opacity = '0';
    setTimeout(() => {
      this.el.caption.innerHTML = d.text;
      this.el.caption.style.opacity = '1';
    }, 150);
  }

  setSecurity(sec) {
    const d = this.secData[sec];
    
    this.el.secCards.forEach(c => c.classList.remove('active'));
    this.el.secCards.forEach(c => {
      if (c.dataset.sec === sec) c.classList.add('active');
    });

    this.el.secTitle.innerHTML = d.title;
    this.el.secDesc.innerHTML = d.desc;
    this.el.secShield.innerHTML = d.icon;
  }
}

function initWlan(target) {
  try {
    ensureStyles();
    const root = target || document.getElementById('wlanRoot') || document.getElementById('covCircle')?.parentElement?.parentElement;
    if (!root) return null;
    if (root.__wlanUI) return root.__wlanUI;
    
    const ui = new WlanUI(root);
    root.__wlanUI = ui;
    return ui;
  } catch (err) {
    console.error('[WLAN] ERROR:', err);
    return null;
  }
}

function tryAutoInit() {
  if (window.__wlanInitDone) return;
  if (!document.body) return;
  if (document.getElementById('wlanRoot') || document.getElementById('covCircle')) {
    window.__wlanInitDone = true;
    initWlan();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryAutoInit);
} else {
  tryAutoInit();
}

window.addEventListener('load', tryAutoInit);
window.initWlan = initWlan;
})(window);
