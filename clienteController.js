const { Cliente } = require('../models');
const { Op } = require('sequelize');

async function listar(req, res) {
  const { q } = req.query;
  const where = { empresa_id: req.empresaId };
  if (q) {
    where[Op.or] = [
      { razon_social: { [Op.like]: `%${q}%` } },
      { identificacion: { [Op.like]: `%${q}%` } },
    ];
  }
  const clientes = await Cliente.findAll({ where, order: [['razon_social', 'ASC']] });
  res.json(clientes);
}

async function obtener(req, res) {
  const cliente = await Cliente.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
}

async function crear(req, res) {
  const { tipo_identificacion, identificacion, razon_social, direccion, telefono, email } = req.body;
  if (!identificacion || !razon_social) {
    return res.status(400).json({ error: 'identificacion y razon_social son requeridos' });
  }
  const cliente = await Cliente.create({
    empresa_id: req.empresaId,
    tipo_identificacion: tipo_identificacion || '05',
    identificacion,
    razon_social,
    direccion,
    telefono,
    email,
  });
  res.status(201).json(cliente);
}

async function actualizar(req, res) {
  const cliente = await Cliente.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  ['tipo_identificacion', 'identificacion', 'razon_social', 'direccion', 'telefono', 'email', 'activo'].forEach((c) => {
    if (req.body[c] !== undefined) cliente[c] = req.body[c];
  });
  await cliente.save();
  res.json(cliente);
}

module.exports = { listar, obtener, crear, actualizar };
