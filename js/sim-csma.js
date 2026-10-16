/* ==========================================================================
   sim-csma.js · Simulador interactivo de CSMA/CD (IEEE 802.3)
   [Drop & Play Version - CSS incluido]
   ========================================================================== */
(function (global) {
'use strict';

const CSS_STYLES = `
.csma {
  --bg: #0f1620; --panel: #16202c; --panel-2: #1d2a38; --line: #2a3a4d;
  --txt: #e6eef7; --muted: #93a6bb; --accent: #4f9dff; --ok: #3ddc97;
  --warn: #ffd23d; --bad: #ff5c5c;
  color: var(--txt); background: var(--bg);
  font: 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 20px; border-radius: 14px; max-width: 1180px; margin: 0 auto;
}
@media (prefers-color-scheme: light) {
  .csma { --bg:#f5f8fc; --panel:#fff; --panel-2:#eef3f9; --line:#d6e0ec;
          --txt:#152232; --muted:#5b6f86; }
}
.csma *, .csma *::before, .csma *::after { box-sizing: border-box; }

.csma__head { display:flex; flex-wrap:wrap; gap:12px; align-items:center;
              justify-content:space-between; margin-bottom:14px; }
.csma__head h2 { margin:0; font-size:1.25rem; letter-spacing:.2px; }
.csma__head p  { margin:2px 0 0; color:var(--muted); font-size:.85rem; }

.csma__transport { display:flex; gap:8px; flex-wrap:wrap; }

.btn {
  appearance:none; border:1px solid var(--line); background:var(--panel-2);
  color:var(--txt); padding:8px 14px; border-radius:9px; cursor:pointer;
  font:600 .88rem/1 inherit; transition:background .15s, border-color .15s, transform .08s;
}
.btn:hover { border-color:var(--accent); }
.btn:active { transform:translateY(1px); }
.btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.btn--primary { background:var(--accent); border-color:var(--accent); color:#08131f; }
.btn--primary:hover { filter:brightness(1.08); }
.btn[disabled] { opacity:.45; cursor:not-allowed; }

.chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
.chip {
  border:1px solid var(--line); background:transparent; color:var(--muted);
  padding:6px 13px; border-radius:999px; cursor:pointer; font:600 .82rem/1 inherit;
}
.chip:hover { color:var(--txt); border-color:var(--accent); }
.chip.is-active { background:var(--accent); border-color:var(--accent); color:#08131f; }
.chip:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

.csma__stage { position:relative; background:var(--panel); border:1px solid var(--line);
               border-radius:12px; overflow:hidden; }
.csma__canvas { display:block; width:100%; height:auto; touch-action:none; }

.csma__caption {
  margin:0; padding:12px 16px; border-top:1px solid var(--line);
  background:var(--panel-2); font-size:.93rem; min-height:3.2em;
}
.csma__caption b { color:var(--accent); }
.csma__caption[data-tone="ok"]   b { color:var(--ok); }
.csma__caption[data-tone="warn"] b { color:var(--warn); }
.csma__caption[data-tone="bad"]  b { color:var(--bad); }

.csma__clock { position:absolute; top:10px; right:12px; font:600 .74rem/1 ui-monospace,
               SFMono-Regular, Menlo, monospace; color:var(--muted);
               background:color-mix(in srgb, var(--panel) 75%, transparent);
               padding:5px 9px; border-radius:7px; border:1px solid var(--line); }

.grid { display:grid; gap:14px; margin-top:14px;
        grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); }
.panel { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:14px 16px; }
.panel h3 { margin:0 0 10px; font-size:.78rem; text-transform:uppercase;
            letter-spacing:.09em; color:var(--muted); }

.ctl { margin-bottom:11px; }
.ctl:last-child { margin-bottom:0; }
.ctl__row { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.ctl label { font-size:.84rem; color:var(--muted); }
.ctl output { font:600 .82rem/1 ui-monospace, Menlo, monospace; color:var(--txt); }
input[type=range] { width:100%; accent-color:var(--accent); margin-top:5px; }
input[type=range]:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }

.seg { display:flex; gap:5px; margin-top:5px; }
.seg button { flex:1; border:1px solid var(--line); background:var(--panel-2); color:var(--muted);
              padding:5px 4px; border-radius:7px; cursor:pointer; font:600 .78rem/1 inherit; }
.seg button[aria-pressed=true] { background:var(--accent); border-color:var(--accent); color:#08131f; }
.seg button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

.switch { display:flex; align-items:center; gap:8px; font-size:.84rem; color:var(--muted); margin-top:9px; }
.switch input { accent-color:var(--accent); width:16px; height:16px; }

.facts { list-style:none; margin:0; padding:0; font-size:.82rem; }
.facts li { display:flex; justify-content:space-between; gap:10px; padding:4px 0;
            border-bottom:1px dashed var(--line); }
.facts li:last-child { border-bottom:0; }
.facts span:first-child { color:var(--muted); }
.facts span:last-child { font-family:ui-monospace, Menlo, monospace; font-weight:600; }

.health { margin-top:10px; display:grid; gap:6px; }
.health div { font-size:.8rem; padding:6px 9px; border-radius:7px;
              background:var(--panel-2); border-left:3px solid var(--ok); }
.health div[data-bad] { border-left-color:var(--bad); background:color-mix(in srgb, var(--bad) 12%, var(--panel-2)); }

.stations { display:grid; gap:8px; }
.stcard { display:grid; grid-template-columns:auto 1fr auto; gap:9px; align-items:center;
          background:var(--panel-2); border:1px solid var(--line); border-radius:9px; padding:8px 10px; }
.stcard__led { width:11px; height:11px; border-radius:50%; background:#3a4a5c; box-shadow:0 0 0 3px transparent; }
.stcard__name { font-weight:700; font-size:.85rem; }
.stcard__state { font-size:.74rem; color:var(--muted); }
.stcard__att { font:600 .72rem/1 ui-monospace, Menlo, monospace; color:var(--muted); }
.stcard__bar { grid-column:1/-1; height:5px; border-radius:3px; background:var(--line); overflow:hidden; }
.stcard__bar i { display:block; height:100%; width:0%; background:var(--warn); transition:width .1s linear; }
.stcard[data-state="tx"]      .stcard__led { background:var(--accent); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent); }
.stcard[data-state="jam"]     .stcard__led { background:var(--bad); box-shadow:0 0 0 3px color-mix(in srgb,var(--bad) 25%,transparent); }
.stcard[data-state="backoff"] .stcard__led { background:var(--warn); }
.stcard[data-state="defer"]   .stcard__led { background:#8b7bff; }
.stcard[data-flash="ok"]      .stcard__led { background:var(--ok); box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 30%,transparent); }

.metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(96px,1fr)); gap:9px; }
.metric { background:var(--panel-2); border:1px solid var(--line); border-radius:9px; padding:8px 10px; }
.metric b { display:block; font:700 1.15rem/1.1 ui-monospace, Menlo, monospace; }
.metric span { font-size:.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }
.metric--bad b { color:var(--bad); } .metric--ok b { color:var(--ok); } .metric--warn b { color:var(--warn); }

.log { list-style:none; margin:0; padding:0; max-height:190px; overflow:auto;
       font:12.5px/1.5 ui-monospace, Menlo, monospace; }
.log li { padding:3px 0; border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent); color:var(--muted); }
.log li b { color:var(--txt); font-weight:600; }
.log li[data-tone="bad"]  { color:var(--bad); }
.log li[data-tone="ok"]   { color:var(--ok); }
.log li[data-tone="warn"] { color:var(--warn); }

.csma__foot { margin-top:12px; font-size:.76rem; color:var(--muted); }
.csma__foot kbd { background:var(--panel-2); border:1px solid var(--line); border-bottom-width:2px;
                  border-radius:4px; padding:1px 5px; font-size:.72rem; }

@media (prefers-reduced-motion: reduce) {
  .csma * { transition-duration:.01ms !important; animation-duration:.01ms !important; }
}
`;

let stylesInjected = false;
function ensureStyles() {
    if (stylesInjected || document.getElementById('csma-sim-styles')) return;
    const style = document.createElement('style');
    style.id = 'csma-sim-styles';
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);
    stylesInjected = true;
}

/* ── 0 · Constantes del estándar y utilidades ────────────────────────────── */
const C_PROP    = 2.0e8;  // m/s en UTP (~0.67 c)
const SLOT_BITS = 512;
const JAM_BITS  = 48;
const IFG_BITS  = 96;
const MAX_TRY   = 16;
const MAX_N     = 10;

const PALETTE = ['#4f9dff','#ff9440','#3ddc97','#e879f9',
                 '#ffd23d','#38d9f5','#a3e635','#fb7185'];

const DEFAULTS = Object.freeze({
  stations: 2, cableLen: 1000, rateMbps: 10, frameBytes: 64,
  load: 0.30, speed: 30, scenario: 'collision', spacetime: true
});

const $  = (id, r) => (r || document).getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const fmt = (n, d) => Number(n).toFixed(d === undefined ? 1 : d);

function fmtUs(us) {
  if (!isFinite(us)) return '—';
  if (us >= 1000) return fmt(us / 1000, 2) + ' ms';
  if (us >= 1)    return fmt(us, 2) + ' µs';
  return fmt(us * 1000, 0) + ' ns';
}

/* ── 1 · Cola de prioridad (heap binario) ────────────────────────────────── */
class PQ {
  constructor() { this.a = []; this.n = 0; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  clear() { this.a.length = 0; this.n = 0; }
  _less(x, y) { return x.t < y.t || (x.t === y.t && x.k < y.k); }
  push(t, type, d) {
    const a = this.a, it = { t: t, k: this.n++, type: type, d: d };
    a.push(it);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (!this._less(a[i], a[p])) break;
      const tmp = a[i]; a[i] = a[p]; a[p] = tmp; i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return null;
    const top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this._less(a[l], a[m])) m = l;
        if (r < a.length && this._less(a[r], a[m])) m = r;
        if (m === i) break;
        const tmp = a[i]; a[i] = a[m]; a[m] = tmp; i = m;
      }
    }
    return top;
  }
}

