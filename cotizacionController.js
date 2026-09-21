const { sequelize, Cotizacion, CotizacionDetalle, Producto, Cliente } = require('../models');
const { calcularTotales } = require('../utils/calculos');

async function listar(req, res) {
  const cotizaciones = await Cotizacion.findAll({
    where: { empresa_id: req.empresaId },
    include: [{ model: Cliente, attributes: ['id', 'razon_social', 'identificacion'] }],
    order: [['fecha_emision', 'DESC']],
  });
  res.json(cotizaciones);
}

async function obtener(req, res) {
  const cotizacion = await Cotizacion.findOne({
    where: { id: req.params.id, empresa_id: req.empresaId },
    include: [
      { model: Cliente },
      { model: CotizacionDetalle, as: 'detalles', include: [{ model: Producto }] },
    ],
  });
  if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
  res.json(cotizacion);
}

async function siguienteNumero(empresaId) {
  const ultima = await Cotizacion.findOne({
    where: { empresa_id: empresaId },
    order: [['id', 'DESC']],
  });
  const siguiente = ultima ? ultima.id + 1 : 1;
  return `COT-${String(siguiente).padStart(6, '0')}`;
}

async function crear(req, res) {
  const { establecimiento_id, cliente_id, fecha_validez, observaciones, items } = req.body;

  if (!establecimiento_id || !cliente_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'establecimiento_id, cliente_id e items son requeridos' });
  }

  const productos = await Producto.findAll({
    where: { id: items.map((i) => i.producto_id), empresa_id: req.empresaId },
  });
  const mapaProductos = Object.fromEntries(productos.map((p) => [p.id, p]));

  const lineas = items.map((i) => {
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

  const totales = calcularTotales(lineas);
  const numero = await siguienteNumero(req.empresaId);

  const resultado = await sequelize.transaction(async (t) => {
    const cotizacion = await Cotizacion.create(
      {
        empresa_id: req.empresaId,
        establecimiento_id,
        cliente_id,
        usuario_id: req.user.id,
        numero,
        fecha_emision: new Date(),
        fecha_validez: fecha_validez || null,
        subtotal_0: totales.subtotal_0,
        subtotal_iva: totales.subtotal_iva,
        descuento: totales.total_descuento,
        valor_iva: totales.valor_iva,
        total: totales.total,
        observaciones,
      },
      { transaction: t }
    );

    await CotizacionDetalle.bulkCreate(
      totales.detalles.map((d) => ({ ...d, cotizacion_id: cotizacion.id })),
      { transaction: t }
    );

    return cotizacion;
  });

  res.status(201).json(resultado);
}

async function cambiarEstado(req, res) {
  const cotizacion = await Cotizacion.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });

  const estadosValidos = ['BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'ANULADA'];
  if (!estadosValidos.includes(req.body.estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  cotizacion.estado = req.body.estado;
  await cotizacion.save();
  res.json(cotizacion);
}

module.exports = { listar, obtener, crear, cambiarEstado };
