/**
 * Calcula subtotal 0%, subtotal gravado con IVA, descuento total, valor de
 * IVA y total general a partir de un arreglo de líneas de detalle.
 * Cada línea debe tener: cantidad, precio_unitario, descuento (valor, no %),
 * porcentaje_iva (ej. 15, 0).
 */
function calcularTotales(lineas) {
  let subtotal0 = 0;
  let subtotalIva = 0;
  let totalDescuento = 0;
  let valorIva = 0;

  const detallesCalculados = lineas.map((linea) => {
    const cantidad = Number(linea.cantidad);
    const precio = Number(linea.precio_unitario);
    const descuento = Number(linea.descuento || 0);
    const porcentajeIva = Number(linea.porcentaje_iva || 0);

    const subtotalLinea = cantidad * precio - descuento;
    const ivaLinea = porcentajeIva > 0 ? subtotalLinea * (porcentajeIva / 100) : 0;

    if (porcentajeIva > 0) {
      subtotalIva += subtotalLinea;
    } else {
      subtotal0 += subtotalLinea;
    }
    totalDescuento += descuento;
    valorIva += ivaLinea;

    return {
      ...linea,
      subtotal: round2(subtotalLinea),
      valor_iva: round2(ivaLinea),
    };
  });

  const total = subtotal0 + subtotalIva + valorIva;

  return {
    detalles: detallesCalculados,
    subtotal_0: round2(subtotal0),
    subtotal_iva: round2(subtotalIva),
    total_descuento: round2(totalDescuento),
    valor_iva: round2(valorIva),
    total: round2(total),
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { calcularTotales, round2 };