/* ── 2 · Núcleo de la simulación ─────────────────────────────────────────── */
class CsmaSim {
  constructor(cfg) {
    this.cfg = Object.assign({}, DEFAULTS, cfg || {});
    this.listeners = [];
    this.reset();
  }
  on(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(f => f !== fn); }; }
  fire(type, data) { for (let i = 0; i < this.listeners.length; i++) this.listeners[i](type, data || {}); }

  /* -- derivación de tiempos a partir de la configuración ------------------ */
  recompute() {
    const c = this.cfg;
    this.bitUs    = 1e6 / (c.rateMbps * 1e6);
    this.slotUs   = SLOT_BITS * this.bitUs;
    this.jamUs    = JAM_BITS  * this.bitUs;
    this.ifgUs    = IFG_BITS  * this.bitUs;
    this.frameUs  = c.frameBytes * 8 * this.bitUs;
    this.propUs   = c.cableLen / C_PROP * 1e6;
    this.rttUs    = 2 * this.propUs;
    this.vUs      = C_PROP / 1e6;
    this.sparkUs  = Math.max(2.2 * this.slotUs, 14);
    this.keepUs   = Math.max(6 * this.rttUs, 8 * this.frameUs, 12 * this.slotUs, 150);
    this.windowUs = clamp(6 * this.propUs + 3 * this.frameUs + 2 * this.slotUs + this.jamUs, 50, 20000);
    this.checks = {
      shortFrame: c.frameBytes < 64,
      bigNet:     this.rttUs > this.slotUs,
      lateRisk:   this.frameUs < this.rttUs
    };
  }

  setConfig(patch, opts) {
    const soft = opts && opts.soft;
    Object.assign(this.cfg, patch);
    this.recompute();
    if (!soft) this.reset();
  }

  reset() {
    this.recompute();
    this.t = 0; this.pq = new PQ(); this.records = []; this.sparks = [];
    this.recSeq = 0; this.frameSeq = 0;
    this.stats = { ok: 0, collisions: 0, late: 0, attempts: 0, dropped: 0, tx: 0, goodBits: 0 };
    this.stations = [];
    const n = this.cfg.stations, L = this.cfg.cableLen;
    for (let i = 0; i < n; i++) {
      const pos = n === 1 ? L / 2 : L * 0.02 + (L * 0.96) * i / (n - 1);
      this.stations.push({
        id: i, name: String.fromCharCode(65 + i), pos: pos,
        color: PALETTE[i % PALETTE.length],
        state: 'idle', frame: null, tx: null, queue: [], attempts: 0,
        collided: false, busyUntil: 0, backoff: null, flash: null,
        stats: { ok: 0, collisions: 0, dropped: 0, late: 0 }
      });
    }
    if (this.cfg.scenario === 'free') this.armTraffic();
    this.fire('reset', {});
  }

  /* -- tráfico aleatorio (Poisson) ---------------------------------------- */
  armTraffic() {
    const lam = this.lambda();
    for (const st of this.stations) {
      const t = -Math.log(1 - Math.random()) / lam;
      this.pq.push(t, 'gen', { st: st });
    }
  }
  lambda() {
    const n = Math.max(1, this.stations.length);
    return Math.max(1e-12, this.cfg.load / (n * Math.max(1e-9, this.frameUs)));
  }

  /* -- API de alto nivel --------------------------------------------------- */
  inject(st, dst, atTime) {
    const t = atTime === undefined ? this.t : atTime;
    this.pq.push(t, 'inject', { st: st, dst: dst });
  }
  advanceTo(T) {
    let guard = 0;
    while (this.pq.size) {
      const top = this.pq.peek();
      if (top.t > T + 1e-12) break;
      if (++guard > 400000) { this.pq.clear(); break; }
      this.pq.pop(); this.t = top.t; this.dispatch(top);
    }
    if (T > this.t) this.t = T;
    this.prune();
  }
  stepNotable() {
    const NOTABLE = { tx:1, collision:1, backoff:1, deliver:1, late:1, drop:1, txend:1, frame:1 };
    let hit = false;
    const probe = ty => { if (NOTABLE[ty]) hit = true; };
    this.listeners.push(probe);
    let guard = 0;
    while (!hit && guard++ < 4000 && this.pq.size) {
      const ev = this.pq.pop(); this.t = ev.t; this.dispatch(ev);
    }
    this.listeners.pop();
    if (!this.pq.size) this.t += this.slotUs;
    this.prune();
    return hit;
  }

  dispatch(ev) {
    switch (ev.type) {
      case 'arrive':  this.onArrive(ev.d);  break;
      case 'txend':   this.onTxEnd(ev.d);   break;
      case 'deliver': this.onDeliver(ev.d); break;
      case 'try':     this.onTry(ev.d);     break;
      case 'gen':     this.onGenerate(ev.d);break;
      case 'inject':  this.onInject(ev.d);  break;
    }
  }

  /* -- máquina de estados de estación ------------------------------------- */
  onInject(d) {
    const st = d.st;
    st.frame = { id: ++this.frameSeq, bytes: this.cfg.frameBytes, dst: d.dst, born: this.t };
    st.attempts = 0;
    this.fire('inject', { st: st, dst: d.dst });
    this.tryTransmit(st);
  }

  onGenerate(d) {
    const st = d.st;
    if (this.cfg.scenario === 'free') {
      if (st.queue.length < 8) {
        const others = this.stations.filter(o => o !== st);
        const dst = others.length ? others[(Math.random() * others.length) | 0] : null;
        st.queue.push({ id: ++this.frameSeq, bytes: this.cfg.frameBytes, dst: dst, born: this.t });
        this.fire('frame', { st: st });
      } else { this.stats.dropped++; st.stats.dropped++; }
      if (!st.frame && st.state === 'idle') this.tryTransmit(st);
    }
    const nxt = this.t + (-Math.log(1 - Math.random()) / this.lambda());
    this.pq.push(nxt, 'gen', { st: st });
  }

  onTry(d) {
    const st = d.st;
    if (st.backoff && this.t >= st.backoff.end - 1e-9) st.backoff = null;
    this.tryTransmit(st);
  }

  pullNext(st) {
    if (st.frame || !st.queue.length) return;
    st.frame = st.queue.shift();
    st.attempts = 0;
  }

  tryTransmit(st) {
    this.pullNext(st);
    if (!st.frame) { if (st.state !== 'backoff') st.state = 'idle'; return; }
    const earliest = Math.max(this.t, st.busyUntil + this.ifgUs);
    if (earliest > this.t + 1e-9) {
      st.state = 'defer';
      this.pq.push(earliest, 'try', { st: st });
      return;
    }
    st.collided = false;
    this.emit(st, 'data', st.frame);
  }

  /* -- emisión de una señal (datos o jam) --------------------------------- */
  emit(st, kind, frame) {
    const rec = {
      id: ++this.recSeq, kind: kind, src: st,
      dst: frame ? frame.dst : null, frame: frame || null,
      bytes: frame ? frame.bytes : 0,
      x: st.pos, t0: this.t,
      dur: kind === 'jam' ? this.jamUs : this.frameUs,
      aborted: false, believedOk: false
    };
    this.records.push(rec);
    st.tx = rec;
    st.state = kind === 'jam' ? 'jam' : 'tx';
    st.busyUntil = Math.max(st.busyUntil, this.t + rec.dur);

    for (const o of this.stations) {
      if (o === st) continue;
      const dt = Math.abs(st.pos - o.pos) / this.vUs;
      this.pq.push(this.t + dt, 'arrive', { rec: rec, st: o });
      if (kind === 'data' && rec.dst === o) {
        this.pq.push(this.t + rec.dur + dt, 'deliver', { rec: rec, st: o });
      }
    }
    this.pq.push(this.t + rec.dur, 'txend', { rec: rec });
    this.fire('tx', { st: st, rec: rec });
    return rec;
  }

  onArrive(d) {
    const rec = d.rec, st = d.st;
    st.busyUntil = Math.max(st.busyUntil, this.t + rec.dur);
    if (rec.src !== st && st.state === 'tx' && !st.collided) this.detectCollision(st, rec);
  }

  /* -- punto donde se cruzan los dos frentes ------------------------------ */
  meetPoint(xs, t0s, xo, t0o) {
    const L = this.cfg.cableLen, v = this.vUs;
    if (Math.abs(xo - xs) < 1e-9) return xs;
    const s = xo > xs ? 1 : -1;
    const tm = (Math.abs(xo - xs) / v) / 2 + (t0s + t0o) / 2;
    return clamp(xs + s * v * (tm - t0s), 0, L);
  }

  detectCollision(st, otherRec) {
    if (st.collided) return;
    st.collided = true;
    const rec = st.tx;
    let x = st.pos;
    if (rec && rec.kind === 'data') {
      x = this.meetPoint(st.pos, rec.t0, otherRec.x, otherRec.t0);
      rec.aborted = true;
      rec.dur = Math.max(1e-6, this.t - rec.t0);
      if (rec.frame) st.frame = rec.frame;
      st.tx = null;
    }
    this.stats.collisions++; st.stats.collisions++;
    st.flash = { type: 'col', t: this.t };
    this.sparks.push({ x: x, t: this.t });
    this.fire('collision', { st: st, other: otherRec.src, x: x, t: this.t });
    this.emit(st, 'jam', null);
  }

  onTxEnd(d) {
    const rec = d.rec;
    if (rec.dead) return;
    if (Math.abs(this.t - (rec.t0 + rec.dur)) > 1e-9) return;
    const st = rec.src;
    if (rec.kind === 'jam') { st.state = 'idle'; this.startBackoff(st); return; }
    if (rec.aborted) return;
    st.tx = null; st.state = 'idle';
    st.busyUntil = Math.max(st.busyUntil, rec.t0 + rec.dur);
    rec.believedOk = true;
    this.stats.tx++;
    st.frame = null;
    this.fire('txend', { st: st, rec: rec });
    this.pullNext(st);
    this.pq.push(this.t + this.ifgUs, 'try', { st: st });
  }

  /* -- ¿se solapa otra señal con ésta en la posición del receptor? --------- */
  isCorruptAt(rec, x) {
    const v = this.vUs;
    const d  = Math.abs(rec.x - x) / v;
    const a0 = rec.t0 + d, a1 = rec.t0 + rec.dur + d;
    for (let i = 0; i < this.records.length; i++) {
      const r2 = this.records[i];
      if (r2 === rec) continue;
      if (r2.t0 > a1) break;
      const d2 = Math.abs(r2.x - x) / v;
      const b0 = r2.t0 + d2, b1 = r2.t0 + r2.dur + d2;
      if (b0 < a1 - 1e-12 && a0 < b1 - 1e-12) return true;
    }
    return false;
  }

  onDeliver(d) {
    const rec = d.rec, st = d.st;
    if (rec.dead || rec.aborted) return;
    if (this.isCorruptAt(rec, st.pos)) {
      this.stats.late++; st.stats.late++;
      rec.src.flash = { type: 'err', t: this.t };
      st.flash      = { type: 'err', t: this.t };
      this.sparks.push({ x: st.pos, t: this.t });
      this.fire('late', { rec: rec, st: st });
    } else {
      this.stats.ok++; rec.src.stats.ok++;
      this.stats.goodBits += rec.bytes * 8;
      rec.src.flash = { type: 'ok', t: this.t };
      st.flash      = { type: 'ok', t: this.t };
      this.fire('deliver', { rec: rec, st: st });
    }
  }

  /* -- backoff exponencial binario truncado -------------------------------- */
  startBackoff(st) {
    st.attempts++; this.stats.attempts++;
    st.tx = null;
    if (st.attempts > MAX_TRY) {
      this.stats.dropped++; st.stats.dropped++;
      this.fire('drop', { st: st, frame: st.frame });
      st.frame = null; st.attempts = 0; st.backoff = null; st.state = 'idle';
      this.pullNext(st);
      this.pq.push(this.t + this.ifgUs, 'try', { st: st });
      return;
    }
    const n = Math.min(st.attempts, MAX_N);
    const k = Math.floor(Math.random() * Math.pow(2, n));
    st.backoff = { n: n, k: k, start: this.t, end: this.t + k * this.slotUs };
    st.state = 'backoff';
    this.fire('backoff', { st: st, n: n, k: k });
    this.pq.push(Math.max(st.backoff.end, this.t), 'try', { st: st });
  }

  prune() {
    const cut = this.t - this.keepUs;
    let i = 0;
    while (i < this.records.length &&
           this.records[i].t0 + this.records[i].dur + this.propUs < cut) i++;
    if (i) this.records.splice(0, i);
    if (this.sparks.length) {
      this.sparks = this.sparks.filter(s => this.t - s.t < this.sparkUs);
    }
    for (const st of this.stations) {
      if (st.flash && this.t - st.flash.t > 2.5 * this.slotUs) st.flash = null;
    }
  }
}

