const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cotizacion = sequelize.define('Cotizacion', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  establecimiento_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cliente_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  numero: { type: DataTypes.STRING(20), allowNull: false },
  fecha_emision: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_validez: DataTypes.DATEONLY,
  subtotal_0: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  subtotal_iva: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  descuento: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  valor_iva: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  estado: {
    type: DataTypes.ENUM('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'CONVERTIDA', 'ANULADA'),
    defaultValue: 'BORRADOR',
  },
  observaciones: DataTypes.TEXT,
  factura_id: DataTypes.INTEGER.UNSIGNED,
}, { tableName: 'cotizaciones' });

module.exports = Cotizacion;
