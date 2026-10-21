/* ==========================================================================
   sim-wifi.js · Wi-Fi: Bandas y Seguridad (rediseñado)
   - Escena interactiva: arrastra el dispositivo y mira cómo cae la señal
   - Seguridad: línea de tiempo + simulación de ataque por protocolo
   ========================================================================== */
(function (global) {
'use strict';

const CSS_STYLES = `
.wlan {
  --bg:#0f1620; --panel:#16202c; --panel-2:#1d2a38; --line:#2a3a4d;
  --txt:#e6eef7; --muted:#93a6bb; --accent:#4f9dff;
  --c24:#f2a33c; --c5:#12b5a5;
  --sec-wep:#ff5c5c; --sec-wpa:#ffb13d; --sec-wpa2:#4f9dff; --sec-wpa3:#3ddc97;
  --band:var(--c24);
  color:var(--txt); background:var(--bg);
  font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  padding:22px; border-radius:16px; max-width:960px; margin:0 auto;
}
@media (prefers-color-scheme: light) {
  .wlan { --bg:#f5f8fc; --panel:#fff; --panel-2:#eef3f9; --line:#d6e0ec; --txt:#152232; --muted:#5b6f86; }
}
.wlan *, .wlan *::before, .wlan *::after { box-sizing:border-box; }
.wlan h2,.wlan h3,.wlan h4,.wlan p { font-family:inherit; color:var(--txt); background:none; -webkit-text-fill-color:currentColor; letter-spacing:normal; text-transform:none; }
.wlan p { color:var(--muted); }
.wlan button { font-family:inherit; }

.wlan__head h2 { margin:0; font-size:1.3rem; }
.wlan__head p { margin:3px 0 18px; font-size:.86rem; }
.wlan__h3 { margin:26px 0 12px; font-size:1.02rem; display:flex; align-items:center; gap:8px; }
.wlan__h3::before { content:''; width:4px; height:18px; border-radius:2px; background:var(--accent); }
.wlan__h3.first { margin-top:0; }

/* ---------- Bandas ---------- */
.wlan__tabs { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
.wlan__tab {
  appearance:none; cursor:pointer; text-align:left; padding:12px 16px; border-radius:12px;
  background:var(--panel); border:2px solid var(--line); color:var(--txt); transition:all .2s;
}
.wlan__tab b { display:block; font-size:1.05rem; }
.wlan__tab span { font-size:.76rem; color:var(--muted); }
.wlan__tab:hover { border-color:var(--muted); }
.wlan__tab[data-band="24"].on { border-color:var(--c24); background:color-mix(in srgb,var(--c24) 13%,var(--panel)); }
.wlan__tab[data-band="5"].on  { border-color:var(--c5);  background:color-mix(in srgb,var(--c5) 13%,var(--panel)); }
.wlan__tab.on b { color:var(--band); }

.wlan__stage { background:var(--panel); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
.wlan__scene { display:block; width:100%; height:auto; }
.wlan__scene .gridline { stroke:var(--line); stroke-width:.6; opacity:.55; fill:none; }
.wlan__scene .ring { fill:none; stroke:var(--band); stroke-width:2; vector-effect:non-scaling-stroke;
  transform-origin:90px 160px; opacity:0; animation:wlRing var(--dur,3s) infinite ease-out; }
@keyframes wlRing { 0%{transform:scale(.3);opacity:.85} 100%{transform:scale(var(--maxs,8));opacity:0} }
.wlan__scene .rings-r { opacity:var(--pass,.5); transition:opacity .4s; }
.wlan__scene .wall { fill:url(#wlBrick); stroke:var(--line); stroke-width:1.5; }
.wlan__scene .lbl { fill:var(--muted); font:600 11px system-ui,sans-serif; text-anchor:middle; }
.wlan__scene .body { fill:var(--panel-2); stroke:var(--band); stroke-width:2; transition:stroke .3s; }
.wlan__scene .ant { stroke:var(--band); stroke-width:3; stroke-linecap:round; }
.wlan__scene .led { fill:var(--band); }
.wlan__scene .link { stroke-width:2.5; stroke-dasharray:5 6; stroke-linecap:round; animation:wlDash 1s linear infinite; }
@keyframes wlDash { to { stroke-dashoffset:-22; } }
.wlan__scene .dev { transition:none; }
.wlan__scene .bar { fill:var(--line); transition:fill .25s; }
.wlan__scene .bar.on { fill:var(--band); }
.wlan__scene .devbody { fill:var(--panel-2); stroke:var(--muted); stroke-width:2; }

.wlan__ctl { padding:14px 18px 4px; border-top:1px solid var(--line); }
.wlan__ctl label { display:flex; justify-content:space-between; font-size:.82rem; color:var(--muted); font-weight:600; margin-bottom:6px; }
.wlan input[type=range] { width:100%; accent-color:var(--band); }

.wlan__stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:10px 18px 16px; }
@media (max-width:560px){ .wlan__stats { grid-template-columns:1fr; } }
.wlan__stat { background:var(--panel-2); border:1px solid var(--line); border-radius:10px; padding:10px 12px; }
.wlan__stat span { font-size:.68rem; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); font-weight:700; }
.wlan__stat b { display:block; font:700 1.25rem/1.2 ui-monospace,monospace; color:var(--txt); }
.wlan__stat i { display:block; height:5px; border-radius:3px; background:var(--line); margin-top:6px; overflow:hidden; }
.wlan__stat i u { display:block; height:100%; width:0; background:var(--band); border-radius:3px; transition:width .35s, background-color .3s; text-decoration:none; }

.wlan__info { margin-top:12px; padding:14px 16px; background:var(--panel); border:1px solid var(--line);
  border-left:4px solid var(--band); border-radius:10px; font-size:.88rem; color:var(--txt); transition:opacity .15s; }
.wlan__info p { margin:0 0 8px; color:var(--txt); }
.wlan__pills { display:flex; flex-wrap:wrap; gap:6px; }
.wlan__pill { font-size:.74rem; font-weight:600; padding:3px 10px; border-radius:999px; border:1px solid var(--line); background:var(--panel-2); color:var(--muted); }
.wlan__pill.good { color:var(--sec-wpa3); border-color:color-mix(in srgb,var(--sec-wpa3) 45%,var(--line)); }
.wlan__pill.bad  { color:var(--sec-wep);  border-color:color-mix(in srgb,var(--sec-wep) 45%,var(--line)); }

/* ---------- Seguridad ---------- */
.wlan [data-sec="wep"]  { --c:var(--sec-wep); }
.wlan [data-sec="wpa"]  { --c:var(--sec-wpa); }
.wlan [data-sec="wpa2"] { --c:var(--sec-wpa2); }
.wlan [data-sec="wpa3"] { --c:var(--sec-wpa3); }

.wlan__sec-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; position:relative; }
@media (max-width:600px){ .wlan__sec-grid { grid-template-columns:1fr 1fr; } }
.wlan__sec-card {
  appearance:none; cursor:pointer; text-align:center; padding:14px 8px 12px; border-radius:12px;
  background:var(--panel); border:2px solid var(--line); color:var(--txt); transition:all .2s;
}
.wlan__sec-card:hover { transform:translateY(-2px); border-color:var(--muted); }
.wlan__sec-card.active { border-color:var(--c); background:color-mix(in srgb,var(--c) 11%,var(--panel)); box-shadow:0 6px 22px color-mix(in srgb,var(--c) 22%,transparent); }
.wlan__sec-year { display:block; font-size:.7rem; color:var(--muted); font-weight:700; }
.wlan__sec-name { display:block; font-size:1rem; font-weight:800; margin:2px 0 6px; }
.wlan__sec-card svg { width:26px; height:26px; color:var(--muted); transition:color .2s; }
.wlan__sec-card.active svg { color:var(--c); }
.wlan__segs { display:flex; gap:3px; justify-content:center; margin-top:8px; }
.wlan__segs i { width:100%; max-width:22px; height:5px; border-radius:3px; background:var(--line); }
.wlan__segs i.on { background:var(--c); }

.wlan__sec-detail { margin-top:12px; background:var(--panel); border:1px solid var(--line); border-top:3px solid var(--c);
  border-radius:12px; padding:18px; transition:border-color .3s; }
.wlan__sec-top { display:flex; gap:16px; align-items:flex-start; }
.wlan__shield { flex:none; width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:color-mix(in srgb,var(--c) 14%,var(--panel-2)); border:2px solid var(--c); color:var(--c);
  box-shadow:0 0 22px color-mix(in srgb,var(--c) 30%,transparent); }
.wlan__shield svg { width:28px; height:28px; }
.wlan__sec-top h4 { margin:0 0 4px; font-size:1.02rem; }
.wlan__sec-top p { margin:0; font-size:.86rem; line-height:1.55; }
.wlan__sec-top strong { color:var(--txt); }

.wlan__atk { margin-top:16px; padding-top:14px; border-top:1px dashed var(--line); }
.wlan__atk-row { display:flex; align-items:center; gap:12px; }
.wlan__atk-btn { appearance:none; cursor:pointer; flex:none; padding:8px 14px; border-radius:9px; font-weight:700; font-size:.84rem;
  background:var(--panel-2); color:var(--txt); border:1px solid var(--line); transition:all .15s; }
.wlan__atk-btn:hover:not(:disabled) { border-color:var(--c); color:var(--c); }
.wlan__atk-btn:disabled { opacity:.55; cursor:default; }
.wlan__atk-track { flex:1; height:12px; border-radius:6px; background:var(--panel-2); border:1px solid var(--line); overflow:hidden; }
.wlan__atk-fill { height:100%; width:0; background:var(--sec-wep); border-radius:6px; transition-property:width; transition-timing-function:linear; }
.wlan__atk-msg { margin:10px 0 0; font-size:.85rem; min-height:2.6em; color:var(--muted); }
.wlan__atk-msg strong { color:var(--txt); }
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

const SVG_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  wep:  `<svg ${SVG_ATTR}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.7"/></svg>`,
  wpa:  `<svg ${SVG_ATTR}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.2" fill="currentColor"/></svg>`,
  wpa2: `<svg ${SVG_ATTR}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><path d="M9.5 16l2 2 3.5-3.5"/></svg>`,
  wpa3: `<svg ${SVG_ATTR}><path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>`
};

const BANDS = {
  '24': {
    color:'#f2a33c', max:150, range:640, wall:0.10, maxs:9.5, pass:0.55, dur:'3.4s',
    text:'<strong>2.4 GHz</strong>: la onda es más larga, así que llega más lejos y atraviesa mejor las paredes. A cambio va más lenta y comparte espectro con microondas, Bluetooth y los Wi-Fi de tus vecinos.',
    pills:[['good','Mayor alcance'],['good','Atraviesa paredes'],['bad','Más lenta'],['bad','Muy congestionada'],['','3 canales sin solape (1, 6, 11)']]
  },
  '5': {
    color:'#12b5a5', max:867, range:400, wall:0.30, maxs:6, pass:0.16, dur:'1.9s',
    text:'<strong>5 GHz</strong>: canales más anchos y menos interferencias, por eso es mucho más rápida de cerca. Pero la onda es más corta, se atenúa antes y una pared la debilita mucho.',
    pills:[['good','Mucha velocidad'],['good','Menos interferencias'],['bad','Menor alcance'],['bad','Sufre con paredes'],['','19+ canales sin solape']]
  }
};

const ROUTER_X = 90, DEV_X0 = 130, DEV_X1 = 570, WALL_X = 300;

function ringCircles() {
  return [0,1,2].map(i => `<circle class="ring" cx="90" cy="160" r="60" style="animation-delay:calc(var(--dur,3s) * ${i}/3 * -1)"/>`).join('');
}

const TPL = `
<div class="wlan" id="wlanApp">
  <header class="wlan__head">
    <h2>Wi-Fi: Bandas y Seguridad</h2>
    <p>Mueve el dispositivo, cambia de banda y compara cómo se comporta la señal. Después, pon a prueba cada protocolo de cifrado.</p>
  </header>

  <h3 class="wlan__h3 first">Bandas de frecuencia</h3>
  <div class="wlan__tabs" id="wlTabs">
    <button type="button" class="wlan__tab on" data-band="24"><b>2.4 GHz</b><span>Alcance y penetración</span></button>
    <button type="button" class="wlan__tab" data-band="5"><b>5 GHz</b><span>Velocidad y menos ruido</span></button>
  </div>

  <div class="wlan__stage">
    <svg class="wlan__scene" viewBox="0 0 600 320" role="img" aria-label="Router, pared y dispositivo con la señal Wi-Fi propagándose">
      <defs>
        <pattern id="wlGrid" width="30" height="30" patternUnits="userSpaceOnUse"><path class="gridline" d="M30 0H0V30"/></pattern>
        <pattern id="wlBrick" width="16" height="14" patternUnits="userSpaceOnUse">
          <rect width="16" height="14" fill="#7a5a48"/>
          <path d="M0 7h16M8 0v7M0 7v7" stroke="#4f3a2e" stroke-width="1.2" fill="none"/>
        </pattern>
        <clipPath id="wlClipL"><rect x="0" y="0" width="292" height="320"/></clipPath>
        <clipPath id="wlClipR"><rect x="308" y="0" width="292" height="320"/></clipPath>
      </defs>
      <rect width="600" height="320" fill="url(#wlGrid)"/>
      <g clip-path="url(#wlClipL)">${ringCircles()}</g>
      <g clip-path="url(#wlClipR)" class="rings-r">${ringCircles()}</g>

      <rect class="wall" x="292" y="14" width="16" height="292" rx="3"/>
      <text class="lbl" x="300" y="312">Pared</text>

      <line class="link" id="wlLink" x1="${ROUTER_X}" y1="160" x2="220" y2="160"/>

      <g>
        <line class="ant" x1="72" y1="150" x2="64" y2="124"/><line class="ant" x1="108" y1="150" x2="116" y2="124"/>
        <rect class="body" x="58" y="148" width="64" height="24" rx="7"/>
        <circle class="led" cx="72" cy="160" r="2.6"/><circle class="led" cx="82" cy="160" r="2.6"/><circle class="led" cx="92" cy="160" r="2.6"/>
        <text class="lbl" x="90" y="196">Router</text>
      </g>

      <g class="dev" id="wlDev" transform="translate(220,160)">
        <rect class="bar" x="-14" y="-30" width="5" height="6" rx="1.5"/>
        <rect class="bar" x="-6"  y="-34" width="5" height="10" rx="1.5"/>
        <rect class="bar" x="2"   y="-38" width="5" height="14" rx="1.5"/>
        <rect class="bar" x="10"  y="-42" width="5" height="18" rx="1.5"/>
        <rect class="devbody" x="-17" y="-12" width="34" height="24" rx="5"/>
        <rect x="-12" y="-7" width="24" height="14" rx="2" fill="var(--line)"/>
        <text class="lbl" x="0" y="30">Tu dispositivo</text>
      </g>
    </svg>

    <div class="wlan__ctl">
      <label for="wlDist"><span>Distancia al router</span><span id="wlDistOut">—</span></label>
      <input type="range" id="wlDist" min="0" max="100" step="1" value="20">
    </div>

    <div class="wlan__stats">
      <div class="wlan__stat"><span>Velocidad</span><b id="wlSpeed">—</b><i><u id="wlSpeedBar"></u></i></div>
      <div class="wlan__stat"><span>Señal</span><b id="wlDbm">—</b><i><u id="wlSigBar"></u></i></div>
      <div class="wlan__stat"><span>Estado</span><b id="wlState">—</b></div>
    </div>
  </div>

  <div class="wlan__info" id="wlInfo"></div>

  <h3 class="wlan__h3">Evolución de la seguridad</h3>
  <div class="wlan__sec-grid" id="secGrid"></div>
  <div class="wlan__sec-detail" id="secDetail" data-sec="wep">
    <div class="wlan__sec-top">
      <div class="wlan__shield" id="secShield"></div>
      <div><h4 id="secTitle"></h4><p id="secDesc"></p></div>
    </div>
    <div class="wlan__atk">
      <div class="wlan__atk-row">
        <button type="button" class="wlan__atk-btn" id="atkBtn">▶ Simular ataque</button>
        <div class="wlan__atk-track"><div class="wlan__atk-fill" id="atkFill"></div></div>
      </div>
      <p class="wlan__atk-msg" id="atkMsg">Pulsa el botón para ver cómo resiste este protocolo a un atacante.</p>
    </div>
  </div>
</div>
`;

const SEC = {
  wep:  { year:'1997', name:'WEP',  level:1, title:'WEP · Wired Equivalent Privacy',
          desc:'Cifrado <strong>RC4 con clave estática</strong> y un vector de inicialización demasiado corto. Hoy no debe usarse bajo ninguna circunstancia.',
          atk:{ pct:100, ms:1200, color:'var(--sec-wep)', msg:'🔓 <strong>Clave recuperada en ~1 minuto</strong> capturando unos 40 000 paquetes. WEP se rompe aunque la contraseña sea buena.' } },
  wpa:  { year:'2003', name:'WPA',  level:2, title:'WPA · Wi-Fi Protected Access',
          desc:'Parche de emergencia sobre WEP con <strong>claves dinámicas (TKIP)</strong>. Mejoró mucho, pero hoy se considera insuficiente.',
          atk:{ pct:100, ms:3200, color:'var(--sec-wpa)', msg:'🔓 <strong>Comprometida</strong>: TKIP tiene debilidades conocidas y, si la contraseña es débil, cae por diccionario.' } },
  wpa2: { year:'2004', name:'WPA2', level:4, title:'WPA2 · Cifrado AES',
          desc:'Introduce el cifrado fuerte <strong>AES-CCMP</strong>. Estándar durante más de una década y mínimo exigible en redes actuales.',
          atk:{ pct:58, ms:4200, color:'var(--sec-wpa2)', msg:'🔒 <strong>Resiste</strong> con una contraseña larga. Pero si el atacante captura el handshake, puede probar diccionarios sin conexión contra una contraseña débil.' } },
  wpa3: { year:'2018', name:'WPA3', level:5, title:'WPA3 · El estándar actual',
          desc:'Autenticación <strong>SAE</strong> contra ataques de diccionario, cifrado en redes abiertas (<strong>OWE</strong>) y 192 bits en modo Enterprise.',
          atk:{ pct:6, ms:2500, color:'var(--sec-wpa3)', msg:'🛡️ <strong>Ataque bloqueado</strong>: SAE obliga a interactuar con el router en cada intento, así que no hay handshake que probar sin conexión.' } }
};

class WlanUI {
  constructor(root) {
    this.root = root;
    root.innerHTML = TPL;
    const q = s => root.querySelector(s);
    this.el = {
      app:q('#wlanApp'), tabs:root.querySelectorAll('.wlan__tab'),
      dev:q('#wlDev'), link:q('#wlLink'), bars:root.querySelectorAll('#wlDev .bar'),
      dist:q('#wlDist'), distOut:q('#wlDistOut'),
      speed:q('#wlSpeed'), speedBar:q('#wlSpeedBar'), dbm:q('#wlDbm'), sigBar:q('#wlSigBar'), state:q('#wlState'),
      info:q('#wlInfo'),
      secGrid:q('#secGrid'), detail:q('#secDetail'), shield:q('#secShield'), title:q('#secTitle'), desc:q('#secDesc'),
      atkBtn:q('#atkBtn'), atkFill:q('#atkFill'), atkMsg:q('#atkMsg')
    };
    this.band = '24'; this.sec = 'wep'; this.atkTimer = null;
    this.buildSecurity();
    this.bind();
    this.setBand('24');
    this.setSecurity('wep');
  }

  buildSecurity() {
    this.el.secGrid.innerHTML = Object.keys(SEC).map(k => {
      const s = SEC[k];
      const segs = [1,2,3,4,5].map(i => `<i class="${i <= s.level ? 'on' : ''}"></i>`).join('');
      return `<button type="button" class="wlan__sec-card" data-sec="${k}">
        <span class="wlan__sec-year">${s.year}</span><span class="wlan__sec-name">${s.name}</span>
        ${ICONS[k]}<div class="wlan__segs">${segs}</div></button>`;
    }).join('');
    this.el.secCards = this.el.secGrid.querySelectorAll('.wlan__sec-card');
  }

  bind() {
    this.el.tabs.forEach(b => b.addEventListener('click', () => this.setBand(b.dataset.band)));
    this.el.dist.addEventListener('input', () => this.update());
    this.el.secCards.forEach(c => c.addEventListener('click', () => this.setSecurity(c.dataset.sec)));
    this.el.atkBtn.addEventListener('click', () => this.attack());
  }

  setBand(band) {
    this.band = band;
    const b = BANDS[band], st = this.el.app.style;
    st.setProperty('--band', b.color);
    st.setProperty('--maxs', b.maxs);
    st.setProperty('--pass', b.pass);
    st.setProperty('--dur', b.dur);
    this.el.tabs.forEach(t => t.classList.toggle('on', t.dataset.band === band));
    this.el.info.style.opacity = '0';
    setTimeout(() => {
      this.el.info.innerHTML = `<p>${b.text}</p><div class="wlan__pills">` +
        b.pills.map(p => `<span class="wlan__pill ${p[0]}">${p[1]}</span>`).join('') + '</div>';
      this.el.info.style.opacity = '1';
    }, 140);
    this.update();
  }

  update() {
    const b = BANDS[this.band];
    const x = DEV_X0 + (+this.el.dist.value / 100) * (DEV_X1 - DEV_X0);
    const dist = x - ROUTER_X;
    const behindWall = x > WALL_X + 8;
    const qual = Math.max(0, 1 - dist / b.range - (behindWall ? b.wall : 0));
    const speed = b.max * Math.pow(qual, 1.5);
    const dbm = qual > 0 ? Math.round(-35 - (1 - qual) * 55) : null;
    const bars = qual <= 0 ? 0 : Math.max(1, Math.ceil(qual * 4));

    this.el.dev.setAttribute('transform', `translate(${x.toFixed(1)},160)`);
    this.el.link.setAttribute('x2', (x - 20).toFixed(1));
    this.el.link.style.stroke = qual > 0 ? b.color : 'transparent';
    this.el.link.style.opacity = qual > 0 ? (0.35 + qual * 0.65).toFixed(2) : 0;
    this.el.bars.forEach((r, i) => r.classList.toggle('on', i < bars));

    const meters = Math.round(dist / 10);
    this.el.distOut.textContent = '≈ ' + meters + ' m' + (behindWall ? ' · tras la pared' : '');
    this.el.speed.textContent = qual > 0 ? (speed >= 10 ? Math.round(speed) : speed.toFixed(1)) + ' Mbps' : '0 Mbps';
    this.el.speedBar.style.width = (speed / 867 * 100).toFixed(1) + '%';
    this.el.dbm.textContent = dbm === null ? '—' : dbm + ' dBm';
    this.el.sigBar.style.width = (qual * 100).toFixed(0) + '%';

    let label = 'Sin señal', col = 'var(--sec-wep)';
    if (qual > 0.65) { label = 'Excelente'; col = 'var(--sec-wpa3)'; }
    else if (qual > 0.4) { label = 'Buena'; col = 'var(--sec-wpa3)'; }
    else if (qual > 0.15) { label = 'Débil'; col = 'var(--sec-wpa)'; }
    else if (qual > 0) { label = 'Muy débil'; col = 'var(--sec-wep)'; }
    this.el.state.textContent = label;
    this.el.state.style.color = col;
  }

  setSecurity(key) {
    this.sec = key;
    const s = SEC[key];
    this.el.secCards.forEach(c => c.classList.toggle('active', c.dataset.sec === key));
    this.el.detail.dataset.sec = key;
    this.el.shield.innerHTML = ICONS[key];
    this.el.title.textContent = s.title;
    this.el.desc.innerHTML = s.desc;
    this.resetAttack();
  }

  resetAttack() {
    clearTimeout(this.atkTimer);
    const f = this.el.atkFill;
    f.style.transitionDuration = '0s';
    f.style.width = '0%';
    this.el.atkBtn.disabled = false;
    this.el.atkBtn.textContent = '▶ Simular ataque';
    this.el.atkMsg.innerHTML = 'Pulsa el botón para ver cómo resiste este protocolo a un atacante.';
  }

  attack() {
    this.resetAttack();
    const a = SEC[this.sec].atk, f = this.el.atkFill;
    this.el.atkBtn.disabled = true;
    this.el.atkBtn.textContent = '⏳ Atacando…';
    this.el.atkMsg.textContent = 'Capturando tráfico y probando claves…';
    f.style.background = a.color;
    void f.offsetWidth;
    f.style.transitionDuration = a.ms + 'ms';
    f.style.width = a.pct + '%';
    this.atkTimer = setTimeout(() => {
      this.el.atkMsg.innerHTML = a.msg;
      this.el.atkBtn.disabled = false;
      this.el.atkBtn.textContent = '↺ Repetir';
    }, a.ms + 80);
  }

  destroy() { clearTimeout(this.atkTimer); }
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
