/**
 * Sistema multi-negocio: cada usuario (admin/trabajador) pertenece a UNA
 * empresa y solo puede ver/operar los datos de esa empresa.
 * El super_admin no pertenece a ninguna empresa fija: puede indicar sobre
 * cuál negocio quiere trabajar mandando el header "x-empresa-id".
 *
 * Este middleware deja siempre disponible `req.empresaId` para que los
 * controladores filtren TODAS sus consultas por ese id y así ningún
 * negocio pueda ver datos de otro.
 */
function tenantScope(req, res, next) {
  if (req.user.rol === 'super_admin') {
    const headerEmpresaId = req.headers['x-empresa-id'];
    req.empresaId = headerEmpresaId ? Number(headerEmpresaId) : null;
  } else {
    if (!req.user.empresa_id) {
      return res.status(403).json({ error: 'Tu usuario no está asociado a ningún negocio' });
    }
    req.empresaId = req.user.empresa_id;
  }
  next();
}

/**
 * Para rutas que SÍ requieren obligatoriamente una empresa activa
 * (todo lo que es cotizaciones, facturas, clientes, productos, etc.)
 */
function requireEmpresa(req, res, next) {
  if (!req.empresaId) {
    return res.status(400).json({
      error: 'Selecciona un negocio (header x-empresa-id) para continuar',
    });
  }
  next();
}

module.exports = { tenantScope, requireEmpresa };
