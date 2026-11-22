/** Leo León Media: receptor de leads para Google Sheets.
 * Crea este script desde Extensiones > Apps Script de tu Google Sheet.
 * Implementa como Aplicación web, Ejecutar como: Yo, Acceso: Cualquier persona.
 * NO publiques la hoja de cálculo.
 */
const CONFIG = {
  HOJA: 'Leads',
  ZONA_HORARIA: 'America/Lima',
  ORIGEN_PERMITIDO: 'https://leoleonmedia.github.io',
  // Opcional: cuando hayas SUBIDO cada recurso, agrega la URL real.
  // Ejemplo: pica: 'https://.../pica.pdf' (no inventes enlaces).
  RECURSOS_EMAIL: {
    // ideas: '',
    // pica: '',
    // ganchos: ''
  }
};

function doPost(e) {
  const p = (e && e.parameter) || {};
  const codigo = String(p.codigo || '').slice(0, 80);
  try {
    // Honeypot: descarta envíos de robots.
    if (p.website) return responder_(codigo, false);
    const nombre = seguro_(p.nombre, 90);
    const contacto = seguro_(p.contacto, 160);
    const recurso = seguro_(p.recurso, 200);
    const recursoId = seguro_(p.recurso_id, 100);
    const canal = seguro_(p.canal, 20);
    if (!nombre || !contacto || !recurso || !['email','whatsapp','instagram'].includes(canal) || p.consentimiento_recurso !== 'sí') {
      return responder_(codigo, false);
    }
    if (canal === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto)) return responder_(codigo, false);
    // WhatsApp: permitir solo un número internacional completo en formato E.164.
    if (canal === 'whatsapp' && !/^\+[1-9]\d{7,14}$/.test(contacto)) return responder_(codigo, false);

    const libro = SpreadsheetApp.getActiveSpreadsheet();
    if (!libro) throw new Error('Abre el script desde tu Google Sheets');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let hoja;
    try {
      hoja = libro.getSheetByName(CONFIG.HOJA) || libro.insertSheet(CONFIG.HOJA);
      if (hoja.getLastRow() === 0) {
        hoja.appendRow(['Fecha Perú','Código','Nombre','Contacto','Canal','Recurso','ID recurso','Palabra clave','Perfil','País','Prefijo telefónico','Consentimiento recurso','Consentimiento marketing','Origen','Entrega email']);
        hoja.setFrozenRows(1);
      }
      // Deduplicar por código si el visitante reintenta el envío.
      const last = hoja.getLastRow();
      if (last > 1 && codigo) {
        const existing = hoja.getRange(2,2,last-1,1).createTextFinder(codigo).matchEntireCell(true).findNext();
        if (existing) return responder_(codigo, true);
      }
      // Fecha y hora de Perú: 15/11/2026 10:23:52 pm.
      const fecha = Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, 'dd/MM/yyyy hh:mm:ss a').replace(/\b(AM|PM)\b/gi, m => m.toLowerCase());
      const link = CONFIG.RECURSOS_EMAIL[recursoId] || '';
      // El correo solo se marca como entregado después de que MailApp lo envíe.
      let estado = canal === 'email' ? 'Pendiente de configurar enlace' :
        canal === 'whatsapp' ? 'Contacto WhatsApp registrado; sin mensaje automático' : 'Se entrega por DM';
      if (canal === 'email' && link) {
        try {
          MailApp.sendEmail({
            to: contacto,
            subject: 'Tu recurso gratuito: '+recurso,
            body: 'Hola '+nombre+',\n\nAquí está el recurso que solicitaste: '+recurso+'\n'+link+'\n\nLeo León Media'
          });
          estado = 'Correo enviado';
        } catch (mailErr) {
          estado = 'No enviado: revisar Apps Script';
        }
      }
      // Establecer texto plano evita que Sheets reinterprete el formato de fecha.
      hoja.getRange(hoja.getLastRow() + 1, 1).setNumberFormat('@');
      hoja.appendRow([fecha,codigo,formulaSafe_(nombre),formulaSafe_(contacto),canal,formulaSafe_(recurso),recursoId,seguro_(p.palabra_clave,30),seguro_(p.perfil,60),seguro_(p.pais,80),seguro_(p.prefijo_telefonico,12),'sí',p.consentimiento_marketing==='sí'?'sí':'no',seguro_(p.origen,80),estado]);
    } finally { lock.releaseLock(); }
    return responder_(codigo, true, estado);
  } catch (err) {
    console.error('Error lead: '+String(err));
    return responder_(codigo, false);
  }
}
function seguro_(value, max) {
  return String(value || '').trim().slice(0, max);
}
function formulaSafe_(value) {
  // Evita que un contacto suministrado por terceros se ejecute como fórmula en Sheets.
  const x = String(value || '');
  return /^[=+\-@\t\r]/.test(x) ? "'"+x : x;
}
function responder_(codigo, ok, entrega) {
  // El mensaje confirma la escritura solo si el servidor completó el proceso.
  const data = JSON.stringify({source:'leo-leads-sheets',codigo:String(codigo),ok:Boolean(ok),entrega:String(entrega||'')}).replace(/</g,'\\u003c');
  const html = '<!doctype html><html><body><script>window.parent.postMessage('+data+', '+JSON.stringify(CONFIG.ORIGEN_PERMITIDO)+');<\\/script></body></html>';
  return HtmlService.createHtmlOutput(html.replace('<\\/script>', '</script>'));
}


/** Consulta de confirmación para formularios enviados mediante iframe.
 * Devuelve únicamente si existe el código generado para el registro.
 * No expone nombres, teléfonos ni correos.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  const codigo = String(p.codigo || '').slice(0, 80);
  if (p.accion !== 'estado' || !/^leoEstado_[A-Za-z0-9_]{8,90}$/.test(callback) || !/^LD-[A-Z0-9-]{8,70}$/.test(codigo)) {
    return ContentService.createTextOutput('/* Solicitud no válida */').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  let guardado = false;
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = libro && libro.getSheetByName(CONFIG.HOJA);
    if (hoja && hoja.getLastRow() > 1) {
      guardado = !!hoja.getRange(2, 2, hoja.getLastRow() - 1, 1)
        .createTextFinder(codigo).matchEntireCell(true).findNext();
    }
  } catch (err) { console.error('Error consultando estado: ' + String(err)); }
  const salida = callback + '(' + JSON.stringify({codigo: codigo, guardado: guardado}) + ');';
  return ContentService.createTextOutput(salida).setMimeType(ContentService.MimeType.JAVASCRIPT);
}
