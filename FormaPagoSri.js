const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FormaPagoSri = sequelize.define('FormaPagoSri', {
  codigo: { type: DataTypes.CHAR(2), primaryKey: true },
  descripcion: { type: DataTypes.STRING(150), allowNull: false },
}, { tableName: 'formas_pago_sri', timestamps: false });

module.exports = FormaPagoSri;
