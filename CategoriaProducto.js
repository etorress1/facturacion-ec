const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CategoriaProducto = sequelize.define('CategoriaProducto', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
}, { tableName: 'categorias_producto', timestamps: false });

module.exports = CategoriaProducto;
