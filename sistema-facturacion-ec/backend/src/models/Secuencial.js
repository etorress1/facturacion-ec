const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Secuencial = sequelize.define('Secuencial', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  punto_emision_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo_comprobante: { type: DataTypes.ENUM('01', '03', '04', '05', '06', '07'), allowNull: false },
  secuencial_actual: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 },
}, { tableName: 'secuenciales', timestamps: false });

module.exports = Secuencial;
