const { create } = require('xmlbuilder2');

/**
 * Construye el XML de una FACTURA (comprobante 01) en la estructura general
 * que exige el SRI: infoTributaria, infoFactura, detalles e infoAdicional.
 *
 * NOTA DE IMPLEMENTACIÓN: esta función arma el documento con los campos
 * más comunes. Antes de emitir en PRODUCCIÓN debes:
 *   1. Validar el XML resultante contra el XSD oficial de factura
 *      (versión vigente) publicado en el portal de Facturación Electrónica del SRI.
 *   2. Completar campos opcionales que apliquen a tu negocio (ej. compensaciones,
 *      retenciones informativas, agente de percepción, comercio exterior, etc.).
 *   3. Firmar el XML resultante con el certificado .p12 (formato XAdES-BES)
 *      antes de enviarlo al Web Service de Recepción — ver services/sri/firmaElectronica.js
 */
function construirXmlFactura({ empresa, establecimiento, puntoEmision, factura, cliente, detalles, claveAcceso }) {
  const fecha = new Date(factura.fecha_emision);
  const fechaEmisionStr = `${String(fecha.getDate()).padStart(2, '0')}/${String(
    fecha.getMonth() + 1
  ).padStart(2, '0')}/${fecha.getFullYear()}`;

  const totalConImpuestos = {
    totalImpuesto: {
      codigo: '2', // 2 = IVA
      codigoPorcentaje: obtenerCodigoPorcentajeIva(detalles),
      baseImponible: factura.subtotal_iva.toFixed(2),
      valor: factura.valor_iva.toFixed(2),
    },
  };

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('factura', { id: 'comprobante', version: '1.1.0' })
    .ele('infoTributaria')
      .ele('ambiente').txt(empresa.ambiente_sri === 'PRODUCCION' ? '2' : '1').up()
      .ele('tipoEmision').txt(empresa.tipo_emision === 'CONTINGENCIA' ? '2' : '1').up()
      .ele('razonSocial').txt(empresa.razon_social).up()
      .ele('nombreComercial').txt(empresa.nombre_comercial || empresa.razon_social).up()
      .ele('ruc').txt(empresa.ruc).up()
      .ele('claveAcceso').txt(claveAcceso).up()
      .ele('codDoc').txt('01').up()
      .ele('estab').txt(establecimiento.codigo).up()
      .ele('ptoEmi').txt(puntoEmision.codigo).up()
      .ele('secuencial').txt(factura.secuencial).up()
      .ele('dirMatriz').txt(empresa.direccion_matriz).up()
    .up()
    .ele('infoFactura')
      .ele('fechaEmision').txt(fechaEmisionStr).up()
      .ele('dirEstablecimiento').txt(establecimiento.direccion).up()
      .ele('obligadoContabilidad').txt(empresa.obligado_contabilidad).up()
      .ele('tipoIdentificacionComprador').txt(cliente.tipo_identificacion).up()
      .ele('razonSocialComprador').txt(cliente.razon_social).up()
      .ele('identificacionComprador').txt(cliente.identificacion).up()
      .ele('direccionComprador').txt(cliente.direccion || 'S/N').up()
      .ele('totalSinImpuestos').txt((factura.subtotal_0 + factura.subtotal_iva).toFixed(2)).up()
      .ele('totalDescuento').txt(factura.total_descuento.toFixed(2)).up()
      .ele('totalConImpuestos')
        .ele('totalImpuesto')
          .ele('codigo').txt(totalConImpuestos.totalImpuesto.codigo).up()
          .ele('codigoPorcentaje').txt(totalConImpuestos.totalImpuesto.codigoPorcentaje).up()
          .ele('baseImponible').txt(totalConImpuestos.totalImpuesto.baseImponible).up()
          .ele('valor').txt(totalConImpuestos.totalImpuesto.valor).up()
        .up()
      .up()
      .ele('propina').txt((factura.propina || 0).toFixed(2)).up()
      .ele('importeTotal').txt(factura.total.toFixed(2)).up()
      .ele('moneda').txt('DOLAR').up()
      .ele('pagos')
        .ele('pago')
          .ele('formaPago').txt(factura.forma_pago_codigo).up()
          .ele('total').txt(factura.total.toFixed(2)).up()
        .up()
      .up()
    .up();

  const detallesEle = doc.ele('detalles');
  detalles.forEach((d) => {
    const valorIva = Number(d.valor_iva || 0);
    const detEle = detallesEle
      .ele('detalle')
        .ele('codigoPrincipal').txt(d.codigo_principal || String(d.producto_id)).up()
        .ele('descripcion').txt(d.descripcion).up()
        .ele('cantidad').txt(Number(d.cantidad).toFixed(2)).up()
        .ele('precioUnitario').txt(Number(d.precio_unitario).toFixed(4)).up()
        .ele('descuento').txt(Number(d.descuento || 0).toFixed(2)).up()
        .ele('precioTotalSinImpuesto').txt(Number(d.subtotal).toFixed(2)).up()
        .ele('impuestos')
          .ele('impuesto')
            .ele('codigo').txt('2').up()
            .ele('codigoPorcentaje').txt(d.porcentaje_iva > 0 ? '2' : '0').up()
            .ele('tarifa').txt(Number(d.porcentaje_iva).toFixed(2)).up()
            .ele('baseImponible').txt(Number(d.subtotal).toFixed(2)).up()
            .ele('valor').txt(valorIva.toFixed(2)).up()
          .up()
        .up()
      .up();
  });

  doc
    .ele('infoAdicional')
      .ele('campoAdicional', { nombre: 'email' }).txt(cliente.email || '').up()
      .ele('campoAdicional', { nombre: 'telefono' }).txt(cliente.telefono || '').up()
    .up();

  return doc.end({ prettyPrint: true });
}

// El código de porcentaje de IVA en el catálogo SRI: 0 = 0%, 2 = tarifa vigente (ej. 15%),
// 6 = No objeto de impuesto, 7 = Exento de IVA. Aquí se infiere de los detalles.
function obtenerCodigoPorcentajeIva(detalles) {
  const tieneIva = detalles.some((d) => Number(d.porcentaje_iva) > 0);
  return tieneIva ? '2' : '0';
}

module.exports = { construirXmlFactura };
