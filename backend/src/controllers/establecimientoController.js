const { Establecimiento, PuntoEmision, Secuencial } = require('../models');

async function listar(req, res) {
  const establecimientos = await Establecimiento.findAll({
    where: { empresa_id: req.empresaId },
    include: [{ model: PuntoEmision }],
    order: [['codigo', 'ASC']],
  });
  res.json(establecimientos);
}

async function crear(req, res) {
  const { codigo, nombre, direccion } = req.body;
  if (!codigo || !nombre || !direccion) {
    return res.status(400).json({ error: 'codigo, nombre y direccion son requeridos' });
  }
  const establecimiento = await Establecimiento.create({ empresa_id: req.empresaId, codigo, nombre, direccion });
  res.status(201).json(establecimiento);
}

async function crearPuntoEmision(req, res) {
  const establecimiento = await Establecimiento.findOne({
    where: { id: req.params.establecimientoId, empresa_id: req.empresaId },
  });
  if (!establecimiento) return res.status(404).json({ error: 'Establecimiento no encontrado' });

  const { codigo, descripcion } = req.body;
  if (!codigo || !descripcion) return res.status(400).json({ error: 'codigo y descripcion son requeridos' });

  const puntoEmision = await PuntoEmision.create({ establecimiento_id: establecimiento.id, codigo, descripcion });

  await Promise.all(
    ['01', '03', '04', '05', '06', '07'].map((tipo) =>
      Secuencial.create({ punto_emision_id: puntoEmision.id, tipo_comprobante: tipo, secuencial_actual: 0 })
    )
  );

  res.status(201).json(puntoEmision);
}

module.exports = { listar, crear, crearPuntoEmision };