/* ── 3 · Geometría de la señal (para el render) ──────────────────────────── */
function signalRegions(rec, t, v, L) {
  const a = t - rec.t0;
  if (a <= 0) return null;
  const b = a - rec.dur;
  const out = [];
  const hl = Math.max(0, rec.x - v * a);
  const tl = b <= 0 ? rec.x : Math.max(0, rec.x - v * b);
  if (tl > hl + 1e-9) out.push([hl, tl]);
  const hh = Math.min(L, rec.x + v * a);
  const th = b <= 0 ? rec.x : Math.min(L, rec.x + v * b);
  if (hh > th + 1e-9) out.push([th, hh]);
  return out.length ? out : null;
}

function stPolygon(rec, side, v, L, now) {
  const bound = side < 0 ? 0 : L;
  const dist  = Math.abs(bound - rec.x) / v;
  const tTail0 = rec.t0 + rec.dur;
  if (rec.t0 > now) return null;
  const pts = [[rec.x, rec.t0]];
  const tH = Math.min(rec.t0 + dist, now);
  pts.push([rec.x + side * v * (tH - rec.t0), tH]);
  if (tTail0 <= now) {
    const tT = Math.min(tTail0 + dist, now);
    pts.push([rec.x + side * v * (tT - tTail0), tT]);
    pts.push([rec.x, tTail0]);
  } else {
    pts.push([rec.x, now]);
  }
  return pts;
}

