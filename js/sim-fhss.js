// js/sim-fhss.js · Bluetooth frequency-hopping module

function initFhss() {
    if (!document.getElementById('fhssGrid')) return;
    /* ================= SIMULADOR FHSS (BLUETOOTH) ================= */
const fhssChannels = [12, 45, 78, 23, 67, 34, 56, 1, 70, 29];
const fhssGrid = document.getElementById('fhssGrid');
const fhssReadout = document.getElementById('fhssReadout');
let fhssTimer = null;
let fhssHop = -1;
fhssChannels.forEach(function(ch){
  const bar = document.createElement('div');
  bar.className = 'fhss-bar';
  bar.dataset.ch = ch;
  bar.innerHTML = '<span>' + ch + '</span>';
  fhssGrid.appendChild(bar);
});
function fhssStep(){
  fhssHop = (fhssHop + 1) % fhssChannels.length;
  const ch = fhssChannels[fhssHop];
  fhssGrid.querySelectorAll('.fhss-bar').forEach(function(b){
    b.classList.toggle('on', Number(b.dataset.ch) === ch);
  });
  const mhz = 2401 + ch;
  fhssReadout.textContent = 'Salto ' + (fhssHop + 1) + '/' + fhssChannels.length + ' → canal ' + ch + ' (' + (mhz/1000).toFixed(3) + ' GHz) · la pareja 📱🎧 salta sincronizada';
}
function fhssStop(){
  if(fhssTimer){ clearInterval(fhssTimer); fhssTimer = null; }
  document.getElementById('fhssPlay').textContent = '▶ Iniciar saltos';
}
document.getElementById('fhssPlay').addEventListener('click', function(){
  if(fhssTimer){ fhssStop(); return; }
  fhssStep();
  fhssTimer = setInterval(fhssStep, 620);
  this.textContent = '⏸ Pausar';
});
document.getElementById('fhssReset').addEventListener('click', function(){
  fhssStop();
  fhssHop = -1;
  fhssGrid.querySelectorAll('.fhss-bar').forEach(function(b){ b.classList.remove('on'); });
  fhssReadout.textContent = 'Pulsa ▶ para iniciar el salto de frecuencia.';
});

}
