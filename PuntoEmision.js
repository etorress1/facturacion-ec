const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PuntoEmision = sequelize.define('PuntoEmision', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  establecimiento_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  codigo: { type: DataTypes.CHAR(3), allowNull: false },
  descripcion: { type: DataTypes.STRING(150), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'puntos_emision', updatedAt: false });

module.exports = PuntoEmision;