/* ── 4 · Escenarios ──────────────────────────────────────────────────────── */
const SCENARIOS = {
  collision: {
    label: 'Colisión + backoff',
    cfg: { stations: 2, cableLen: 1000, rateMbps: 10, frameBytes: 64, load: 0 },
    setup(sim) {
      const A = sim.stations[0], B = sim.stations[1];
      const t0 = 25;
      sim.inject(A, B, t0);
      sim.inject(B, A, t0);
    }
  },
  late: {
    label: 'Colisión tardía',
    cfg: { stations: 2, cableLen: 2500, rateMbps: 10, frameBytes: 20, load: 0 },
    setup(sim) {
      const A = sim.stations[0], B = sim.stations[1];
      const t0 = 25;
      sim.inject(A, B, t0);
      sim.inject(B, A, t0 + sim.propUs * 0.9);
    }
  },
  free: {
    label: 'Tráfico libre',
    cfg: { stations: 4, cableLen: 1000, rateMbps: 10, frameBytes: 256, load: 0.55 },
    setup() {}
  }
};

/* ── 5 · Plantilla DOM ───────────────────────────────────────────────────── */
const TPL = `
<div class="csma" id="csmaApp">
  <header class="csma__head">
    <div>
      <h2>CSMA/CD · Ethernet 802.3</h2>
      <p>Simulador de eventos discretos con propagación real, jam y backoff exponencial binario.</p>
    </div>
    <div class="csma__transport">
      <button type="button" class="btn btn--primary" id="csmaPlay">▶ Simular</button>
      <button type="button" class="btn" id="csmaStep">⏭ Paso</button>
      <button type="button" class="btn" id="csmaReset">↺ Reiniciar</button>
    </div>
  </header>

  <div class="chips" id="csmaScenarios" role="group" aria-label="Escenarios"></div>

  <div class="csma__stage">
    <canvas class="csma__canvas" id="csmaCanvas" role="img"
            aria-label="Vista del cable con las estaciones, las señales en propagación y el diagrama espacio-tiempo"></canvas>
    <div class="csma__clock" id="csmaClock">t = 0.00 µs</div>
    <p class="csma__caption" id="csmaCaption" role="status" aria-live="polite"></p>
  </div>

  <div class="grid">
    <section class="panel" aria-labelledby="hParams">
      <h3 id="hParams">Parámetros de la red</h3>
      <div class="ctl">
        <div class="ctl__row"><label for="cStations">Estaciones</label><output id="oStations">2</output></div>
        <input type="range" id="cStations" min="2" max="8" step="1" value="2">
      </div>
      <div class="ctl">
        <div class="ctl__row"><label for="cLen">Longitud del cable</label><output id="oLen">1000 m</output></div>
        <input type="range" id="cLen" min="10" max="6000" step="10" value="1000">
      </div>
      <div class="ctl">
        <div class="ctl__row"><label>Tasa del medio</label><output id="oRate">10 Mb/s</output></div>
        <div class="seg" id="segRate" role="group" aria-label="Tasa">
          <button type="button" data-rate="10" aria-pressed="true">10 Mb/s</button>
          <button type="button" data-rate="100" aria-pressed="false">100 Mb/s</button>
        </div>
      </div>
      <div class="ctl">
        <div class="ctl__row"><label for="cFrame">Tamaño de trama</label><output id="oFrame">64 B</output></div>
        <input type="range" id="cFrame" min="20" max="1518" step="1" value="64">
      </div>
      <div class="ctl">
        <div class="ctl__row"><label for="cLoad">Carga ofrecida</label><output id="oLoad">0.30 Erlang</output></div>
        <input type="range" id="cLoad" min="0" max="150" step="1" value="30">
      </div>
      <div class="ctl">
        <div class="ctl__row"><label for="cSpeed">Velocidad de animación</label><output id="oSpeed">30 µs/s</output></div>
        <input type="range" id="cSpeed" min="0" max="100" step="1" value="34">
      </div>
      <label class="switch"><input type="checkbox" id="cSt" checked> Diagrama espacio-tiempo</label>
      <label class="switch"><input type="checkbox" id="cFx" checked> Efectos (glow / pulso)</label>
    </section>

    <section class="panel" aria-labelledby="hStations">
      <h3 id="hStations">Estaciones</h3>
      <div class="stations" id="csmaStations"></div>
    </section>

    <section class="panel" aria-labelledby="hMetrics">
      <h3 id="hMetrics">Métricas</h3>
      <div class="metrics" id="csmaMetrics"></div>
      <h3 style="margin-top:16px">Tiempos derivados</h3>
      <ul class="facts" id="csmaFacts"></ul>
      <div class="health" id="csmaHealth"></div>
    </section>
  </div>

  <section class="panel" style="margin-top:14px" aria-labelledby="hLog">
    <h3 id="hLog">Registro de eventos</h3>
    <ol class="log" id="csmaLog" aria-live="off"></ol>
  </section>

  <p class="csma__foot">
    Atajos: <kbd>Espacio</kbd> play/pausa · <kbd>P</kbd> paso · <kbd>R</kbd> reinicio ·
    <kbd>←</kbd>/<kbd>→</kbd> velocidad. Haz clic en el cable para añadir una trama manual.
  </p>
</div>`;

