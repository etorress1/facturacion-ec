const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CertificadoFirma = sequelize.define('CertificadoFirma', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  proveedor: DataTypes.STRING(100),
  alias: DataTypes.STRING(150),
  ruta_archivo: { type: DataTypes.STRING(300), allowNull: false },
  password_cifrado: { type: DataTypes.STRING(500), allowNull: false },
  fecha_expiracion: { type: DataTypes.DATEONLY, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'certificados_firma', updatedAt: false });

module.exports = CertificadoFirma;
