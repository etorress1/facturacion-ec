const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TipoIdentificacionSri = sequelize.define('TipoIdentificacionSri', {
  codigo: { type: DataTypes.CHAR(2), primaryKey: true },
  descripcion: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'tipos_identificacion_sri', timestamps: false });

module.exports = TipoIdentificacionSri;