/* ── 6 · Controlador / UI ────────────────────────────────────────────────── */
class CsmaUI {
  constructor(root) {
    this.root = root;
    root.innerHTML = TPL;
    this.el = {
      app: $('csmaApp', root), canvas: $('csmaCanvas', root), clock: $('csmaClock', root),
      caption: $('csmaCaption', root), play: $('csmaPlay', root), step: $('csmaStep', root),
      reset: $('csmaReset', root), scenarios: $('csmaScenarios', root),
      stations: $('csmaStations', root), metrics: $('csmaMetrics', root),
      facts: $('csmaFacts', root), health: $('csmaHealth', root), log: $('csmaLog', root),
      cStations: $('cStations', root), cLen: $('cLen', root), cFrame: $('cFrame', root),
      cLoad: $('cLoad', root), cSpeed: $('cSpeed', root), cSt: $('cSt', root), cFx: $('cFx', root),
      oStations: $('oStations', root), oLen: $('oLen', root), oFrame: $('oFrame', root),
      oLoad: $('oLoad', root), oRate: $('oRate', root), oSpeed: $('oSpeed', root),
      segRate: $('segRate', root)
    };
    this.ctx = this.el.canvas.getContext('2d');
    this.reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.fx = !this.reduceMotion;
    this.el.cFx.checked = this.fx;

    this.sim = new CsmaSim(Object.assign({}, DEFAULTS,
      this.reduceMotion ? { speed: 12 } : {}));
    this.scenario = 'collision';
    this.running = false;
    this.narr = { backoffs: [], txCount: 0, done: false };
    this.lastTs = 0; this.lastDom = 0; this.dpr = 1;

    this.buildScenarios();
    this.buildStationCards();
    this.buildMetrics();
    this.bind();
    this.sim.on((t, d) => this.onSimEvent(t, d));
    this.loadScenario('collision', true);
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  buildScenarios() {
    this.el.scenarios.innerHTML = '';
    Object.keys(SCENARIOS).forEach(key => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = SCENARIOS[key].label;
      b.dataset.scenario = key;
      b.setAttribute('aria-pressed', String(key === this.scenario));
      b.addEventListener('click', () => this.loadScenario(key));
      this.el.scenarios.appendChild(b);
    });
  }
  buildStationCards() {
    const box = this.el.stations; box.innerHTML = '';
    this.cards = this.sim.stations.map(st => {
      const d = document.createElement('div');
      d.className = 'stcard'; d.dataset.state = 'idle';
      d.innerHTML =
        '<span class="stcard__led" style="background:' + st.color + '33"></span>' +
        '<span><span class="stcard__name" style="color:' + st.color + '">' + st.name + '</span>' +
        '<span class="stcard__state"> · inactiva</span></span>' +
        '<span class="stcard__att">intentos 0</span>' +
        '<span class="stcard__bar"><i></i></span>';
      box.appendChild(d);
      return { root: d, state: d.querySelector('.stcard__state'),
               att: d.querySelector('.stcard__att'), bar: d.querySelector('.stcard__bar i'),
               led: d.querySelector('.stcard__led') };
    });
  }
  buildMetrics() {
    const defs = [
      ['ok','Tramas OK','metric--ok'], ['col','Colisiones','metric--bad'],
      ['late','Col. tardías','metric--warn'], ['att','Reintentos',''],
      ['drop','Descartes','metric--warn'], ['eff','Eficiencia','metric--ok'],
      ['thr','Throughput',''], ['t','Tiempo sim.','']
    ];
    this.el.metrics.innerHTML = defs.map(d =>
      '<div class="metric ' + d[2] + '" data-k="' + d[0] + '"><b>—</b><span>' + d[1] + '</span></div>'
    ).join('');
    this.metricEls = {};
    this.el.metrics.querySelectorAll('.metric').forEach(m => {
      this.metricEls[m.dataset.k] = m.querySelector('b');
    });
  }

