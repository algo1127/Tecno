// js/sim-csma.js

function initCsma() {
    // GUARD CLAUSE: If the Ethernet page isn't loaded, stop immediately!
    const csmaStage = document.getElementById('csmaStage');
    if (!csmaStage) return; 

    const pkA = document.getElementById('pkA');
    const pkB = document.getElementById('pkB');
    const csmaBurst = document.getElementById('csmaBurst');
    const csmaCaption = document.getElementById('csmaCaption');
    const backoffBox = document.getElementById('backoffBox');
    const boA = document.getElementById('boA');
    const boB = document.getElementById('boB');
    const boAv = document.getElementById('boAv');
    const boBv = document.getElementById('boBv');
    
    let csmaRunning = false;
    let csmaToken = 0;
    
    function sleepMs(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }
    
    function placePacket(el, leftPct, durMs){
      el.style.transition = 'none';
      void el.offsetWidth;
      el.style.transition = 'left ' + durMs + 'ms linear';
      el.style.left = leftPct + '%';
    }
    
    function resetCsma(){
      csmaToken++;
      csmaRunning = false;
      csmaStage.classList.remove('listening','collision');
      pkA.classList.remove('show'); pkB.classList.remove('show');
      csmaBurst.classList.remove('show');
      backoffBox.hidden = true;
      boA.style.width = '0%'; boB.style.width = '0%';
      boAv.textContent = '—'; boBv.textContent = '—';
      placePacket(pkA, 9, 0); placePacket(pkB, 91, 0);
      csmaCaption.textContent = 'Pulsa «Simular» para ver el ciclo completo: escucha → transmisión → colisión → backoff → retransmisión.';
    }
    
    async function runCsma(){
      if(csmaRunning) return;
      resetCsma();
      csmaRunning = true;
      const myToken = csmaToken;
      
      csmaStage.classList.add('listening');
      csmaCaption.textContent = '1 · CARRIER SENSE: A y B escuchan el medio… está libre (sin portadora).';
      await sleepMs(1500); if(myToken !== csmaToken) return;
      
      csmaStage.classList.remove('listening');
      csmaCaption.textContent = '2 · MULTIPLE ACCESS: A y B empiezan a transmitir a la vez por el medio compartido.';
      pkA.classList.add('show'); pkB.classList.add('show');
      placePacket(pkA, 50, 1700); placePacket(pkB, 50, 1700);
      await sleepMs(1750); if(myToken !== csmaToken) return;
      
      csmaStage.classList.add('collision');
      csmaBurst.classList.add('show');
      pkA.classList.remove('show'); pkB.classList.remove('show');
      csmaCaption.textContent = '3 · COLLISION DETECTION: ¡colisión! Las señales se solapan y ambos marcos se corrompen.';
      await sleepMs(1400); if(myToken !== csmaToken) return;
      
      csmaBurst.classList.remove('show');
      csmaStage.classList.remove('collision');
      backoffBox.hidden = false;
      csmaCaption.textContent = '4 · BACKOFF BINARIO: cada estación espera un tiempo aleatorio distinto antes de reintentar.';
      boAv.textContent = '2 ms'; boBv.textContent = '6 ms';
      requestAnimationFrame(function(){ boA.style.width = '30%'; boB.style.width = '78%'; });
      await sleepMs(1600); if(myToken !== csmaToken) return;
      
      csmaCaption.textContent = '5 · B se abstiene (su temporizador es mayor); A retransmite y el marco llega completo ✅';
      pkA.classList.add('show');
      placePacket(pkA, 91, 1900);
      await sleepMs(2000); if(myToken !== csmaToken) return;
      
      csmaCaption.textContent = '✔ FIN: así gestiona Ethernet (802.3) el medio compartido: escuchar, transmitir, detectar colisiones y reintentar con espera aleatoria.';
      csmaRunning = false;
    }
    
    document.getElementById('csmaPlay').addEventListener('click', runCsma);
    document.getElementById('csmaReset').addEventListener('click', resetCsma);
    resetCsma();
}
