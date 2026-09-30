const sequelize = require('../config/db');

const Empresa = require('./Empresa');
const Establecimiento = require('./Establecimiento');
const PuntoEmision = require('./PuntoEmision');
const Secuencial = require('./Secuencial');
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const CategoriaProducto = require('./CategoriaProducto');
const Producto = require('./Producto');
const Cotizacion = require('./Cotizacion');
const CotizacionDetalle = require('./CotizacionDetalle');
const Factura = require('./Factura');
const FacturaDetalle = require('./FacturaDetalle');
const ComprobanteSri = require('./ComprobanteSri');
const FormaPagoSri = require('./FormaPagoSri');
const TipoIdentificacionSri = require('./TipoIdentificacionSri');
const CertificadoFirma = require('./CertificadoFirma');
const Auditoria = require('./Auditoria');

// ---- Empresa (negocio) es el eje del sistema multi-tenant ----
Empresa.hasMany(Establecimiento, { foreignKey: 'empresa_id' });
Establecimiento.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Establecimiento.hasMany(PuntoEmision, { foreignKey: 'establecimiento_id' });
PuntoEmision.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id' });

PuntoEmision.hasMany(Secuencial, { foreignKey: 'punto_emision_id' });
Secuencial.belongsTo(PuntoEmision, { foreignKey: 'punto_emision_id' });

Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Establecimiento.hasMany(Usuario, { foreignKey: 'establecimiento_id' });
Usuario.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id' });

Empresa.hasMany(Cliente, { foreignKey: 'empresa_id' });
Cliente.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Cliente.belongsTo(TipoIdentificacionSri, { foreignKey: 'tipo_identificacion', targetKey: 'codigo' });

Empresa.hasMany(CategoriaProducto, { foreignKey: 'empresa_id' });
Empresa.hasMany(Producto, { foreignKey: 'empresa_id' });
CategoriaProducto.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(CategoriaProducto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ---- Cotizaciones ----
Empresa.hasMany(Cotizacion, { foreignKey: 'empresa_id' });
Cotizacion.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Establecimiento.hasMany(Cotizacion, { foreignKey: 'establecimiento_id' });
Cotizacion.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id' });
Cliente.hasMany(Cotizacion, { foreignKey: 'cliente_id' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Usuario.hasMany(Cotizacion, { foreignKey: 'usuario_id' });
Cotizacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Cotizacion.hasMany(CotizacionDetalle, { foreignKey: 'cotizacion_id', as: 'detalles' });
CotizacionDetalle.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id' });
Producto.hasMany(CotizacionDetalle, { foreignKey: 'producto_id' });
CotizacionDetalle.belongsTo(Producto, { foreignKey: 'producto_id' });

// ---- Facturas ----
Empresa.hasMany(Factura, { foreignKey: 'empresa_id' });
Factura.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Establecimiento.hasMany(Factura, { foreignKey: 'establecimiento_id' });
Factura.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id' });
PuntoEmision.hasMany(Factura, { foreignKey: 'punto_emision_id' });
Factura.belongsTo(PuntoEmision, { foreignKey: 'punto_emision_id' });
Cliente.hasMany(Factura, { foreignKey: 'cliente_id' });
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Usuario.hasMany(Factura, { foreignKey: 'usuario_id' });
Factura.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Cotizacion.hasOne(Factura, { foreignKey: 'cotizacion_id' });
Factura.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id' });
Factura.belongsTo(FormaPagoSri, { foreignKey: 'forma_pago_codigo', targetKey: 'codigo' });

Factura.hasMany(FacturaDetalle, { foreignKey: 'factura_id', as: 'detalles' });
FacturaDetalle.belongsTo(Factura, { foreignKey: 'factura_id' });
Producto.hasMany(FacturaDetalle, { foreignKey: 'producto_id' });
FacturaDetalle.belongsTo(Producto, { foreignKey: 'producto_id' });

// ---- Integración SRI ----
Factura.hasOne(ComprobanteSri, { foreignKey: 'factura_id', as: 'comprobanteSri' });
ComprobanteSri.belongsTo(Factura, { foreignKey: 'factura_id' });

Empresa.hasOne(CertificadoFirma, { foreignKey: 'empresa_id' });
CertificadoFirma.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ---- Auditoría ----
Empresa.hasMany(Auditoria, { foreignKey: 'empresa_id' });
Usuario.hasMany(Auditoria, { foreignKey: 'usuario_id' });

module.exports = {
  sequelize,
  Empresa,
  Establecimiento,
  PuntoEmision,
  Secuencial,
  Usuario,
  Cliente,
  CategoriaProducto,
  Producto,
  Cotizacion,
  CotizacionDetalle,
  Factura,
  FacturaDetalle,
  ComprobanteSri,
  FormaPagoSri,
  TipoIdentificacionSri,
  CertificadoFirma,
  Auditoria,
};
