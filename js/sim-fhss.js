/* ==========================================================================
   sim-fhss.js · Simulador de Saltos de Frecuencia (Bluetooth FHSS)
   [Drop & Play Version - CSS incluido, inmune a CSS heredado]
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
  padding: 20px; border-radius: 14px; max-width: 900px; margin: 0 auto;
}
@media (prefers-color-scheme: light) {
  .fhss { --bg:#f5f8fc; --panel:#fff; --panel-2:#eef3f9; --line:#d6e0ec;
          --txt:#152232; --muted:#5b6f86; }
}
.fhss *, .fhss *::before, .fhss *::after { box-sizing: border-box; }
.fhss__head { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; margin-bottom:14px; }
.fhss__head h2 { margin:0; font-size:1.25rem; }
.fhss__head p { margin:2px 0 0; color:var(--muted); font-size:.85rem; }
.fhss__transport { display:flex; gap:8px; flex-wrap:wrap; }
.fhss .btn {
  appearance:none; border:1px solid var(--line); background:var(--panel-2);
  color:var(--txt); padding:8px 14px; border-radius:9px; cursor:pointer;
  font:600 .88rem/1 inherit;
}
.fhss .btn:hover { border-color:var(--accent); }
.fhss .btn--primary { background:var(--accent); border-color:var(--accent); color:#08131f; }
.fhss__stage { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:20px; margin-bottom:14px; position:relative; overflow:hidden; }
.fhss__devices { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; position:relative; }
.fhss__device { text-align:center; z-index:2; }
.fhss__icon { font-size:2.5rem; display:block; margin-bottom:4px; transition:transform .2s; }
.fhss__device.active .fhss__icon { transform:scale(1.15); }
.fhss__label { font-size:.8rem; color:var(--muted); font-weight:600; }
.fhss__link { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:60%; height:4px; background:var(--line); border-radius:2px; z-index:1; overflow:hidden; }
.fhss__link::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:var(--accent); transition:left .3s linear; }
.fhss__link.tx::after { left:0; background:var(--ok); box-shadow:0 0 12px var(--ok); }
.fhss__link.err::after { left0; background:var(--bad); box-shadow:0 0 12px var(--bad); }
.fhss__grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(52px, 1fr)); gap:6px; margin-top:10px; }
.fhss__cell {
  background:var(--panel-2); border:1px solid var(--line); border-radius:6px;
  padding:8px 4px; text-align:center; font-size:.8rem; font-weight:600; color:var(--muted);
  transition:all .2s ease; position:relative;
}
.fhss__cell .freq { display:block; font-size:.65rem; font-weight:400; opacity:.7; margin-top:2px; }
.fhss__cell.active { background:var(--accent); border-color:var(--accent); color:#08131f; transform:scale(1.05); box-shadow:0 0 15px color-mix(in srgb, var(--accent) 40%, transparent); z-index:2; }
.fhss__cell.noise { border-color:var(--bad); color:var(--bad); }
.fhss__cell.active.noise { background:var(--bad); border-color:var(--bad); color:#fff; box-shadow:0 0 15px color-mix(in srgb, var(--bad) 40%, transparent); }
.fhss__cell.active.noise::after { content:'⚠'; position:absolute; top:-6px; right:-6px; background:var(--bg); border-radius:50%; width:16px; height:16px; font-size:10px; line-height:16px; border:1px solid var(--bad); }
.fhss__controls { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:14px; }
.fhss__ctl { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 14px; }
.fhss__ctl label { display:flex; justify-content:space-between; font-size:.84rem; color:var(--muted); margin-bottom:6px; }
.fhss__ctl output { font:600 .82rem/1 monospace; color:var(--txt); }
.fhss input[type=range] { width:100%; accent-color:var(--accent); }
.fhss__stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
.fhss__stat { background:var(--panel-2); border:1px solid var(--line); border-radius:9px; padding:10px; text-align:center; }
.fhss__stat b { display:block; font:700 1.3rem/1 monospace; color:var(--txt); }
.fhss__stat span { font-size:.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.fhss__stat--bad b { color:var(--bad); }
.fhss__stat--ok b { color:var(--ok); }
.fhss__readout { margin-top:14px; padding:12px; background:var(--panel-2); border-radius:8px; font-size:.9rem; color:var(--txt); border-left:3px solid var(--accent); min-height:3.5em; display:flex; align-items:center; }
.fhss__readout[data-tone="bad"] { border-left-color:var(--bad); }
.fhss__readout[data-tone="ok"] { border-left-color:var(--ok); }
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
    this.channels = 32; // 32 canales representativos (Bluetooth clásico usa 79, BLE usa 40)
    this.baseFreq = 2402; // MHz
    this.sequence = this.generateSequence();
    this.hopIndex = -1;
    this.isPlaying = false;
    this.hopRate = 400; // ms por salto
    this.noiseLevel = 2; // Cantidad de canales con interferencia
    this.noiseChannels = new Set();
    this.stats = { hops: 0, success: 0, collisions: 0 };
    this.timer = null;
    this.updateNoise();
  }

  generateSequence() {
    // Secuencia pseudoaleatoria (Fisher-Yates shuffle)
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
    const ch = this.sequence[this.hopIndex];
    const isNoise = this.noiseChannels.has(ch);
    
    this.stats.hops++;
    if (isNoise) {
      this.stats.collisions++;
    } else {
      this.stats.success++;
    }

    // Cambiar el ruido cada 8 saltos para simular interferencia dinámica
    if (this.hopIndex % 8 === 0) this.updateNoise();

    return { ch, isNoise, freq: this.baseFreq + ch, hopNum: this.hopIndex + 1, total: this.channels };
  }
}

const TPL = `
<div class="fhss" id="fhssApp">
  <header class="fhss__head">
    <div>
      <h2>Bluetooth FHSS · Saltos de Frecuencia</h2>
      <p>El emisor y receptor saltan sincronizados a 1600 saltos/segundo para esquivar interferencias.</p>
    </div>
    <div class="fhss__transport">
      <button type="button" class="btn btn--primary" id="fhssPlay">▶ Iniciar</button>
      <button type="button" class="btn" id="fhssReset">↺ Reiniciar</button>
    </div>
  </header>

  <div class="fhss__stage">
    <div class="fhss__devices">
      <div class="fhss__device" id="fhssTx">
        <span class="fhss__icon">📱</span>
        <span class="fhss__label">Máster (Tx)</span>
      </div>
      <div class="fhss__link" id="fhssLink"></div>
      <div class="fhss__device" id="fhssRx">
        <span class="fhss__icon">🎧</span>
        <span class="fhss__label">Slave (Rx)</span>
      </div
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
    <div class="fhss__stat"><b id="statHops">0</b><span>Saltos</span></div>
    <div class="fhss__stat fhss__stat--ok"><b id="statOk">0</b><span>Exitosos</span></div>
    <div class="fhss__stat fhss__stat--bad"><b id="statErr">0</b><span>Colisiones</span></div
  </div>

  <div class="fhss__readout" id="fhssReadout" data-tone="info">
    Pulsa <b>▶ Iniciar</b> para ver cómo el Máster y el Slave saltan sincronizados por el espectro.
  </div>
</div>
`;

class FhssUI {
  constructor(root) {
    this.root = root;
    root.innerHTML = TPL;
    this.sim = new FhssSim();
    
    this.el = {
      play: document.getElementById('fhssPlay', root) || root.querySelector('#fhssPlay'),
      reset: document.getElementById('fhssReset', root) || root.querySelector('#fhssReset'),
      grid: document.getElementById('fhssGrid', root) || root.querySelector('#fhssGrid'),
      readout: document.getElementById('fhssReadout', root) || root.querySelector('#fhssReadout'),
      link: document.getElementById('fhssLink', root) || root.querySelector('#fhssLink'),
      tx: document.getElementById('fhssTx', root) || root.querySelector('#fhssTx'),
      rx: document.getElementById('fhssRx', root) || root.querySelector('#fhssRx'),
      speed: document.getElementById('fhssSpeed', root) || root.querySelector('#fhssSpeed'),
      speedOut: document.getElementById('fhssSpeedOut', root) || root.querySelector('#fhssSpeedOut'),
      noise: document.getElementById('fhssNoise', root) || root.querySelector('#fhssNoise'),
      noiseOut: document.getElementById('fhssNoiseOut', root) || root.querySelector('#fhssNoiseOut'),
      statHops: document.getElementById('statHops', root) || root.querySelector('#statHops'),
      statOk: document.getElementById('statOk', root) || root.querySelector('#statOk'),
      statErr: document.getElementById('statErr', root) || root.querySelector('#statErr')
    };

    // Fallback seguro para querySelector si getElementById falla por scope
    const $ = (id) => document.getElementById(id) || this.root.querySelector('#' + id);
    this.el = {
      play: $('fhssPlay'), reset: $('fhssReset'), grid: $('fhssGrid'),
      readout: $('fhssReadout'), link: $('fhssLink'), tx: $('fhssTx'), rx: $('fhssRx'),
      speed: $('fhssSpeed'), speedOut: $('fhssSpeedOut'), noise: $('fhssNoise'),
      noiseOut: $('fhssNoiseOut'), statHops: $('statHops'), statOk: $('statOk'), statErr: $('statErr')
    };

    this.buildGrid();
    this.bind();
    this.updateReadout('Pulsa <b>▶ Iniciar</b> para ver los saltos de frecuencia.', 'info');
  }

  buildGrid() {
    this.el.grid.innerHTML = '';
    for (let i = 0; i < this.sim.channels; i++) {
      const cell = document.createElement('div');
      cell.className = 'fhss__cell';
      cell.dataset.ch = i;
      cell.innerHTML = `<span>Ch ${i}</span><span class="freq">${this.sim.baseFreq + i} MHz</span>`;
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
    // Limpiar estado anterior
    this.el.grid.querySelectorAll('.fhss__cell').forEach(c => c.classList.remove('active'));
    
    // Activar celda actual
    const cell = this.el.grid.querySelector(`.fhss__cell[data-ch="${data.ch}"]`);
    if (cell) cell.classList.add('active');

    // Animar enlace
    this.el.link.className = 'fhss__link'; // reset
    void this.el.link.offsetWidth; // forzar reflow
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
        `✅ <b>Salto ${data.hopNum}/${data.total}</b> → Canal ${data.ch} (${data.freq} MHz). Medio libre, paquete entregado correctamente al Slave.`,
        'ok'
      );
    }

    this.updateStats();

    // Quitar clase active de dispositivos después de la animación
    setTimeout(() => {
      this.el.tx.classList.remove('active');
      this.el.rx.classList.remove('active');
    }, Math.min(this.sim.hopRate * 0.6, 300));
  }
}

// Sobrescribir el método step del simulador para conectar con la UI
const originalStep = FhssSim.prototype.step;
FhssSim.prototype.step = function(ui) {
  const data = originalStep.call(this);
  if (ui) ui.animateHop(data);
  return data;
};
// Corregimos la referencia en el constructor para que use el UI
// (Mejor enfoque: pasar el callback al start)

function initFhss(target) {
  try {
    ensureStyles();
    const root = target || document.getElementById('fhssRoot') || document.getElementById('fhssGrid')?.parentElement;
    if (!root) return null;
    if (root.__fhssUI) {
      root.__fhssUI.reset();
      return root.__fhssUI;
    }
    
    const ui = new FhssUI(root);
    
    // Parchear el step para que actualice la UI
    const sim = ui.sim;
    const origStep = sim.step.bind(sim);
    sim.step = function() {
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
