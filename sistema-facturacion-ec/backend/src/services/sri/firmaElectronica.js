/**
 * FIRMA ELECTRÓNICA XAdES-BES
 * =====================================================================
 * El SRI exige que cada comprobante XML sea firmado digitalmente con un
 * certificado de firma electrónica (.p12/.pfx) emitido por una entidad
 * autorizada en Ecuador (Security Data, Uanataca, Banco Central del
 * Ecuador, ANF AC Ecuador, Consejo de la Judicatura, etc.) usando el
 * estándar XAdES-BES.
 *
 * Este archivo es un STUB intencional: firmar XML con XAdES-BES requiere
 * una librería especializada (por ejemplo `node-signpdf` no aplica; para
 * XML se usa típicamente una librería como `xml-crypto` combinada con
 * lógica XAdES, o un microservicio en Java/Python ya probado, por ejemplo
 * usando Apache Santuario o una librería madura de firma XAdES).
 *
 * QUÉ HACER CUANDO SE IMPLEMENTE:
 *   1. Instalar una librería de firma XAdES-BES confiable y mantenida.
 *   2. Cargar el certificado desde `certificados_firma.ruta_archivo`
 *      (nunca subir el .p12 al repositorio ni a control de versiones).
 *   3. Descifrar `password_cifrado` usando APP_MASTER_KEY (ver utils/crypto.js).
 *   4. Firmar el XML generado por xmlBuilder.js y devolver el XML firmado.
 *   5. Actualizar comprobantes_sri.estado a 'FIRMADO' y guardar xml_firmado.
 *
 * Mientras tanto, esta función simula el firmado para que el flujo
 * completo (generar → "firmar" → enviar) se pueda probar de punta a punta
 * en modo local, dejando claro en el estado que NO es una firma real.
 */
async function firmarXml(xmlSinFirmar /*, certificadoConfig */) {
  return {
    xmlFirmado: xmlSinFirmar,
    firmado: false,
    aviso:
      'Firma simulada: conecta un proveedor de firma XAdES-BES real antes de enviar al SRI en producción.',
  };
}

module.exports = { firmarXml };
