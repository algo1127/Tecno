// js/sim-wifi.js

function initWlan() {
    // GUARD CLAUSE: If the WLAN page isn't loaded, stop immediately!
    if (!document.getElementById('covCircle')) return;

    /* ================= COMPARADOR DE BANDAS WI-FI ================= */
    const covCircle = document.getElementById('covCircle');
    const speedFill = document.getElementById('speedFill');
    const covFill = document.getElementById('covFill');
    const bandCaption = document.getElementById('bandCaption');
    const bandButtons = [document.getElementById('band24'), document.getElementById('band5')];
    
    function setBand(mode){
      bandButtons.forEach(function(bt){ bt.classList.toggle('active', bt.dataset.band === mode); });
      if(mode === '24'){
        covCircle.style.width = '210px'; covCircle.style.height = '210px';
        covCircle.style.background = 'radial-gradient(circle, rgba(242,163,60,.4), rgba(242,163,60,.06) 70%)';
        covCircle.style.borderColor = 'rgba(242,163,60,.7)';
        speedFill.style.width = '38%'; covFill.style.width = '86%';
        bandCaption.textContent = '2.4 GHz: mayor cobertura y penetración de obstáculos, pero menor velocidad (11–54 Mbps en b/g) y más interferencias (microondas, otros Wi-Fi, Bluetooth).';
      }else{
        covCircle.style.width = '118px'; covCircle.style.height = '118px';
        covCircle.style.background = 'radial-gradient(circle, rgba(18,181,165,.45), rgba(18,181,165,.06) 70%)';
        covCircle.style.borderColor = 'rgba(18,181,165,.8)';
        speedFill.style.width = '88%'; covFill.style.width = '42%';
        bandCaption.textContent = '5 GHz: mayor tasa de transmisión de datos (802.11a/ac/ax), pero menor cobertura y peor penetración de obstáculos que la banda de 2.4 GHz.';
      }
    }
    bandButtons.forEach(function(bt){ bt.addEventListener('click', function(){ setBand(bt.dataset.band); }); });

    /* ================= SEGURIDAD WI-FI ================= */
    const secInfo = {
      wep:  {t:'WEP · Wired Equivalent Privacy (1997)', d:'Uno de los primeros protocolos de seguridad introducidos en 802.11. Se demostró que era <strong>vulnerable a varios tipos de ataques</strong>, por lo que fue reemplazado. Hoy no debe usarse.'},
      wpa:  {t:'WPA · Wi-Fi Protected Access (2003)', d:'Mejora transitoria sobre WEP (claves dinámicas TKIP) mientras se preparaba WPA2. Supuso un salto importante, pero hoy se considera insuficiente.'},
      wpa2: {t:'WPA2 (2004)', d:'Introduce cifrado fuerte <strong>AES-CCM</strong>. Fue el estándar recomendado durante más de una década y sigue siendo el mínimo exigible en redes actuales.'},
      wpa3: {t:'WPA3 (2018)', d:'El nivel de seguridad <strong>superior</strong> actual: protege mejor las contraseñas (emparejamiento SAE), cifra incluso en redes abiertas y resiste ataques de diccionario.'}
    };
    const secDetail = document.getElementById('secDetail');
    
    document.querySelectorAll('.sec-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        document.querySelectorAll('.sec-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        const info = secInfo[btn.dataset.sec];
        secDetail.innerHTML = '<h4>' + info.t + '</h4><p>' + info.d + '</p>';
      });
    });
}
