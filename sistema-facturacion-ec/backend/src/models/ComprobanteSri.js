const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ComprobanteSri = sequelize.define('ComprobanteSri', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  factura_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  clave_acceso: { type: DataTypes.CHAR(49), allowNull: false, unique: true },
  ambiente: { type: DataTypes.ENUM('PRUEBAS', 'PRODUCCION'), allowNull: false },
  tipo_emision: { type: DataTypes.ENUM('NORMAL', 'CONTINGENCIA'), defaultValue: 'NORMAL' },
  estado: {
    type: DataTypes.ENUM(
      'GENERADO', 'FIRMADO', 'ENVIADO', 'RECIBIDA', 'AUTORIZADO',
      'NO_AUTORIZADO', 'DEVUELTA', 'RECHAZADO', 'ERROR', 'NO_ELECTRONICO'
    ),
    defaultValue: 'GENERADO',
  },
  xml_generado: DataTypes.TEXT('long'),
  xml_firmado: DataTypes.TEXT('long'),
  xml_autorizado: DataTypes.TEXT('long'),
  numero_autorizacion: DataTypes.STRING(49),
  fecha_autorizacion: DataTypes.DATE,
  mensaje_error: DataTypes.TEXT,
  intentos: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
}, { tableName: 'comprobantes_sri' });

module.exports = ComprobanteSri;
