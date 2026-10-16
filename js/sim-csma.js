/**
 * Enhanced CSMA/CD Simulation
 * Features: Real Exponential Backoff, AbortController for clean cancellation, 
 * and Carrier Sense interruption logic.
 */
function initCsma() {
    const stage = document.getElementById('csmaStage');
    if (!stage) return;

    // 1. DOM Caching
    const dom = {
        stage,
        pkA: document.getElementById('pkA'),
        pkB: document.getElementById('pkB'),
        burst: document.getElementById('csmaBurst'),
        caption: document.getElementById('csmaCaption'),
        backoffBox: document.getElementById('backoffBox'),
        boA: document.getElementById('boA'),
        boB: document.getElementById('boB'),
        boAv: document.getElementById('boAv'),
        boBv: document.getElementById('boBv'),
        playBtn: document.getElementById('csmaPlay'),
        resetBtn: document.getElementById('csmaReset')
    };

    if (!dom.pkA || !dom.pkB) return;

    let abortController = null;
    let isRunning = false;

    // 2. Utility: Sleep with native AbortSignal support
    const sleep = (ms, signal) => new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason || new DOMException('Aborted', 'AbortError'));
        
        const timeout = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        
        const onAbort = () => {
            clearTimeout(timeout);
            reject(signal?.reason || new DOMException('Aborted', 'AbortError'));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });

    // 3. Utility: Promise-based CSS Animation
    const animatePacket = (el, targetLeft, duration) => {
        return new Promise(resolve => {
            el.style.transition = 'none';
            void el.offsetWidth; // Trigger reflow
            // Smoother easing than 'linear'
            el.style.transition = `left ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            el.style.left = `${targetLeft}%`;
            
            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd, { once: true });
            // Fallback in case transitionend fails to fire
            setTimeout(resolve, duration + 50);
        });
    };

    // 4. Station Class (Encapsulates logic per node)
    class Station {
        constructor(id, el, barEl, valEl, startPos) {
            this.id = id;
            this.el = el;
            this.bar = barEl;
            this.val = valEl;
            this.startPos = startPos;
            this.attempts = 0;
            this.slotTime = 100; // Visual ms per slot
        }

        reset() {
            this.attempts = 0;
            this.el.style.left = `${this.startPos}%`;
            this.el.classList.remove('show');
            this.bar.style.transition = 'width 0.3s ease';
            this.bar.style.width = '0%';
            this.val.textContent = '—';
        }

        // Real Ethernet Truncated Binary Exponential Backoff
        calculateBackoff() {
            this.attempts++;
            if (this.attempts > 16) return -1; // Max attempts exceeded
            const k = Math.min(this.attempts, 10);
            const maxSlots = Math.pow(2, k) - 1;
            const slots = Math.floor(Math.random() * (maxSlots + 1));
            return slots * this.slotTime;
        }

        async animateBackoff(totalMs, signal) {
            if (totalMs <= 0) {
                this.bar.style.width = '0%';
                this.val.textContent = '0 ms';
                return;
            }
            const steps = 30;
            const stepTime = totalMs / steps;
            this.bar.style.transition = 'none'; // Disable CSS transition for JS stepped animation
            
            for (let i = 1; i <= steps; i++) {
                await sleep(stepTime, signal);
                const pct = (i / steps) * 100;
                this.bar.style.width = `${pct}%`;
                const remaining = Math.round(totalMs - (i * stepTime));
                this.val.textContent = `${remaining} ms`;
            }
            this.val.textContent = '0 ms';
            this.bar.style.width = '100%';
        }
    }

    const stationA = new Station('A', dom.pkA, dom.boA, dom.boAv, 9);
    const stationB = new Station('B', dom.pkB, dom.boB, dom.boBv, 91);

    const setCaption = (text) => { dom.caption.textContent = text; };

    const resetSimulation = () => {
        if (abortController) abortController.abort(); // Kill any running async loops
        isRunning = false;
        
        dom.stage.classList.remove('listening', 'collision');
        dom.burst.classList.remove('show');
        dom.backoffBox.hidden = true;
        
        stationA.reset();
        stationB.reset();
        
        dom.playBtn.disabled = false;
        setCaption('Pulsa «Simular» para ver el ciclo completo: escucha → transmisión → colisión → backoff exponencial → retransmisión.');
    };

    // 5. Main Simulation Loop
    async function runSimulation() {
        if (isRunning) return;
        resetSimulation();
        isRunning = true;
        abortController = new AbortController();
        const { signal } = abortController;

        dom.playBtn.disabled = true;

        try {
            // PHASE 1: CARRIER SENSE
            dom.stage.classList.add('listening');
            setCaption('1 · CARRIER SENSE: A y B escuchan el medio… está libre (sin portadora).');
            await sleep(1500, signal);

            // PHASE 2: MULTIPLE ACCESS
            dom.stage.classList.remove('listening');
            setCaption('2 · MULTIPLE ACCESS: A y B empiezan a transmitir a la vez por el medio compartido.');
            dom.pkA.classList.add('show');
            dom.pkB.classList.add('show');
            
            // Animate to center (simulating propagation and collision point)
            await Promise.all([
                animatePacket(dom.pkA, 50, 1500),
                animatePacket(dom.pkB, 50, 1500)
            ]);

            await sleep(200, signal); // Brief pause before collision

            // PHASE 3: COLLISION DETECTION
            dom.stage.classList.add('collision');
            dom.burst.classList.add('show');
            dom.pkA.classList.remove('show');
            dom.pkB.classList.remove('show');
            setCaption('3 · COLLISION DETECTION: ¡colisión! Las señales se solapan y ambos marcos se corrompen.');
            await sleep(1500, signal);

            dom.burst.classList.remove('show');
            dom.stage.classList.remove('collision');

            // PHASE 4: BACKOFF
            dom.backoffBox.hidden = false;
            setCaption('4 · BACKOFF EXPONENCIAL: cada estación calcula una espera aleatoria (Truncated Binary Exponential Backoff).');
            
            const backoffA = stationA.calculateBackoff();
            const backoffB = stationB.calculateBackoff();

            dom.boAv.textContent = `Objetivo: ${backoffA} ms`;
            dom.boBv.textContent = `Objetivo: ${backoffB} ms`;

            // Determine winner and loser
            const first = backoffA <= backoffB ? stationA : stationB;
            const second = backoffA <= backoffB ? stationB : stationA;
            const tie = backoffA === backoffB;
            
            // Only animate the winner's backoff fully. 
            // The loser will be interrupted by Carrier Sense!
            if (first.id === 'A') {
                 await stationA.animateBackoff(backoffA, signal);
            } else {
                 await stationB.animateBackoff(backoffB, signal);
            }

            // PHASE 5: RESOLUTION
            if (tie) {
                setCaption('⚠ EMPATE EN BACKOFF: Ambas eligieron el mismo tiempo. ¡Nueva colisión inevitable!');
                dom.stage.classList.add('collision');
                dom.burst.classList.add('show');
                await sleep(2000, signal);
                dom.burst.classList.remove('show');
                dom.stage.classList.remove('collision');
                setCaption('Las estaciones incrementarán su contador de intentos y calcularán un backoff mayor para el próximo intento.');
            } else {
                setCaption(`5 · RETRANSMISIÓN: ${first.id} terminó su backoff y transmite. ${second.id} detecta portadora (Carrier Sense) y aborta su backoff.`);
                
                // Visually interrupt the loser's backoff
                second.bar.style.transition = 'width 0.5s ease';
                second.bar.style.width = '0%';
                second.val.textContent = 'INTERRUMPIDO';
                
                // Winner transmits
                first.el.classList.add('show');
                const targetPos = first === stationA ? 91 : 9;
                await animatePacket(first.el, targetPos, 2000);
                first.el.classList.remove('show');

                setCaption(`✔ ÉXITO: ${first.id} entregó el marco. ${second.id} esperará a que el medio se libere para reintentar.`);
                await sleep(1500, signal);
            }

        } catch (err) {
            if (err.name !== 'AbortError') console.error('Simulation error:', err);
        } finally {
            isRunning = false;
            dom.playBtn.disabled = false;
        }
    }

    // 6. Event Listeners
    dom.playBtn.addEventListener('click', runSimulation);
    dom.resetBtn.addEventListener('click', resetSimulation);
    
    // Initial setup
    resetSimulation();
}

// Auto-init safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCsma);
} else {
    initCsma();
}
