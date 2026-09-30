const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo_identificacion: { type: DataTypes.CHAR(2), defaultValue: '05' },
  identificacion: { type: DataTypes.STRING(20), allowNull: false },
  razon_social: { type: DataTypes.STRING(300), allowNull: false },
  direccion: DataTypes.STRING(300),
  telefono: DataTypes.STRING(20),
  email: DataTypes.STRING(150),
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'clientes', updatedAt: false });

module.exports = Cliente;
