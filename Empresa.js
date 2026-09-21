const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Empresa = sequelize.define('Empresa', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  ruc: { type: DataTypes.CHAR(13), allowNull: false, unique: true },
  razon_social: { type: DataTypes.STRING(300), allowNull: false },
  nombre_comercial: { type: DataTypes.STRING(300) },
  direccion_matriz: { type: DataTypes.STRING(300), allowNull: false },
  telefono: DataTypes.STRING(20),
  email: DataTypes.STRING(150),
  logo_path: DataTypes.STRING(300),
  obligado_contabilidad: { type: DataTypes.ENUM('SI', 'NO'), defaultValue: 'NO' },
  contribuyente_especial: DataTypes.STRING(10),
  agente_retencion: DataTypes.STRING(10),
  regimen: {
    type: DataTypes.ENUM('GENERAL', 'RIMPE_EMPRENDEDOR', 'RIMPE_NEGOCIO_POPULAR'),
    defaultValue: 'GENERAL',
  },
  ambiente_sri: { type: DataTypes.ENUM('PRUEBAS', 'PRODUCCION'), defaultValue: 'PRUEBAS' },
  tipo_emision: { type: DataTypes.ENUM('NORMAL', 'CONTINGENCIA'), defaultValue: 'NORMAL' },
  plan: { type: DataTypes.ENUM('LOCAL', 'CLOUD'), defaultValue: 'LOCAL' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'empresas' });

module.exports = Empresa;
