const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  categoria_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  codigo_principal: { type: DataTypes.STRING(50), allowNull: false },
  codigo_auxiliar: DataTypes.STRING(50),
  nombre: { type: DataTypes.STRING(250), allowNull: false },
  descripcion: DataTypes.TEXT,
  tipo: { type: DataTypes.ENUM('BIEN', 'SERVICIO'), defaultValue: 'BIEN' },
  precio_unitario: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 },
  porcentaje_iva: { type: DataTypes.DECIMAL(5, 2), defaultValue: 15.0 },
  unidad_medida: { type: DataTypes.STRING(20), defaultValue: 'UNIDAD' },
  maneja_inventario: { type: DataTypes.BOOLEAN, defaultValue: false },
  stock_actual: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'productos' });

module.exports = Producto;
