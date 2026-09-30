const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Empresa } = require('../models');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  const usuario = await Usuario.findOne({ where: { email, activo: true } });
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  usuario.ultimo_login = new Date();
  await usuario.save();

  const payload = {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    email: usuario.email,
    rol: usuario.rol,
    empresa_id: usuario.empresa_id,
    establecimiento_id: usuario.establecimiento_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  let empresa = null;
  if (usuario.empresa_id) {
    empresa = await Empresa.findByPk(usuario.empresa_id, {
      attributes: ['id', 'razon_social', 'nombre_comercial', 'ruc', 'ambiente_sri', 'logo_path'],
    });
  }

  res.json({ token, usuario: payload, empresa });
}

async function me(req, res) {
  const usuario = await Usuario.findByPk(req.user.id, {
    attributes: ['id', 'nombres', 'apellidos', 'email', 'rol', 'empresa_id', 'establecimiento_id'],
  });
  res.json({ usuario });
}

module.exports = { login, me };
