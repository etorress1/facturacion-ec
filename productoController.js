const { Producto, CategoriaProducto } = require('../models');
const { Op } = require('sequelize');

async function listar(req, res) {
  const { q } = req.query;
  const where = { empresa_id: req.empresaId };
  if (q) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${q}%` } },
      { codigo_principal: { [Op.like]: `%${q}%` } },
    ];
  }
  const productos = await Producto.findAll({
    where,
    include: [{ model: CategoriaProducto, attributes: ['id', 'nombre'] }],
    order: [['nombre', 'ASC']],
  });
  res.json(productos);
}

async function crear(req, res) {
  const {
    categoria_id, codigo_principal, codigo_auxiliar, nombre, descripcion,
    tipo, precio_unitario, porcentaje_iva, unidad_medida, maneja_inventario, stock_actual,
  } = req.body;

  if (!codigo_principal || !nombre || precio_unitario === undefined) {
    return res.status(400).json({ error: 'codigo_principal, nombre y precio_unitario son requeridos' });
  }

  const producto = await Producto.create({
    empresa_id: req.empresaId,
    categoria_id: categoria_id || null,
    codigo_principal,
    codigo_auxiliar,
    nombre,
    descripcion,
    tipo: tipo || 'BIEN',
    precio_unitario,
    porcentaje_iva: porcentaje_iva !== undefined ? porcentaje_iva : 15.0,
    unidad_medida: unidad_medida || 'UNIDAD',
    maneja_inventario: !!maneja_inventario,
    stock_actual: stock_actual || 0,
  });
  res.status(201).json(producto);
}

async function actualizar(req, res) {
  const producto = await Producto.findOne({ where: { id: req.params.id, empresa_id: req.empresaId } });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  [
    'categoria_id', 'codigo_principal', 'codigo_auxiliar', 'nombre', 'descripcion', 'tipo',
    'precio_unitario', 'porcentaje_iva', 'unidad_medida', 'maneja_inventario', 'stock_actual', 'activo',
  ].forEach((c) => {
    if (req.body[c] !== undefined) producto[c] = req.body[c];
  });

  await producto.save();
  res.json(producto);
}

module.exports = { listar, crear, actualizar };
