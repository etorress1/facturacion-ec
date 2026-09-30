const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Factura = sequelize.define('Factura', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  establecimiento_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  punto_emision_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cotizacion_id: DataTypes.INTEGER.UNSIGNED,
  cliente_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  secuencial: { type: DataTypes.CHAR(9), allowNull: false },
  fecha_emision: { type: DataTypes.DATEONLY, allowNull: false },
  subtotal_0: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  subtotal_iva: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_descuento: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  valor_iva: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  propina: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  forma_pago_codigo: { type: DataTypes.CHAR(2), defaultValue: '01' },
  estado: { type: DataTypes.ENUM('BORRADOR', 'EMITIDA', 'ANULADA'), defaultValue: 'BORRADOR' },
  observaciones: DataTypes.TEXT,
}, { tableName: 'facturas' });

module.exports = Factura;
