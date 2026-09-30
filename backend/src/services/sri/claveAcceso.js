/**
 * Generación de la Clave de Acceso del SRI (Ecuador) - 49 dígitos.
 *
 * Estructura (48 dígitos + 1 dígito verificador):
 *   1-8   Fecha de emisión ddmmaaaa
 *   9-10  Tipo de comprobante (01 Factura, 03 Liq. compra, 04 N/C, 05 N/D, 06 Guía remisión, 07 Retención)
 *   11-23 RUC del emisor (13 dígitos)
 *   24    Tipo de ambiente (1 Pruebas, 2 Producción)
 *   25-30 Serie: establecimiento (3) + punto de emisión (3)
 *   31-39 Número secuencial (9 dígitos)
 *   40-47 Código numérico (8 dígitos, aleatorio, permite identificar el comprobante)
 *   48    Tipo de emisión (1 Normal, 2 Contingencia)
 *   49    Dígito verificador (algoritmo Módulo 11)
 *
 * IMPORTANTE: antes de usar esto en producción, valida esta estructura contra
 * la Ficha Técnica de Comprobantes Electrónicos vigente publicada por el SRI,
 * ya que la normativa técnica puede actualizarse.
 */

function pad(numero, longitud) {
  return String(numero).padStart(longitud, '0');
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  const dd = pad(d.getDate(), 2);
  const mm = pad(d.getMonth() + 1, 2);
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function generarCodigoNumerico() {
  return pad(Math.floor(Math.random() * 100000000), 8);
}

/**
 * Calcula el dígito verificador Módulo 11 usado por el SRI.
 * Se multiplica cada dígito (de derecha a izquierda) por una serie
 * cíclica de coeficientes 2,3,4,5,6,7 y se calcula el residuo.
 */
function digitoVerificadorModulo11(cuerpo48) {
  const coeficientes = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  let coefIndex = 0;

  for (let i = cuerpo48.length - 1; i >= 0; i--) {
    const digito = parseInt(cuerpo48[i], 10);
    suma += digito * coeficientes[coefIndex];
    coefIndex = (coefIndex + 1) % coeficientes.length;
  }

  const modulo = suma % 11;
  let verificador = 11 - modulo;
  if (verificador === 11) verificador = 0;
  if (verificador === 10) verificador = 1;
  return verificador;
}

/**
 * @param {Object} datos
 * @param {Date|string} datos.fechaEmision
 * @param {string} datos.tipoComprobante  ej. '01'
 * @param {string} datos.ruc              13 dígitos
 * @param {'PRUEBAS'|'PRODUCCION'} datos.ambiente
 * @param {string} datos.codEstablecimiento 3 dígitos
 * @param {string} datos.codPuntoEmision    3 dígitos
 * @param {number|string} datos.secuencial  hasta 9 dígitos
 * @param {'NORMAL'|'CONTINGENCIA'} datos.tipoEmision
 * @returns {string} clave de acceso de 49 dígitos
 */
function generarClaveAcceso(datos) {
  const fecha = formatearFecha(datos.fechaEmision);
  const tipoComprobante = pad(datos.tipoComprobante, 2);
  const ruc = datos.ruc.padStart(13, '0');
  const ambiente = datos.ambiente === 'PRODUCCION' ? '2' : '1';
  const serie = pad(datos.codEstablecimiento, 3) + pad(datos.codPuntoEmision, 3);
  const secuencial = pad(datos.secuencial, 9);
  const codigoNumerico = generarCodigoNumerico();
  const tipoEmision = datos.tipoEmision === 'CONTINGENCIA' ? '2' : '1';

  const cuerpo48 =
    fecha + tipoComprobante + ruc + ambiente + serie + secuencial + codigoNumerico + tipoEmision;

  if (cuerpo48.length !== 48) {
    throw new Error(`La clave de acceso debe tener 48 dígitos antes del verificador (tiene ${cuerpo48.length})`);
  }

  const verificador = digitoVerificadorModulo11(cuerpo48);
  return cuerpo48 + verificador;
}

module.exports = { generarClaveAcceso, digitoVerificadorModulo11 };
