(function(){
'use strict';
const base=new URL('./',document.currentScript.src);let promptEvent=null,registration=null;
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function device(){const ua=navigator.userAgent;if(/iPad|iPhone|iPod/.test(ua)||(/Mac/.test(navigator.platform)&&navigator.maxTouchPoints>1))return 'apple';if(/Android/.test(ua))return 'android';return 'desktop';}
const api=window.BUK={offlineReady:false,offlineFailed:false,installed,install,checkOffline,base:base.href};
function setReady(ready,failed=false){api.offlineReady=ready;api.offlineFailed=failed;window.dispatchEvent(new Event('buk:offline'));document.querySelectorAll('[data-offline-state]').forEach(el=>{el.textContent=ready?'Listo sin conexión':failed?'Disponible en línea':'Guardando juegos…';el.classList.toggle('ready',ready);});}
function guide(platform=device()){
 let dialog=document.getElementById('buk-install');if(!dialog){dialog=document.createElement('dialog');dialog.id='buk-install';document.body.appendChild(dialog);}
 const mac=/Mac/.test(navigator.platform)&&navigator.maxTouchPoints<2;
 const steps=platform==='apple'?['Abre BUKLABS Play en Safari.','Toca Compartir y elige «Agregar a Inicio» o «Añadir a pantalla de inicio».','Activa «Abrir como app web» si aparece y toca «Agregar».']:platform==='android'?['Abre BUKLABS Play en Chrome o Samsung Internet.','En el menú del navegador, elige «Instalar aplicación» o «Añadir a pantalla de inicio».','Confirma y abre BUKLABS Play desde su nuevo ícono.']:mac?['En Safari, abre el menú Archivo.','Elige «Agregar al Dock» si está disponible. En Chrome o Edge, utiliza el ícono de instalación en la barra de direcciones.','Abre BUKLABS Play desde su ícono.']:['Abre BUKLABS Play en Chrome o Edge, en Windows o Linux.','Busca el ícono de instalación en la barra de direcciones o la opción «Instalar» en el menú del navegador.','Confirma y abre la plataforma desde su propio ícono.'];
 dialog.innerHTML=`<button class="buk-close" aria-label="Cerrar" data-buk="close">×</button><h2>${installed()?'Tu próxima junta,<br>a un toque.':'Toda la junta.<br>En una sola app.'}</h2><p>Instala BUKLABS Play con los tres juegos. La instalación se hace una vez en cada dispositivo.</p><div class="buk-tabs" role="group" aria-label="Tu dispositivo">${[['apple','iPhone / iPad'],['android','Android'],['desktop','Computador']].map(([id,title])=>`<button data-buk="tab" data-platform="${id}" class="${id===platform?'active':''}">${title}</button>`).join('')}</div><ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol><p class="buk-note">Abre la app con internet y espera <strong>«Listo sin conexión»</strong> antes de desconectarte. Las partidas se guardan en este dispositivo; no se sincronizan entre equipos.</p><p>Estado: <strong data-offline-state>${api.offlineReady?'Listo sin conexión':api.offlineFailed?'Disponible en línea':'Guardando juegos…'}</strong></p>${installed()?'<p>Esta ventana ya está funcionando como aplicación.</p>':''}<button class="buk-confirm" data-buk="close">Entendido</button>`;
 if(!dialog.open)dialog.showModal();checkOffline();
}
async function install(){window.dispatchEvent(new Event('buk:installing'));if(promptEvent&&!installed()){try{const ev=promptEvent;promptEvent=null;await ev.prompt();await ev.userChoice;}catch{guide();}}else guide();}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;window.dispatchEvent(new Event('buk:installable'));});
window.addEventListener('appinstalled',()=>{promptEvent=null;window.dispatchEvent(new Event('buk:installed'));});
document.addEventListener('click',e=>{const b=e.target.closest('[data-buk]');if(!b)return;if(b.dataset.buk==='close')document.getElementById('buk-install')?.close();else if(b.dataset.buk==='tab')guide(b.dataset.platform);else if(b.dataset.buk==='install')install();});
async function checkOffline(){const worker=navigator.serviceWorker?.controller||registration?.active;if(worker)worker.postMessage({type:'BUK_OFFLINE_STATUS'});}
if('serviceWorker' in navigator&&location.protocol!=='file:'){
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='BUK_OFFLINE_READY')setReady(true);if(e.data?.type==='BUK_OFFLINE_UNAVAILABLE')setReady(false,true);});
 navigator.serviceWorker.addEventListener('controllerchange',checkOffline);
 navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname}).then(r=>{registration=r;return Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),15000))]);}).then(r=>{registration=r;checkOffline();}).catch(()=>setReady(false,true));
}else setReady(false,true);
window.addEventListener('online',()=>{if(registration)registration.update().catch(()=>{});checkOffline();});
window.addEventListener('pageshow',checkOffline);
const game=location.pathname.match(/\/games\/([^/]+)/)?.[1];if(game){try{localStorage.setItem('buklabs-last-game',game);}catch{}}
})();
