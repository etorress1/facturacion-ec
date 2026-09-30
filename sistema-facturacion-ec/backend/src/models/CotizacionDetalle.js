const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CotizacionDetalle = sequelize.define('CotizacionDetalle', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  producto_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  descripcion: { type: DataTypes.STRING(300), allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
  precio_unitario: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  descuento: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  porcentaje_iva: { type: DataTypes.DECIMAL(5, 2), defaultValue: 15.0 },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'cotizacion_detalle', timestamps: false });

module.exports = CotizacionDetalle;
