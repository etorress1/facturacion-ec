const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  establecimiento_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  nombres: { type: DataTypes.STRING(150), allowNull: false },
  apellidos: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('super_admin', 'admin', 'trabajador'), defaultValue: 'trabajador' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  ultimo_login: DataTypes.DATE,
}, { tableName: 'usuarios' });

module.exports = Usuario;
