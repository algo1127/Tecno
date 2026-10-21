/* ==========================================================================
   sim-fhss.js · Bluetooth FHSS 
   ========================================================================== */
(function (global) {
'use strict';

const CSS_STYLES = `
.fhss {
  --bg: #0f1620; --panel: #16202c; --panel-2: #1d2a38; --line: #2a3a4d;
  --txt: #e6eef7; --muted: #93a6bb; --accent: #4f9dff; --ok: #3ddc97;
  --warn: #ffd23d; --bad: #ff5c5c;
  color: var(--txt); background: var(--bg);
  font: 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 20px; border-radius: 14px; max-width: 1000px; margin: 0 auto;
}
@media (prefers-color-scheme: light) {
  .fhss { --bg:#f5f8fc; --panel:#fff; --panel-2:#eef3f9; --line:#d6e0ec;
          --txt:#152232; --muted:#5b6f86; }
}
.fhss *, .fhss *::before, .fhss *::after { box-sizing: border-box; }

.fhss__head { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; margin-bottom:16px; }
.fhss__head h2 { margin:0; font-size:1.25rem; color:var(--txt); }
.fhss__head p { margin:2px 0 0; color:var(--muted); font-size:.85rem; }
.fhss__transport { display:flex; gap:8px; }

.fhss .btn {
  appearance:none; border:1px solid var(--line); background:var(--panel-2);
  color:var(--txt); padding:8px 14px; border-radius:9px; cursor:pointer;
  font:600 .88rem/1 inherit; transition:all .15s;
}
.fhss .btn:hover { border-color:var(--accent); transform:translateY(-1px); }
.fhss .btn--primary { background:var(--accent); border-color:var(--accent); color:#08131f; }
.fhss .btn--primary:hover { filter:brightness(1.08); }

.fhss__devices { 
  display:grid; grid-template-columns:1fr auto 1fr; gap:40px; 
  align-items:center; margin-bottom:30px; padding:30px 20px;
  background:var(--panel); border:1px solid var(--line); border-radius:12px;
  position:relative; overflow:hidden;
}

.fhss__device { 
  display:flex; flex-direction:column; align-items:center; gap:10px; 
  z-index:2; transition:transform .3s ease;
}
.fhss__device.active { transform:scale(1.08); }
.fhss__device.active .fhss__icon-wrap { 
  box-shadow:0 0 30px color-mix(in srgb, var(--accent) 50%, transparent);
}

.fhss__icon-wrap {
  width:80px; height:80px; border-radius:16px;
  background:var(--panel-2); border:2px solid var(--line);
  display:flex; align-items:center; justify-content:center;
  transition:all .3s ease; position:relative;
}
.fhss__device.active .fhss__icon-wrap { 
  border-color:var(--accent); 
  background:color-mix(in srgb, var(--accent) 15%, var(--panel-2));
}

.fhss__icon-wrap svg { 
  width:48px; height:48px; 
  fill:var(--muted); 
  transition:fill .3s ease; 
}
.fhss__device.active .fhss__icon-wrap svg { 
  fill:var(--accent); 
  filter:drop-shadow(0 0 8px var(--accent));
}

.fhss__label { 
  font-size:.85rem; font-weight:600; color:var(--muted); 
  text-align:center;
}
.fhss__device.active .fhss__label { color:var(--accent); }

.fhss__link {
  position:absolute; top:50%; left:0; right:0; height:4px;
  background:var(--line); transform:translateY(-50%);
  z-index:1; border-radius:2px; overflow:hidden;
}
.fhss__link::after {
  content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
  background:linear-gradient(90deg, var(--ok), var(--accent));
  transition:left .4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:0 0 20px var(--accent);
}
.fhss__link.tx::after { left:0; }
.fhss__link.err::after { 
  left:0; 
  background:linear-gradient(90deg, var(--bad), var(--warn));
  box-shadow:0 0 20px var(--bad);
}

.fhss__spectrum {
  background:var(--panel); border:1px solid var(--line); 
  border-radius:12px; padding:20px; margin-bottom:16px;
}
.fhss__spectrum-title {
  font-size:.8rem; color:var(--muted); text-transform:uppercase;
  letter-spacing:.05em; margin-bottom:12px; display:flex; justify-content:space-between;
}
.fhss__grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(60px, 1fr));
  gap:8px;
}
.fhss__cell {
  background:var(--panel-2); border:2px solid var(--line);
  border-radius:8px; padding:10px 6px; text-align:center;
  transition:all .25s ease; position:relative; cursor:default;
}
.fhss__cell:hover { transform:translateY(-2px); border-color:var(--muted); }
.fhss__cell.active {
  border-color:var(--accent);
  background:color-mix(in srgb, var(--accent) 20%, var(--panel-2));
  transform:scale(1.1);
  box-shadow:0 0 25px color-mix(in srgb, var(--accent) 40%, transparent);
  z-index:2;
}
.fhss__cell.active::before {
  content:''; position:absolute; inset:0; border-radius:8px;
  background:var(--accent); opacity:.1;
  animation:pulse 1s ease-out;
}
@keyframes pulse {
  0% { transform:scale(1); opacity:.3; }
  100% { transform:scale(1.4); opacity:0; }
}
.fhss__cell.noise {
  border-color:var(--bad);
  background:color-mix(in srgb, var(--bad) 10%, var(--panel-2));
}
.fhss__cell.noise::after {
  content:'⚡'; position:absolute; top:2px; right:2px;
  font-size:10px; opacity:.6;
}
.fhss__cell.active.noise {
  border-color:var(--bad);
  background:color-mix(in srgb, var(--bad) 30%, var(--panel-2));
  box-shadow:0 0 25px color-mix(in srgb, var(--bad) 40%, transparent);
}
.fhss__cell-num {
  display:block; font-size:.75rem; font-weight:700;
  color:var(--txt); margin-bottom:2px;
}
.fhss__cell.active .fhss__cell-num { color:#08131f; }
.fhss__cell-freq {
  display:block; font-size:.65rem; color:var(--muted);
}
.fhss__cell.active .fhss__cell-freq { color:#08131f; opacity:.8; }

.fhss__controls {
  display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
  gap:14px; margin-bottom:16px;
}
.fhss__ctl {
  background:var(--panel); border:1px solid var(--line);
  border-radius:10px; padding:14px;
}
.fhss__ctl label {
  display:flex; justify-content:space-between; align-items:center;
  font-size:.84rem; color:var(--muted); margin-bottom:8px; font-weight:600;
}
.fhss__ctl output {
  font:600 .85rem/1 monospace; color:var(--accent);
  background:var(--panel-2); padding:4px 8px; border-radius:4px;
}
.fhss input[type=range] {
  width:100%; accent-color:var(--accent); height:6px;
  background:var(--line); border-radius:3px; outline:none;
}
.fhss input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; width:18px; height:18px;
  background:var(--accent); border-radius:50%; cursor:pointer;
  box-shadow:0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
}

.fhss__stats {
  display:grid; grid-template-columns:repeat(3, 1fr);
  gap:10px; margin-bottom:16px;
}
.fhss__stat {
  background:var(--panel); border:1px solid var(--line);
  border-radius:10px; padding:14px; text-align:center;
  transition:transform .2s;
}
.fhss__stat:hover { transform:translateY(-2px); }
.fhss__stat b {
  display:block; font:700 1.5rem/1 monospace;
  margin-bottom:4px;
}
.fhss__stat span {
  font-size:.7rem; color:var(--muted); text-transform:uppercase;
  letter-spacing:.05em; font-weight:600;
}
.fhss__stat--ok b { color:var(--ok); }
.fhss__stat--bad b { color:var(--bad); }
.fhss__stat--accent b { color:var(--accent); }

.fhss__readout {
  padding:14px 16px; background:var(--panel); border-radius:10px;
  font-size:.9rem; border-left:4px solid var(--accent);
  min-height:3.5em; display:flex; align-items:center;
  transition:all .3s;
}
.fhss__readout[data-tone="bad"] { 
  border-left-color:var(--bad);
  background:color-mix(in srgb, var(--bad) 8%, var(--panel));
}
.fhss__readout[data-tone="ok"] { 
  border-left-color:var(--ok);
  background:color-mix(in srgb, var(--ok) 8%, var(--panel));
}
.fhss__readout b { color:var(--accent); }
.fhss__readout[data-tone="bad"] b { color:var(--bad); }
.fhss__readout[data-tone="ok"] b { color:var(--ok); }
`;

let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected || document.getElementById('fhss-sim-styles')) return;
  const s = document.createElement('style');
  s.id = 'fhss-sim-styles';
  s.textContent = CSS_STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

class FhssSim {
  constructor() {
    this.channels = 32;
    this.baseFreq = 2402;
    this.sequence = this.generateSequence();
    this.hopIndex = -1;
    this.isPlaying = false;
    this.hopRate = 400;
    this.noiseLevel = 2;
    this.noiseChannels = new Set();
    this.stats = { hops: 0, success: 0, collisions: 0 };
    this.timer = null;
    this.updateNoise();
  }

  generateSequence() {
    const seq = Array.from({ length: this.channels }, (_, i) => i);
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }
    return seq;
  }

  updateNoise() {
    this.noiseChannels.clear();
    while (this.noiseChannels.size < this.noiseLevel) {
      this.noiseChannels.add(Math.floor(Math.random() * this.channels));
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step();
    this.timer = setInterval(() => this.step(), this.hopRate);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  reset() {
    this.stop();
    this.hopIndex = -1;
    this.stats = { hops: 0, success: 0, collisions: 0 };
    this.sequence = this.generateSequence();
    this.updateNoise();
  }

  step() {
    this.hopIndex = (this.hopIndex + 1) % this.channels;

    // FIX: re-sortear la interferencia ANTES de evaluar el salto,
    // para que el resultado coincida con lo que se ve en pantalla.
    if (this.hopIndex % 8 === 0) this.updateNoise();

    const ch = this.sequence[this.hopIndex];
    const isNoise = this.noiseChannels.has(ch);

    this.stats.hops++;
    if (isNoise) {
      this.stats.collisions++;
    } else {
      this.stats.success++;
    }

    return { 
      ch, 
      isNoise, 
      freq: this.baseFreq + ch, 
      hopNum: this.hopIndex + 1, 
      total: this.channels 
    };
  }
}

const ICON_MOBILE = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>`;
const ICON_HEADSET = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>`;

const TPL = `
<div class="fhss" id="fhssApp">
  <header class="fhss__head">
    <div>
      <h2>Bluetooth FHSS · Saltos de Frecuencia</h2>
      <p>El máster y slave saltan sincronizados por 32 canales (en Bluetooth real: 1600 saltos/s; aquí ralentizado para poder verlo) para esquivar interferencias.</p>
    </div>
    <div class="fhss__transport">
      <button type="button" class="btn btn--primary" id="fhssPlay">▶ Iniciar</button>
      <button type="button" class="btn" id="fhssReset">↺ Reiniciar</button>
    </div>
  </header>

  <div class="fhss__devices">
    <div class="fhss__device" id="fhssTx">
      <div class="fhss__icon-wrap">${ICON_MOBILE}</div>
      <span class="fhss__label">Máster (Tx)</span>
    </div>
    <div class="fhss__link" id="fhssLink"></div>
    <div class="fhss__device" id="fhssRx">
      <div class="fhss__icon-wrap">${ICON_HEADSET}</div>
      <span class="fhss__label">Slave (Rx)</span>
    </div>
  </div>

  <div class="fhss__spectrum">
    <div class="fhss__spectrum-title">
      <span>Espectro 2.4 GHz</span>
      <span style="color:var(--bad)">⚡ = Interferencia</span>
    </div>
    <div class="fhss__grid" id="fhssGrid"></div>
  </div>

  <div class="fhss__controls">
    <div class="fhss__ctl">
      <label>Velocidad de salto <output id="fhssSpeedOut">400 ms</output></label>
      <input type="range" id="fhssSpeed" min="100" max="1000" step="50" value="400">
    </div>
    <div class="fhss__ctl">
      <label>Nivel de interferencia <output id="fhssNoiseOut">2 canales</output></label>
      <input type="range" id="fhssNoise" min="0" max="8" step="1" value="2">
    </div>
  </div>

  <div class="fhss__stats">
    <div class="fhss__stat fhss__stat--accent">
      <b id="statHops">0</b>
      <span>Saltos</span>
    </div>
    <div class="fhss__stat fhss__stat--ok">
      <b id="statOk">0</b>
      <span>Exitosos</span>
    </div>
    <div class="fhss__stat fhss__stat--bad">
      <b id="statErr">0</b>
      <span>Colisiones</span>
    </div>
  </div>

  <div class="fhss__readout" id="fhssReadout" data-tone="info">
    Pulsa <b>▶ Iniciar</b> para ver los saltos de frecuencia sincronizados.
  </div>
</div>
`;

class FhssUI {
  constructor(root) {
    this.root = root;
    root.innerHTML = TPL;
    this.sim = new FhssSim();
    
    this.el = {
      play: root.querySelector('#fhssPlay'),
      reset: root.querySelector('#fhssReset'),
      grid: root.querySelector('#fhssGrid'),
      readout: root.querySelector('#fhssReadout'),
      link: root.querySelector('#fhssLink'),
      tx: root.querySelector('#fhssTx'),
      rx: root.querySelector('#fhssRx'),
      speed: root.querySelector('#fhssSpeed'),
      speedOut: root.querySelector('#fhssSpeedOut'),
      noise: root.querySelector('#fhssNoise'),
      noiseOut: root.querySelector('#fhssNoiseOut'),
      statHops: root.querySelector('#statHops'),
      statOk: root.querySelector('#statOk'),
      statErr: root.querySelector('#statErr')
    };

    this.buildGrid();
    this.bind();
  }

  buildGrid() {
    this.el.grid.innerHTML = '';
    for (let i = 0; i < this.sim.channels; i++) {
      const cell = document.createElement('div');
      cell.className = 'fhss__cell';
      cell.dataset.ch = i;
      cell.innerHTML = `
        <span class="fhss__cell-num">Ch ${i}</span>
        <span class="fhss__cell-freq">${this.sim.baseFreq + i} MHz</span>
      `;
      this.el.grid.appendChild(cell);
    }
    this.renderNoise();
  }

  renderNoise() {
    this.el.grid.querySelectorAll('.fhss__cell').forEach(cell => {
      const ch = parseInt(cell.dataset.ch, 10);
      cell.classList.toggle('noise', this.sim.noiseChannels.has(ch));
    });
  }

  bind() {
    this.el.play.addEventListener('click', () => this.toggle());
    this.el.reset.addEventListener('click', () => this.reset());
    
    this.el.speed.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.el.speedOut.textContent = val + ' ms';
      this.sim.hopRate = val;
      if (this.sim.isPlaying) {
        this.sim.stop();
        this.sim.start();
      }
    });

    this.el.noise.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.el.noiseOut.textContent = val + (val === 1 ? ' canal' : ' canales');
      this.sim.noiseLevel = val;
      this.sim.updateNoise();
      this.renderNoise();
    });
  }

  toggle() {
    if (this.sim.isPlaying) {
      this.sim.stop();
      this.el.play.textContent = '▶ Reanudar';
      this.el.link.className = 'fhss__link';
      this.el.tx.classList.remove('active');
      this.el.rx.classList.remove('active');
    } else {
      this.sim.start();
      this.el.play.textContent = '⏸ Pausar';
    }
  }

  reset() {
    this.sim.reset();
    this.el.play.textContent = '▶ Iniciar';
    this.el.link.className = 'fhss__link';
    this.el.tx.classList.remove('active');
    this.el.rx.classList.remove('active');
    this.renderNoise();
    this.el.grid.querySelectorAll('.fhss__cell').forEach(c => c.classList.remove('active'));
    this.updateStats();
    this.updateReadout('Simulación reiniciada. Lista para saltar.', 'info');
  }

  updateStats() {
    this.el.statHops.textContent = this.sim.stats.hops;
    this.el.statOk.textContent = this.sim.stats.success;
    this.el.statErr.textContent = this.sim.stats.collisions;
  }

  updateReadout(html, tone) {
    this.el.readout.innerHTML = html;
    this.el.readout.dataset.tone = tone;
  }

  animateHop(data) {
    // FIX: repintar la interferencia en cada salto (puede haber cambiado)
    this.renderNoise();

    this.el.grid.querySelectorAll('.fhss__cell').forEach(c => c.classList.remove('active'));
    
    const cell = this.el.grid.querySelector(`.fhss__cell[data-ch="${data.ch}"]`);
    if (cell) cell.classList.add('active');

    this.el.link.className = 'fhss__link';
    void this.el.link.offsetWidth;
    this.el.tx.classList.add('active');
    this.el.rx.classList.add('active');

    if (data.isNoise) {
      this.el.link.classList.add('err');
      this.updateReadout(
        `💥 <b>Salto ${data.hopNum}/${data.total}</b> → Canal ${data.ch} (${data.freq} MHz). <span style="color:var(--bad)">¡Interferencia detectada!</span> El paquete se corrompe, pero el siguiente salto lo solucionará.`,
        'bad'
      );
    } else {
      this.el.link.classList.add('tx');
      this.updateReadout(
        `✅ <b>Salto ${data.hopNum}/${data.total}</b> → Canal ${data.ch} (${data.freq} MHz). Medio libre, paquete entregado correctamente.`,
        'ok'
      );
    }

    this.updateStats();

    setTimeout(() => {
      this.el.tx.classList.remove('active');
      this.el.rx.classList.remove('active');
    }, Math.min(this.sim.hopRate * 0.6, 300));
  }
}

function initFhss(target) {
  try {
    ensureStyles();
    const root = target || document.getElementById('fhssRoot') || document.getElementById('fhssGrid')?.parentElement?.parentElement;
    if (!root) return null;
    if (root.__fhssUI) {
      root.__fhssUI.reset();
      return root.__fhssUI;
    }
    
    const ui = new FhssUI(root);
    const sim = ui.sim;
    const origStep = sim.step.bind(sim);
    sim.step = function() {
      // Si el router ya quitó esta página del DOM, paramos el temporizador
      if (!root.isConnected) { sim.stop(); return null; }
      const data = origStep();
      ui.animateHop(data);
      return data;
    };
    
    root.__fhssUI = ui;
    return ui;
  } catch (err) {
    console.error('[FHSS] ERROR:', err);
    return null;
  }
}

function tryAutoInit() {
  if (window.__fhssInitDone) return;
  if (!document.body) return;
  if (document.getElementById('fhssRoot') || document.getElementById('fhssGrid')) {
    window.__fhssInitDone = true;
    initFhss();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryAutoInit);
} else {
  tryAutoInit();
}

window.addEventListener('load', tryAutoInit);
window.initFhss = initFhss;
})(window);
