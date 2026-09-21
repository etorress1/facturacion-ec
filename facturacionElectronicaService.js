const { generarClaveAcceso } = require('./claveAcceso');
const { construirXmlFactura } = require('./xmlBuilder');
const { firmarXml } = require('./firmaElectronica');
const { enviarComprobante, consultarAutorizacion } = require('./soapClient');
const {
  Empresa,
  Establecimiento,
  PuntoEmision,
  Cliente,
  FacturaDetalle,
  ComprobanteSri,
} = require('../../models');

/**
 * Procesa el ciclo electrónico completo de una factura ya creada en la
 * base de datos: genera clave de acceso, arma el XML, lo "firma" (stub) y
 * lo "envía" (stub) al SRI, dejando todo registrado en `comprobantes_sri`.
 *
 * Diseñado para que, cuando conectes un proveedor real de firma y los
 * Web Services del SRI, SOLO tengas que reemplazar el contenido de
 * firmaElectronica.js y soapClient.js — el resto del flujo no cambia.
 */
async function procesarFacturaElectronica(factura) {
  const empresa = await Empresa.findByPk(factura.empresa_id);
  const establecimiento = await Establecimiento.findByPk(factura.establecimiento_id);
  const puntoEmision = await PuntoEmision.findByPk(factura.punto_emision_id);
  const cliente = await Cliente.findByPk(factura.cliente_id);
  const detalles = await FacturaDetalle.findAll({ where: { factura_id: factura.id } });

  const claveAcceso = generarClaveAcceso({
    fechaEmision: factura.fecha_emision,
    tipoComprobante: '01',
    ruc: empresa.ruc,
    ambiente: empresa.ambiente_sri,
    codEstablecimiento: establecimiento.codigo,
    codPuntoEmision: puntoEmision.codigo,
    secuencial: factura.secuencial,
    tipoEmision: empresa.tipo_emision,
  });

  const xmlGenerado = construirXmlFactura({
    empresa,
    establecimiento,
    puntoEmision,
    factura,
    cliente,
    detalles,
    claveAcceso,
  });

  const comprobante = await ComprobanteSri.create({
    factura_id: factura.id,
    clave_acceso: claveAcceso,
    ambiente: empresa.ambiente_sri,
    tipo_emision: empresa.tipo_emision,
    estado: 'GENERADO',
    xml_generado: xmlGenerado,
  });

  // --- Firma (stub hasta conectar un proveedor real) ---
  const { xmlFirmado, firmado, aviso } = await firmarXml(xmlGenerado);
  comprobante.xml_firmado = xmlFirmado;
  comprobante.estado = firmado ? 'FIRMADO' : 'NO_ELECTRONICO';
  comprobante.mensaje_error = firmado ? null : aviso;
  await comprobante.save();

  if (!firmado) {
    // El comprobante queda válido internamente (venta registrada), pero
    // marcado como pendiente de integración real con el SRI.
    return comprobante;
  }

  // --- Envío y autorización (stub hasta conectar el WS real del SRI) ---
  const recepcion = await enviarComprobante(xmlFirmado);
  comprobante.estado = recepcion.estado;
  comprobante.intentos += 1;
  await comprobante.save();

  if (recepcion.estado === 'RECIBIDA') {
    const autorizacion = await consultarAutorizacion(claveAcceso);
    comprobante.estado = autorizacion.estado;
    comprobante.numero_autorizacion = autorizacion.numeroAutorizacion;
    comprobante.fecha_autorizacion = autorizacion.fechaAutorizacion;
    await comprobante.save();
  }

  return comprobante;
}

module.exports = { procesarFacturaElectronica };
