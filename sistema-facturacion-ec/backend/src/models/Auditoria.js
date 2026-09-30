const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Auditoria = sequelize.define('Auditoria', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: DataTypes.INTEGER.UNSIGNED,
  usuario_id: DataTypes.INTEGER.UNSIGNED,
  accion: { type: DataTypes.STRING(100), allowNull: false },
  tabla_afectada: DataTypes.STRING(100),
  registro_id: DataTypes.INTEGER.UNSIGNED,
  detalle: DataTypes.JSON,
  ip_address: DataTypes.STRING(45),
}, { tableName: 'auditoria', updatedAt: false });

module.exports = Auditoria;
