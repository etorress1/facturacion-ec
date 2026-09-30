/**
 * CLIENTE DE WEB SERVICES DEL SRI (Recepción y Autorización)
 * =====================================================================
 * El SRI expone dos Web Services SOAP:
 *   - Recepción:    recibe el XML firmado y responde si fue RECIBIDA o DEVUELTA.
 *   - Autorización: consultado con la clave de acceso, responde AUTORIZADO
 *                   o NO AUTORIZADO, y entrega el número/fecha de autorización.
 *
 * Las URLs (ambiente de pruebas y producción) están en el .env
 * (SRI_WS_RECEPCION_*, SRI_WS_AUTORIZACION_*) — **verifícalas siempre
 * contra la Ficha Técnica vigente del SRI**, ya que el organismo puede
 * actualizar sus endpoints.
 *
 * Este archivo es un STUB: para conectarlo de verdad instala un cliente
 * SOAP para Node (por ejemplo `strong-soap` o `soap`) y reemplaza las
 * funciones de abajo por las llamadas reales a `RecepcionComprobantes` /
 * `autorizacionComprobante`.
 */

async function enviarComprobante(xmlFirmadoBase64) {
  // Simulación de la respuesta de Recepción mientras se conecta el WS real.
  return {
    estado: 'RECIBIDA',
    mensajes: [],
    simulado: true,
  };
}

async function consultarAutorizacion(claveAcceso) {
  // Simulación de la respuesta de Autorización mientras se conecta el WS real.
  return {
    estado: 'NO_ELECTRONICO',
    numeroAutorizacion: null,
    fechaAutorizacion: null,
    mensajes: [
      'Integración SRI no conectada todavía. Configura firmaElectronica.js y soapClient.js con credenciales reales.',
    ],
    simulado: true,
  };
}

module.exports = { enviarComprobante, consultarAutorizacion };
