const {
  sequelize, Factura, FacturaDetalle, Producto, Cliente, Cotizacion,
  CotizacionDetalle, PuntoEmision, Secuencial, ComprobanteSri,
} = require('../models');
const { calcularTotales } = require('../utils/calculos');
const { procesarFacturaElectronica } = require('../services/sri/facturacionElectronicaService');

async function listar(req, res) {
  const facturas = await Factura.findAll({
    where: { empresa_id: req.empresaId },
    include: [
      { model: Cliente, attributes: ['id', 'razon_social', 'identificacion'] },
      { model: ComprobanteSri, as: 'comprobanteSri', attributes: ['estado', 'clave_acceso', 'numero_autorizacion'] },
    ],
    order: [['fecha_emision', 'DESC']],
  });
  res.json(facturas);
}

async function obtener(req, res) {
  const factura = await Factura.findOne({
    where: { id: req.params.id, empresa_id: req.empresaId },
    include: [
      { model: Cliente },
      { model: FacturaDetalle, as: 'detalles', include: [{ model: Producto }] },
      { model: ComprobanteSri, as: 'comprobanteSri' },
    ],
  });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json(factura);
}

async function obtenerSiguienteSecuencial(puntoEmisionId, tipoComprobante, t) {
  const [secuencial] = await Secuencial.findOrCreate({
    where: { punto_emision_id: puntoEmisionId, tipo_comprobante: tipoComprobante },
    defaults: { secuencial_actual: 0 },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  secuencial.secuencial_actual += 1;
  await secuencial.save({ transaction: t });
  return String(secuencial.secuencial_actual).padStart(9, '0');
}

/**
 * Crea una factura directamente (items en el body) o a partir de una
 * cotización existente (cotizacion_id), copiando su detalle.
 */
async function crear(req, res) {
  const { punto_emision_id, cliente_id, forma_pago_codigo, observaciones, cotizacion_id } = req.body;
  let { items } = req.body;

  if (!punto_emision_id) return res.status(400).json({ error: 'punto_emision_id es requerido' });

  const puntoEmision = await PuntoEmision.findByPk(punto_emision_id);
  if (!puntoEmision) return res.status(404).json({ error: 'Punto de emisión no encontrado' });

  let clienteIdFinal = cliente_id;
  let cotizacion = null;

  if (cotizacion_id) {
    cotizacion = await Cotizacion.findOne({
      where: { id: cotizacion_id, empresa_id: req.empresaId },
      include: [{ model: CotizacionDetalle, as: 'detalles' }],
    });
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    clienteIdFinal = cotizacion.cliente_id;
    items = cotizacion.detalles.map((d) => ({
      producto_id: d.producto_id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      descuento: d.descuento,
      porcentaje_iva: d.porcentaje_iva,
    }));
  }

  if (!clienteIdFinal || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'cliente_id e items (o cotizacion_id) son requeridos' });
  }

  if (!cotizacion) {
    const productos = await Producto.findAll({
      where: { id: items.map((i) => i.producto_id), empresa_id: req.empresaId },
    });
    const mapaProductos = Object.fromEntries(productos.map((p) => [p.id, p]));
    items = items.map((i) => {
      const producto = mapaProductos[i.producto_id];
      if (!producto) throw new Error(`Producto ${i.producto_id} no pertenece a este negocio`);
      return {
        producto_id: producto.id,
        descripcion: producto.nombre,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario ?? producto.precio_unitario,
        descuento: i.descuento || 0,
        porcentaje_iva: producto.porcentaje_iva,
      };
    });
  }

  const totales = calcularTotales(items);

  const resultado = await sequelize.transaction(async (t) => {
    const secuencial = await obtenerSiguienteSecuencial(punto_emision_id, '01', t);

    const factura = await Factura.create(
      {
        empresa_id: req.empresaId,
        establecimiento_id: puntoEmision.establecimiento_id,
        punto_emision_id,
        cotizacion_id: cotizacion ? cotizacion.id : null,
        cliente_id: clienteIdFinal,
        usuario_id: req.user.id,
        secuencial,
        fecha_emision: new Date(),
        subtotal_0: totales.subtotal_0,
        subtotal_iva: totales.subtotal_iva,
        total_descuento: totales.total_descuento,
        valor_iva: totales.valor_iva,
        total: totales.total,
        forma_pago_codigo: forma_pago_codigo || '01',
        estado: 'EMITIDA',
        observaciones,
      },
      { transaction: t }
    );

    await FacturaDetalle.bulkCreate(
      totales.detalles.map((d) => ({ ...d, factura_id: factura.id })),
      { transaction: t }
    );

    if (cotizacion) {
      cotizacion.estado = 'CONVERTIDA';
      cotizacion.factura_id = factura.id;
      await cotizacion.save({ transaction: t });
    }

    return factura;
  });

  res.status(201).json(resultado);
}

// Dispara el ciclo electrónico: clave de acceso + XML + firma + envío al SRI.
async function emitirSri(req, res) {
  const factura = await Factura.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

  const existente = await ComprobanteSri.findOne({ where: { factura_id: factura.id } });
  if (existente) {
    return res.status(409).json({ error: 'Esta factura ya tiene un comprobante SRI generado', comprobante: existente });
  }

  try {
    const comprobante = await procesarFacturaElectronica(factura);
    res.status(201).json(comprobante);
  } catch (err) {
    res.status(500).json({ error: 'Error procesando el comprobante electrónico', detalle: err.message });
  }
}

async function anular(req, res) {
  const factura = await Factura.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  factura.estado = 'ANULADA';
  await factura.save();
  res.json(factura);
}

module.exports = { listar, obtener, crear, emitirSri, anular };
