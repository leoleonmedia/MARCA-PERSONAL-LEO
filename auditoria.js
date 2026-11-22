/* Mejoras de navegación, leads, consentimiento y trackers opcionales de Leo León Media. */
(function(){'use strict';
const q=(sel,root=document)=>root.querySelector(sel);
const config=window.LEO_INTEGRATIONS||{};
const ENDPOINT='https://script.google.com/macros/s/AKfycbxzSFBamHr8X7wXhZ57ZX3oQLyeZ-CgExZ2CPah4cyRP7SI9xzUuB1QRCvqimxd4WRT/exec';
const SOURCE='leo-leads-sheets';
const phone='51939143052';
const navButton=q('#menuButton'), nav=q('#mainNav');
if(navButton&&nav){
 navButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');navButton.setAttribute('aria-expanded',String(open));navButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
 nav.addEventListener('click',e=>{if(e.target.closest('a')&&nav.classList.contains('open')){nav.classList.remove('open');navButton.setAttribute('aria-expanded','false');}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');navButton.setAttribute('aria-expanded','false');}});
}
// WhatsApp visible sin requerir analítica ni cookies.
if(!q('.audit-wa')){let a=document.createElement('a');a.className='audit-wa';a.href='https://wa.me/'+phone+'?text='+encodeURIComponent('Hola Leo, vengo de Academia Leones Digitales y quiero hacer una consulta.');a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Escribir a Leo León por WhatsApp');a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-.9L3 21l1.9-5.3A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 9.5c.7 3 2.2 4.5 5 5l1.5-1.5"/></svg> WhatsApp';document.body.appendChild(a);}
// Mostrar la política en todos los pies.
document.querySelectorAll('footer').forEach(f=>{if(!f.querySelector('a[href="privacidad.html"]')){let a=document.createElement('a');a.href='privacidad.html';a.textContent='Privacidad';a.style.cssText='color:#d5cdc5;text-decoration:underline;margin-left:12px';f.appendChild(a);}});

// Carga de analytics por consentimiento explícito; todos los IDs vienen vacíos.
const loadScript=(src,attrs={})=>{let s=document.createElement('script');s.async=true;s.src=src;Object.keys(attrs).forEach(k=>s.setAttribute(k,attrs[k]));document.head.appendChild(s);};
let analyticsLoaded=false,marketingLoaded=false;
function enableAnalytics(){if(analyticsLoaded)return;analyticsLoaded=true;
 if(/^GTM-[A-Z0-9]+$/.test(config.gtm||'')) {window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});loadScript('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(config.gtm));}
 else if(/^G-[A-Z0-9]+$/.test(config.ga4||'')){window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',config.ga4,{anonymize_ip:true});loadScript('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4));}
 if(/^[a-z0-9]{6,}$/i.test(config.clarity||'')){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script',config.clarity);}
}
function enableMarketing(){if(marketingLoaded)return;marketingLoaded=true;
 if(/^\d{8,30}$/.test(config.metaPixel||'')){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',config.metaPixel);window.fbq('track','PageView');}
 if(/^[A-Z0-9]{10,30}$/i.test(config.tiktokPixel||'')){!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','grantConsent','revokeConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n='https://analytics.tiktok.com/i18n/pixel/events.js';var a=d.createElement('script');a.type='text/javascript';a.async=true;a.src=n+'?sdkid='+encodeURIComponent(e)+'&lib='+t;var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load(config.tiktokPixel);ttq.page()}(window,document,'ttq');}
}
function consentUI(){let box=document.createElement('aside');box.className='audit-cookie';box.id='audit-cookie';box.setAttribute('aria-label','Preferencias de privacidad');box.innerHTML='<h2>Tu privacidad importa</h2><p>Usamos almacenamiento necesario para recordar tu elección. Si lo autorizas, podremos activar estadísticas y anuncios. No activamos esas herramientas sin tu permiso. <a href="privacidad.html" style="color:#ffad79">Leer política</a>.</p><div class="buttons"><button type="button" data-consent="none">Solo necesarias</button><button type="button" data-consent="analytics">Permitir estadísticas</button><button class="all" type="button" data-consent="all">Aceptar todo</button></div>';document.body.appendChild(box);box.addEventListener('click',e=>{const b=e.target.closest('[data-consent]');if(!b)return;const value=b.dataset.consent;try{localStorage.setItem('leoConsentV1',value)}catch(_){}if(value==='analytics'||value==='all')enableAnalytics();if(value==='all')enableMarketing();box.remove();});}
let consent='';try{consent=localStorage.getItem('leoConsentV1')||''}catch(_){}
if(!consent)consentUI();else {if(consent==='analytics'||consent==='all')enableAnalytics();if(consent==='all')enableMarketing();}

// Utiliza el mismo protocolo de leads de la portada: confirmación SOLO con postMessage válido.
const receiver=document.createElement('iframe');receiver.hidden=true;receiver.name='audit-lead-target';receiver.title='Registro de solicitudes de la Academia';receiver.setAttribute('aria-hidden','true');document.body.appendChild(receiver);
let pending=null;
window.addEventListener('message',event=>{if(!pending||!/^https:\/\/(script\.google\.com|script\.googleusercontent\.com)$/.test(event.origin))return;const data=event.data;if(!data||data.source!==SOURCE||data.codigo!==pending.codigo)return;const st=pending.status;const btn=pending.button;btn.disabled=false;if(data.ok){st.textContent='Registro confirmado. Gracias. Te avisaremos cuando tengamos novedades.';st.style.color='#a1e6ba';}else{st.textContent='El servidor respondió, pero no confirmó el registro. Puedes escribirnos por WhatsApp.';st.style.color='#ffb0a7';}pending=null;});
// El formulario de Academia se controla exclusivamente desde academia.html.
// Invitación no bloqueante para recursos de mayor valor.
const dlg=q('#audit-access-dialog');let pendingHref='';if(dlg){
 document.querySelectorAll('a[data-audit-invite]').forEach(link=>link.addEventListener('click',e=>{if(!dlg.showModal)return;e.preventDefault();pendingHref=link.getAttribute('href');dlg.showModal();}));
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
 const close=q('#audit-access-close');if(close)close.addEventListener('click',()=>dlg.close());
 const go=q('#audit-access-go');if(go)go.addEventListener('click',()=>{window.location.href=pendingHref||'academia.html';});
 const wait=q('#audit-access-wait');if(wait)wait.addEventListener('click',()=>{dlg.close();q('#lista-de-espera')?.scrollIntoView({behavior:'smooth'});});
}
})();
