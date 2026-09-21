const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

async function listar(req, res) {
  const where = {};
  if (req.user.rol !== 'super_admin') where.empresa_id = req.empresaId;
  else if (req.empresaId) where.empresa_id = req.empresaId;

  const usuarios = await Usuario.findAll({
    where,
    attributes: { exclude: ['password_hash'] },
    order: [['nombres', 'ASC']],
  });
  res.json(usuarios);
}

async function crear(req, res) {
  const { nombres, apellidos, email, password, rol, establecimiento_id } = req.body;

  if (!nombres || !apellidos || !email || !password) {
    return res.status(400).json({ error: 'nombres, apellidos, email y password son requeridos' });
  }

  // Un "admin" solo puede crear usuarios "trabajador" dentro de su propio negocio.
  let rolFinal = rol || 'trabajador';
  let empresaId = req.empresaId;
  if (req.user.rol === 'admin') {
    rolFinal = 'trabajador';
    empresaId = req.user.empresa_id;
  }
  if (req.user.rol === 'super_admin' && rolFinal !== 'super_admin' && !empresaId) {
    return res.status(400).json({ error: 'Indica x-empresa-id para crear admin/trabajador' });
  }

  const existente = await Usuario.findOne({ where: { email } });
  if (existente) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    nombres,
    apellidos,
    email,
    password_hash,
    rol: rolFinal,
    empresa_id: rolFinal === 'super_admin' ? null : empresaId,
    establecimiento_id: establecimiento_id || null,
  });

  const { password_hash: _omit, ...usuarioSinPassword } = usuario.toJSON();
  res.status(201).json(usuarioSinPassword);
}

async function actualizar(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (req.user.rol !== 'super_admin' && usuario.empresa_id !== req.empresaId) {
    return res.status(403).json({ error: 'No puedes editar usuarios de otro negocio' });
  }

  const campos = ['nombres', 'apellidos', 'establecimiento_id', 'activo'];
  campos.forEach((c) => {
    if (req.body[c] !== undefined) usuario[c] = req.body[c];
  });

  // Solo super_admin/admin pueden cambiar rol, y admin nunca puede crear otro admin/super_admin.
  if (req.body.rol && req.user.rol === 'super_admin') {
    usuario.rol = req.body.rol;
  }

  if (req.body.password) {
    usuario.password_hash = await bcrypt.hash(req.body.password, 10);
  }

  await usuario.save();
  const { password_hash: _omit, ...usuarioSinPassword } = usuario.toJSON();
  res.json(usuarioSinPassword);
}

module.exports = { listar, crear, actualizar };