  bind() {
    const el = this.el;
    el.play.addEventListener('click', () => this.toggle());
    el.step.addEventListener('click', () => this.doStep());
    el.reset.addEventListener('click', () => { this.pause(); this.restart(); });

    const sync = (input, out, fn, soft) => {
      const handler = () => { fn(input, out, soft); };
      input.addEventListener('input', handler);
      handler();
    };
    sync(el.cStations, el.oStations, (i, o) => {
      o.value = i.value + ' estaciones';
      this.setCfg({ stations: +i.value });
    });
    sync(el.cLen, el.oLen, (i, o) => {
      o.value = i.value + ' m'; this.setCfg({ cableLen: +i.value });
    });
    sync(el.cFrame, el.oFrame, (i, o) => {
      o.value = i.value + ' B'; this.setCfg({ frameBytes: +i.value });
    });
    sync(el.cLoad, el.oLoad, (i, o) => {
      const v = +i.value / 100; o.value = v.toFixed(2) + ' Erlang';
      this.setCfg({ load: v }, { soft: true });
    });
    sync(el.cSpeed, el.oSpeed, (i, o) => {
      const s = this.speedFromSlider(+i.value);
      o.value = Math.round(s) + ' µs/s';
      this.sim.cfg.speed = s; this.speed = s;
    }, true);
    el.segRate.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        el.segRate.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed','false'));
        b.setAttribute('aria-pressed','true');
        el.oRate.value = b.dataset.rate + ' Mb/s';
        this.setCfg({ rateMbps: +b.dataset.rate });
      });
    });
    el.cSt.addEventListener('change', () => {
      this.sim.cfg.spacetime = el.cSt.checked; this.resize();
    });
    el.cFx.addEventListener('change', () => { this.fx = el.cFx.checked; });

    el.canvas.addEventListener('click', e => this.manualFrame(e));
    document.addEventListener('keydown', e => {
      if (!el.app.contains(document.activeElement) && document.activeElement !== document.body) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.code === 'Space') { e.preventDefault(); this.toggle(); }
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); this.doStep(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); this.pause(); this.restart(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const d = e.key === 'ArrowRight' ? 5 : -5;
        el.cSpeed.value = clamp(+el.cSpeed.value + d, 0, 100);
        el.cSpeed.dispatchEvent(new Event('input'));
      }
    });

    if (global.ResizeObserver) {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(el.canvas.parentElement);
    } else {
      global.addEventListener('resize', () => this.resize());
    }
  }

  speedFromSlider(v) { return 4 * Math.pow(500, v / 100); }

  setCfg(patch, opts) {
    const wasRunning = this.running;
    this.sim.setConfig(patch, opts);
    if (!(opts && opts.soft)) {
      this.buildStationCards();
      this.restart(keepScenario => keepScenario);
      if (wasRunning) this.play(); else this.pause();
    }
    this.updateFacts();
  }

  loadScenario(key, silent) {
    this.scenario = key;
    this.el.scenarios.querySelectorAll('.chip').forEach(c =>
      c.setAttribute('aria-pressed', String(c.dataset.scenario === key)));
    const sc = SCENARIOS[key];
    Object.assign(this.sim.cfg, sc.cfg);
    this.sim.recompute();
    this.syncControls();
    this.restart();
    if (!silent) this.play(); else this.updateFacts();
  }
  syncControls() {
    const el = this.el, c = this.sim.cfg;
    el.cStations.value = c.stations; el.oStations.value = c.stations + ' estaciones';
    el.cLen.value = c.cableLen;      el.oLen.value = c.cableLen + ' m';
    el.cFrame.value = c.frameBytes;  el.oFrame.value = c.frameBytes + ' B';
    el.cLoad.value = Math.round(c.load * 100); el.oLoad.value = c.load.toFixed(2) + ' Erlang';
    el.segRate.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(+b.dataset.rate === c.rateMbps)));
    el.oRate.value = c.rateMbps + ' Mb/s';
  }
  restart() {
    const sc = SCENARIOS[this.scenario];
    this.sim.reset();
    this.buildStationCards();
    sc.setup(this.sim);
    this.narr = { backoffs: [], txCount: 0, done: false };
    this.el.log.innerHTML = '';
    this.updateFacts();
    this.setCaption(this.introCaption(), 'info');
    this.updateDom(true);
  }
  introCaption() {
    const s = this.sim;
    if (this.scenario === 'free') {
      return '<b>TRÁFICO LIBRE</b> · ' + s.stations.length + ' estaciones generan tramas (Poisson, ρ=' +
             s.cfg.load.toFixed(2) + '). Observa cómo emergen las colisiones al subir la carga.';
    }
    if (this.scenario === 'late') {
      return '<b>1 · CARRIER SENSE</b> · Cable de ' + s.cfg.cableLen + ' m: la señal tarda ' +
             fmtUs(s.propUs) + ' en llegar de un extremo al otro. La trama dura ' + fmtUs(s.frameUs) +
             ', menos que la ida y vuelta (' + fmtUs(s.rttUs) + '). ⚠ Esto viola la regla del slot time.';
    }
    return '<b>1 · CARRIER SENSE</b> · A y B escuchan el medio: no hay portadora, está libre. ' +
           'Pulsa «Simular» (o «Paso» para ir evento a evento).';
  }
  play()  { this.running = true;  this.el.play.textContent = '⏸ Pausa';
            this.el.play.setAttribute('aria-pressed','true'); }
  pause() { this.running = false; this.el.play.textContent = '▶ Simular';
            this.el.play.setAttribute('aria-pressed','false'); }
  toggle(){ this.running ? this.pause() : this.play(); }
  doStep(){ this.pause(); this.sim.stepNotable(); this.updateDom(true); }

  manualFrame(e) {
    const r = this.el.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const L = this.sim.cfg.cableLen;
    const { x0, x1 } = this.geom;
    const meters = clamp((mx - x0) / (x1 - x0), 0, 1) * L;
    let best = this.sim.stations[0], bd = Infinity;
    for (const st of this.sim.stations) {
      const d = Math.abs(st.pos - meters); if (d < bd) { bd = d; best = st; }
    }
    const others = this.sim.stations.filter(o => o !== best);
    if (!others.length) return;
    const dst = others[(Math.random() * others.length) | 0];
    this.sim.inject(best, dst, this.sim.t);
    this.log('Trama manual inyectada en <b>' + best.name + '</b> → ' + dst.name, 'info');
  }

  onSimEvent(type, d) {
    const s = this.sim, guided = this.scenario !== 'free';
    switch (type) {
      case 'tx': {
        const st = d.st, rec = d.rec;
        if (rec.kind === 'jam') {
          this.log('<b>' + st.name + '</b> emite JAM (' + JAM_BITS + ' bits) para avisar a todas', 'bad');
        } else {
          this.narr.txCount++;
          this.log('t=' + fmtUs(rec.t0) + ' · <b>' + st.name + '</b> transmite ' + rec.bytes +
                   ' B → ' + (rec.dst ? rec.dst.name : 'broadcast') +
                   ' (intento ' + (st.attempts + 1) + ')', st.attempts ? 'warn' : 'info');
          if (guided && this.narr.txCount === 1) {
            this.setCaption('<b>2 · MULTIPLE ACCESS</b> · Varias estaciones empiezan a transmitir a la vez. ' +
              'Cada señal avanza a 2×10⁸ m/s y tarda <b>' + fmtUs(s.propUs) + '</b> en cruzar el cable.', 'info');
          } else if (guided && this.narr.done) {
            this.setCaption('<b>5 · RETRANSMISIÓN</b> · ' + st.name + ' ganó el medio y reenvía la trama. ' +
              'Las demás la oyen llegar y se mantienen a la espera (defer).', 'info');
          }
        }
        break;
      }
      case 'collision': {
        const pct = Math.round(100 * d.x / s.cfg.cableLen);
        this.log('t=' + fmtUs(d.t) + ' · 💥 <b>COLISIÓN</b> detectada por <b>' + d.st.name +
                 '</b> (señal de ' + d.other.name + ') en el ' + pct + '% del cable', 'bad');
        if (guided && !this.narr.collided) {
          this.narr.collided = true;
          this.setCaption('<b>3 · COLLISION DETECTION</b> · <b>' + d.st.name + '</b> recibe la señal de <b>' +
            d.other.name + '</b> mientras aún transmite → colisión en el ' + pct + '% del cable. ' +
            'Ambas emiten <b>JAM</b> (' + fmtUs(s.jamUs) + ') y abortan la trama.', 'bad');
        } else if (!guided) {
          this.setCaption('💥 Colisión detectada por <b>' + d.st.name + '</b> · ' + s.stats.collisions +
            ' colisiones acumuladas · eficiencia ' + this.efficiency() + '%', 'bad');
        }
        break;
      }
      case 'backoff': {
        const st = d.st;
        this.log('t=' + fmtUs(s.t) + ' · ⏳ <b>' + st.name + '</b> backoff: intento ' + st.attempts +
                 ' → n=' + d.n + ', k=' + d.k + ' de [0, ' + (Math.pow(2, d.n) - 1) + '] = ' +
                 fmtUs(d.k * s.slotUs), 'warn');
        if (guided) {
          this.narr.backoffs.push({ name: st.name, n: d.n, k: d.k });
          if (this.narr.backoffs.length >= 2 && !this.narr.boShown) {
            this.narr.boShown = true;
            const txt = this.narr.backoffs
              .map(b => '<b>' + b.name + '</b>: k=' + b.k + ' → ' + fmtUs(b.k * s.slotUs))
              .join(' &nbsp;·&nbsp; ');
            const winner = this.narr.backoffs.slice().sort((a, b) => a.k - b.k)[0];
            this.setCaption('<b>4 · BACKOFF EXPONENCIAL BINARIO</b> · ' + txt +
              '. Gana <b>' + winner.name + '</b> (espera menor). Los valores son aleatorios: ' +
              'repite la simulación y verás resultados distintos.', 'warn');
          }
        }
        break;
      }
      case 'deliver': {
        const rec = d.rec;
        this.log('t=' + fmtUs(s.t) + ' · ✅ <b>' + rec.src.name + ' → ' + d.st.name + '</b> entregada (' +
                 rec.bytes + ' B, latencia ' + fmtUs(s.t - rec.frame.born) + ')', 'ok');
        if (guided && !this.narr.done) {
          this.narr.done = true;
          this.setCaption('<b>✔ FIN</b> · Trama entregada correctamente a <b>' + d.st.name + '</b> tras ' +
            rec.src.attempts + ' reintento(s). Así funciona Ethernet: <i>escuchar antes de emitir, ' +
            'detectar colisiones, avisar con JAM y reintentar tras una espera aleatoria</i>.', 'ok');
          this.pause();
        } else if (!guided) {
          this.setCaption('✅ Entrega correcta · eficiencia <b>' + this.efficiency() + '%</b> · ' +
            s.stats.ok + ' tramas OK / ' + s.stats.collisions + ' colisiones', 'ok');
        }
        break;
      }
      case 'late': {
        const rec = d.rec;
        this.log('t=' + fmtUs(s.t) + ' · ⚠️ <b>COLISIÓN TARDÍA</b>: ' + rec.src.name +
                 ' cree que tuvo éxito, pero ' + d.st.name + ' recibió la trama corrupta', 'bad');
        if (guided && !this.narr.lateShown) {
          this.narr.lateShown = true;
          this.setCaption('<b>⚠ COLISIÓN TARDÍA</b> · <b>' + rec.src.name + '</b> terminó de emitir (' +
            fmtUs(s.frameUs) + ') <u>antes</u> de que la señal de <b>' + d.st.name + '</b> llegara de vuelta (' +
            fmtUs(s.rttUs) + '). Cree que tuvo éxito y <b>no retransmitirá</b>: la trama se pierde en ' +
            d.st.name + '. Por eso 802.3 exige trama ≥ 64 B y RTT ≤ slot time (' + fmtUs(s.slotUs) + ').', 'bad');
          this.pause();
        } else if (!guided) {
          this.setCaption('⚠️ Colisión tardía · el emisor no la detecta y la trama se pierde', 'bad');
        }
        break;
      }
      case 'drop': {
        this.log('t=' + fmtUs(s.t) + ' · 🗑 <b>' + d.st.name + '</b> descartó la trama tras ' +
                 MAX_TRY + ' intentos', 'bad');
        break;
      }
      case 'frame': {
        this.log('t=' + fmtUs(s.t) + ' · ' + d.st.name + ' genera una trama (cola ' + d.st.queue.length + ')', 'info');
        break;
      }
    }
  }

  log(html, tone) {
    const li = document.createElement('li');
    li.innerHTML = html;
    if (tone && tone !== 'info') li.dataset.tone = tone;
    const box = this.el.log;
    box.insertBefore(li, box.firstChild);
    while (box.children.length > 70) box.removeChild(box.lastChild);
  }
  setCaption(html, tone) {
    this.el.caption.innerHTML = html;
    this.el.caption.dataset.tone = tone || 'info';
  }

  efficiency() {
    const s = this.sim;
    const elapsed = Math.max(1e-9, s.t);
    return Math.round(100 * s.stats.goodBits / (s.cfg.rateMbps * 1e6 * elapsed * 1e-6));
  }
  updateFacts() {
    const s = this.sim;
    const rows = [
      ['Tiempo de bit', fmtUs(s.bitUs)],
      ['Slot time (512 b)', fmtUs(s.slotUs)],
      ['Propagación 1 sentido', fmtUs(s.propUs)],
      ['RTT (ida y vuelta)', fmtUs(s.rttUs)],
      ['Tiempo de trama', fmtUs(s.frameUs)],
      ['Jam / IFG', fmtUs(s.jamUs) + ' / ' + fmtUs(s.ifgUs)]
    ];
    this.el.facts.innerHTML = rows.map(r =>
      '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>').join('');

    const c = s.checks, out = [];
    out.push(c.bigNet
      ? '<div data-bad>⚠ RTT (' + fmtUs(s.rttUs) + ') &gt; slot time (' + fmtUs(s.slotUs) +
        '): diámetro de red excesivo para ' + s.cfg.rateMbps + ' Mb/s.</div>'
      : '<div>✅ RTT ≤ slot time: la red cumple el requisito de 802.3.</div>');
    out.push(c.lateRisk
      ? '<div data-bad>⚠ Trama (' + fmtUs(s.frameUs) + ') &lt; RTT (' + fmtUs(s.rttUs) +
        '): se producirán <b>colisiones tardías</b> no detectables.</div>'
      : '<div>✅ Trama ≥ RTT: cualquier colisión se detecta mientras se emite.</div>');
    out.push(c.shortFrame
      ? '<div data-bad>⚠ ' + s.cfg.frameBytes + ' B está por debajo del mínimo de 64 B; ' +
        '802.3 rellenaría la trama automáticamente.</div>'
      : '<div>✅ Tamaño de trama dentro del rango 64–1518 B.</div>');
    this.el.health.innerHTML = out.join('');
  }

  updateDom(force) {
    const now = performance.now();
    if (!force && now - this.lastDom < 100) return;
    this.lastDom = now;
    const s = this.sim;

    this.el.clock.textContent = 't = ' + fmtUs(s.t);

    for (let i = 0; i < this.cards.length && i < s.stations.length; i++) {
      const c = this.cards[i], st = s.stations[i];
      c.root.dataset.state = st.state;
      if (st.flash) c.root.dataset.flash = st.flash.type; else c.root.removeAttribute('data-flash');
      const names = { idle:'inactiva', defer:'escuchando (medio ocupado)', tx:'transmitiendo',
                      jam:'JAM · colisión', backoff:'en backoff' };
      let extra = '';
      if (st.backoff) {
        const total = Math.max(1e-9, st.backoff.end - st.backoff.start);
        const pct = clamp(100 * (1 - (st.backoff.end - s.t) / total), 0, 100);
        c.bar.style.width = pct + '%';
        extra = ' · k=' + st.backoff.k + '/' + (Math.pow(2, st.backoff.n) - 1) +
                ' · ' + fmtUs(Math.max(0, st.backoff.end - s.t));
      } else { c.bar.style.width = '0%'; }
      c.state.textContent = ' · ' + (names[st.state] || st.state) + extra;
      c.att.textContent = 'intentos ' + st.attempts + ' · OK ' + st.stats.ok;
      c.led.style.background = st.state === 'idle' ? '#3a4a5c' : st.color;
    }

    const thr = s.t > 0 ? (s.stats.goodBits / (s.t * 1e-6)) / 1000 : 0;
    const m = this.metricEls;
    m.ok.textContent   = s.stats.ok;
    m.col.textContent  = s.stats.collisions;
    m.late.textContent = s.stats.late;
    m.att.textContent  = s.stats.attempts;
    m.drop.textContent = s.stats.dropped;
    m.eff.textContent  = this.efficiency() + '%';
    m.thr.textContent  = (thr >= 1000 ? fmt(thr / 1000, 2) + ' Mb/s' : fmt(thr, 0) + ' kb/s');
    m.t.textContent    = fmtUs(s.t);
  }

  loop(ts) {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.lastTs) this.lastTs = ts;
    let dt = (ts - this.lastTs) / 1000; this.lastTs = ts;
    dt = Math.min(dt, 0.25);
    if (this.running && dt > 0) {
      this.sim.advanceTo(this.sim.t + dt * (this.speed || DEFAULTS.speed));
    }
    this.draw(ts);
    this.updateDom(false);
  }

  resize() {
    const c = this.el.canvas, parent = c.parentElement;
    const w = Math.max(320, parent.clientWidth);
    const h = this.sim.cfg.spacetime ? 430 : 210;
    this.dpr = Math.min(global.devicePixelRatio || 1, 2);
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
    c.style.height = h + 'px';
    this.w = w; this.h = h;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const pad = Math.min(46, w * 0.06);
    this.geom = { x0: pad, x1: w - pad, cableY: 104,
                  st: this.sim.cfg.spacetime ? { x: pad * 0.55, y: 196, w: w - pad * 1.1, h: h - 214 } : null };
  }

  draw(ts) {
    const c = this.ctx, s = this.sim, g = this.geom;
    if (!g) return;
    const css = getComputedStyle(this.el.app);
    const COL = {
      txt:   css.getPropertyValue('--txt').trim()   || '#e6eef7',
      muted: css.getPropertyValue('--muted').trim() || '#93a6bb',
      line:  css.getPropertyValue('--line').trim()  || '#2a3a4d',
      panel: css.getPropertyValue('--panel').trim() || '#16202c',
      bad:   css.getPropertyValue('--bad').trim()   || '#ff5c5c',
      ok:    css.getPropertyValue('--ok').trim()    || '#3ddc97'
    };
    const L = Math.max(1, s.cfg.cableLen);
    const X = m => g.x0 + (m / L) * (g.x1 - g.x0);
    const pulse = this.fx ? 0.5 + 0.5 * Math.sin((ts || 0) / 220) : 1;

    c.clearRect(0, 0, this.w, this.h);

    const cy = g.cableY;
    c.lineCap = 'round';
    c.strokeStyle = COL.line; c.lineWidth = 7;
    c.beginPath(); c.moveTo(g.x0, cy); c.lineTo(g.x1, cy); c.stroke();
    c.strokeStyle = COL.muted; c.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = g.x0 + (g.x1 - g.x0) * i / 10;
      c.globalAlpha = 0.25;
      c.beginPath(); c.moveTo(x, cy - 4); c.lineTo(x, cy + 4); c.stroke();
    }
    c.globalAlpha = 1;
    [g.x0, g.x1].forEach(x => {
      c.fillStyle = COL.muted;
      c.fillRect(x - 3, cy - 12, 6, 24);
    });
    c.fillStyle = COL.muted; c.font = '11px ui-monospace, Menlo, monospace';
    c.textAlign = 'left';  c.fillText('0 m', g.x0 - 2, cy + 30);
    c.textAlign = 'right'; c.fillText(L + ' m', g.x1 + 2, cy + 30);

    const active = [];
    for (const rec of s.records) {
      const regs = signalRegions(rec, s.t, s.vUs, L);
      if (!regs) continue;
      active.push({ rec: rec, regs: regs });
    }
    c.save();
    for (const a of active) {
      const col = a.rec.kind === 'jam' ? COL.bad : a.rec.src.color;
      c.strokeStyle = col; c.lineWidth = a.rec.kind === 'jam' ? 11 : 9;
      c.globalAlpha = a.rec.kind === 'jam' ? 0.95 : (0.55 + 0.35 * pulse);
      if (this.fx) { c.shadowColor = col; c.shadowBlur = 14; }
      for (const r of a.regs) {
        c.beginPath(); c.moveTo(X(r[0]), cy); c.lineTo(X(r[1]), cy); c.stroke();
      }
    }
    c.restore();

    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const A = active[i], B = active[j];
        if (A.rec.src === B.rec.src) continue;
        for (const ra of A.regs) for (const rb of B.regs) {
          const lo = Math.max(ra[0], rb[0]), hi = Math.min(ra[1], rb[1]);
          if (hi > lo) {
            c.strokeStyle = COL.bad; c.lineWidth = 13; c.globalAlpha = 0.85;
            c.beginPath(); c.moveTo(X(lo), cy); c.lineTo(X(hi), cy); c.stroke();
          }
        }
      }
    }
    c.restore();

    for (const sp of s.sparks) {
      const age = clamp((s.t - sp.t) / s.sparkUs, 0, 1);
      const r = 6 + age * 26;
      c.save();
      c.globalAlpha = (1 - age) * 0.95;
      c.strokeStyle = COL.bad; c.lineWidth = 2.5;
      if (this.fx) { c.shadowColor = COL.bad; c.shadowBlur = 18; }
      c.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4 + age * 0.6;
        c.moveTo(X(sp.x) + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45);
        c.lineTo(X(sp.x) + Math.cos(a) * r,       cy + Math.sin(a) * r);
      }
      c.stroke(); c.restore();
    }

    c.textAlign = 'center';
    for (const st of s.stations) {
      const x = X(st.pos);
      const flashing = st.flash && (s.t - st.flash.t) < 2 * s.slotUs;
      const boxW = 46, boxH = 34, by = cy - 74;
      c.strokeStyle = COL.line; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, by + boxH); c.lineTo(x, cy - 6); c.stroke();

      const stateCol = st.state === 'jam' ? COL.bad
                     : st.state === 'backoff' ? '#ffd23d'
                     : st.state === 'defer' ? '#8b7bff'
                     : flashing && st.flash.type === 'ok' ? COL.ok
                     : st.state === 'tx' ? st.color : COL.muted;
      c.fillStyle = COL.panel; c.strokeStyle = stateCol; c.lineWidth = 2;
      this.roundRect(x - boxW / 2, by, boxW, boxH, 8); c.fill(); c.stroke();
      c.fillStyle = stateCol;
      c.font = '700 15px system-ui, sans-serif';
      c.fillText(st.name, x, by + 22);

      c.beginPath(); c.arc(x + boxW / 2 - 7, by + 7, 3.2, 0, 7);
      c.fillStyle = stateCol;
      if (this.fx && st.state === 'tx') { c.shadowColor = stateCol; c.shadowBlur = 10 * pulse; }
      c.fill(); c.shadowBlur = 0;

      if (st.backoff) {
        const total = Math.max(1e-9, st.backoff.end - st.backoff.start);
        const pct = clamp(1 - (st.backoff.end - s.t) / total, 0, 1);
        const bw = 44, bx = x - bw / 2, bY = cy + 40;
        c.fillStyle = COL.line; this.roundRect(bx, bY, bw, 6, 3); c.fill();
        c.fillStyle = '#ffd23d'; this.roundRect(bx, bY, Math.max(2, bw * pct), 6, 3); c.fill();
        c.fillStyle = COL.muted; c.font = '10px ui-monospace, Menlo, monospace';
        c.fillText('k=' + st.backoff.k + '/' + (Math.pow(2, st.backoff.n) - 1), x, bY + 20);
      } else if (st.state === 'tx') {
        const pct = st.tx ? clamp((s.t - st.tx.t0) / Math.max(1e-9, st.tx.dur), 0, 1) : 0;
        const bw = 44, bx = x - bw / 2, bY = cy + 40;
        c.fillStyle = COL.line; this.roundRect(bx, bY, bw, 6, 3); c.fill();
        c.fillStyle = st.color; this.roundRect(bx, bY, Math.max(2, bw * pct), 6, 3); c.fill();
      }
      c.fillStyle = COL.muted; c.font = '10px system-ui, sans-serif';
      if (!st.backoff && st.state !== 'tx') {
        c.fillText('int. ' + st.attempts, x, cy + 56);
      }
    }

    if (g.st && s.cfg.spacetime) this.drawSpacetime(c, s, g.st, L, COL);
  }

  drawSpacetime(c, s, p, L, COL) {
    const now = s.t, T = s.windowUs, tMin = now - T;
    const SX = m => p.x + (m / L) * p.w;
    const SY = t => p.y + ((t - tMin) / T) * p.h;

    c.save();
    c.fillStyle = 'rgba(127,127,127,0.06)';
    this.roundRect(p.x, p.y, p.w, p.h, 8); c.fill();
    c.strokeStyle = COL.line; c.lineWidth = 1; c.stroke();
    c.clip();

    let stepT = s.slotUs;
    while (stepT / T * p.h < 16) stepT *= 2;
    c.font = '9px ui-monospace, Menlo, monospace'; c.textAlign = 'left';
    for (let t = Math.ceil(tMin / stepT) * stepT; t <= now; t += stepT) {
      const y = SY(t);
      c.strokeStyle = COL.line; c.globalAlpha = 0.45;
      c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke();
      c.globalAlpha = 1; c.fillStyle = COL.muted;
      c.fillText(fmtUs(t), p.x + 4, y - 3);
    }
    c.textAlign = 'center';
    for (const st of s.stations) {
      const x = SX(st.pos);
      c.strokeStyle = st.color; c.globalAlpha = 0.35; c.setLineDash([2, 4]);
      c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke();
      c.setLineDash([]); c.globalAlpha = 0.9; c.fillStyle = st.color;
      c.font = '700 10px system-ui, sans-serif';
      c.fillText(st.name, x, p.y + 11);
    }
    for (const rec of s.records) {
      if (rec.t0 > now || rec.t0 + rec.dur + L / s.vUs < tMin) continue;
      const col = rec.kind === 'jam' ? COL.bad : rec.src.color;
      c.fillStyle = col; c.strokeStyle = col;
      for (const side of [-1, 1]) {
        const poly = stPolygon(rec, side, s.vUs, L, now);
        if (!poly) continue;
        c.globalAlpha = rec.kind === 'jam' ? 0.45 : 0.26;
        c.beginPath();
        poly.forEach((pt, i) => { const X = SX(pt[0]), Y = SY(pt[1]); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
        c.closePath(); c.fill();
        c.globalAlpha = 0.75; c.lineWidth = 1.2; c.stroke();
      }
    }
    for (const sp of s.sparks) {
      if (sp.t < tMin) continue;
      const x = SX(sp.x), y = SY(sp.t);
      c.globalAlpha = 1; c.strokeStyle = COL.bad; c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x - 5, y - 5); c.lineTo(x + 5, y + 5);
      c.moveTo(x + 5, y - 5); c.lineTo(x - 5, y + 5);
      c.stroke();
    }
    c.restore();
    c.globalAlpha = 1;
    c.fillStyle = COL.muted; c.font = '10px system-ui, sans-serif'; c.textAlign = 'left';
    c.fillText('Diagrama espacio-tiempo  ·  eje Y: tiempo (↓), eje X: posición en el cable  ·  ventana ' + fmtUs(T),
               p.x, p.y - 6);
  }

  roundRect(x, y, w, h, r) {
    const c = this.ctx;
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
  }
}

/* ── 7 · Arranque ────────────────────────────────────────────────────────── */
function initCsma(target) {
    ensureStyles();
    let root = target;
    if (!root) {
        root = document.getElementById('csmaRoot') || document.getElementById('csmaStage');
    }
    if (!root) {
        root = document.createElement('div');
        root.id = 'csmaRoot';
        document.body.appendChild(root);
    }
    if (root.__csmaUI) return root.__csmaUI;
    const ui = new CsmaUI(root);
    root.__csmaUI = ui;
    return ui;
}

// Auto-inicialización cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCsma());
} else {
    initCsma();
}

global.initCsma = initCsma;
global.CsmaSim  = CsmaSim;
})(window);
