// js/quiz.js

function initQuiz() {
    // GUARD CLAUSE: If the Test page isn't loaded, stop immediately!
    const quizForm = document.getElementById('quizForm');
    if (!quizForm) return;

    const quizResult = document.getElementById('quizResult');

    /* ================= TEST INTERACTIVO ================= */
    const quizData = [
      {q:'¿Qué organismo define el estándar Ethernet (802.3)?', o:['ISO','IEEE','IETF','ITU-T'], ok:1, w:'El IEEE (Instituto de Ingenieros Eléctricos y Electrónicos) define la familia 802, incluido 802.3.'},
      {q:'En CSMA/CD, si dos dispositivos transmiten a la vez…', o:['No ocurre nada: el medio es dúplex','Se produce una colisión: detienen la transmisión, esperan un tiempo aleatorio y reintentan','El conmutador elimina uno de los marcos sin aviso','Se conmuta automáticamente a fibra óptica'], ok:1, w:'Detección de colisiones: se detiene la transmisión, se espera un backoff aleatorio y se reintenta.'},
      {q:'¿Qué medio físico permite 10 Gbps o más a distancias de varios kilómetros?', o:['Par trenzado Cat5','Cable coaxial','Fibra óptica','Par trenzado Cat5e'], ok:2, w:'La fibra óptica usa pulsos de luz: 10 Gbps o más a varios km, inmune a interferencias.'},
      {q:'Distancia máxima del par trenzado Cat5e a 1 Gbps según el estándar:', o:['100 m','500 m','55 m','1 km'], ok:0, w:'Con Cat5e es posible transmitir hasta 1 Gbps a un máximo de 100 metros.'},
      {q:'La versión 802.11a utiliza la banda de…', o:['2.4 GHz','5 GHz','60 GHz','Infrarrojos'], ok:1, w:'802.11a usa 5 GHz: más tasa de datos, menor cobertura que 2.4 GHz.'},
      {q:'¿Qué protocolo de seguridad Wi-Fi ofrece hoy el nivel más alto?', o:['WEP','WPA','WPA2','WPA3'], ok:3, w:'WPA3 (2018) proporciona un nivel de seguridad superior a todos los anteriores.'},
      {q:'El método de acceso al medio de Bluetooth (802.15) es…', o:['CSMA/CD','CSMA/CA','FHSS (salto de frecuencia)','Paso de testigo (token)'], ok:2, w:'FHSS: saltos rápidos entre frecuencias para minimizar interferencias y mejorar la seguridad.'},
      {q:'¿Qué estándar define las redes inalámbricas WLAN (Wi-Fi)?', o:['IEEE 802.3','IEEE 802.11','IEEE 802.15','IEEE 802.16'], ok:1, w:'802.11 especifica las WLAN en las capas física y de enlace; 802.16 es WiMAX.'},
      {q:'¿Qué versiones de 802.11 pueden trabajar en ambas bandas (2.4 y 5 GHz)?', o:['a y b','b y g','n, ac y ax','Solo la versión original'], ok:2, w:'802.11n, 802.11ac y 802.11ax pueden utilizar ambas bandas.'},
      {q:'En la capa de enlace, WLAN (802.11) emplea como método de acceso…', o:['CSMA/CA (evitación de colisiones)','CSMA/CD (detección de colisiones)','FDMA puro','ALOHA sin escucha'], ok:0, w:'Por radio no se pueden detectar colisiones con fiabilidad: se evitan (CSMA/CA).'}
    ];
    
    function renderQuiz(){
      quizForm.innerHTML = '';
      quizResult.className = 'quiz-result';
      quizResult.innerHTML = '';
      quizData.forEach(function(item, qi){
        const box = document.createElement('div');
        box.className = 'quiz-q';
        box.dataset.q = qi;
        let optsHtml = '';
        item.o.forEach(function(op, oi){
          optsHtml += '<label class="opt"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + op + '</span></label>';
        });
        box.innerHTML = '<h4><span class="qnum">P' + (qi+1) + '.</span> ' + item.q + '</h4>' + optsHtml + '<div class="why">💡 ' + item.w + '</div>';
        quizForm.appendChild(box);
      });
    }
    
    document.getElementById('quizSubmit').addEventListener('click', function(){
      let score = 0;
      quizData.forEach(function(item, qi){
        const box = quizForm.querySelector('.quiz-q[data-q="' + qi + '"]');
        const chosen = box.querySelector('input:checked');
        const labels = box.querySelectorAll('.opt');
        labels.forEach(function(lb){ lb.classList.remove('ok','bad'); });
        labels[item.ok].classList.add('ok');
        if(chosen){
          const val = Number(chosen.value);
          if(val === item.ok){ score++; }
          else{ labels[val].classList.add('bad'); }
        }
        box.querySelector('.why').classList.add('show');
        box.querySelectorAll('input').forEach(function(inp){ inp.disabled = true; });
      });
      let msg, color;
      if(score >= 9){ msg = '🏆 ¡SOBRESALIENTE! Dominas los estándares como una auténtica Consultoría Tecnológica Senior.'; color = 'linear-gradient(135deg,#1a9e6e,#0e7a54)'; }
      else if(score >= 5){ msg = '💪 NOTABLE / APROBADO: buen dominio del tema. Repasa las preguntas falladas (marcadas en rojo).'; color = 'linear-gradient(135deg,#1f6fb2,#155a92)'; }
      else{ msg = '📚 INSUFICIENTE: vuelve a las secciones de Ethernet, WLAN y Bluetooth y reintenta el test.'; color = 'linear-gradient(135deg,#d64545,#a92f2f)'; }
      quizResult.style.background = color;
      quizResult.innerHTML = '<span class="score-big">' + score + ' / 10</span><br>' + msg;
      quizResult.className = 'quiz-result show';
      quizResult.scrollIntoView({behavior:'smooth', block:'center'});
    });
    
    document.getElementById('quizRetry').addEventListener('click', function(){
      renderQuiz();
      window.scrollTo({top:0, behavior:'smooth'});
    });
    
    // 👇 CRITICAL: Draw the quiz on the screen right now!
    renderQuiz(); 
}
