const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Establecimiento = sequelize.define('Establecimiento', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  codigo: { type: DataTypes.CHAR(3), allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  direccion: { type: DataTypes.STRING(300), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'establecimientos', updatedAt: false });

module.exports = Establecimiento;
