/**
 * Restringe una ruta a uno o varios roles.
 * Uso: router.post('/usuarios', authenticate, authorize('super_admin', 'admin'), controller)
 */
function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = authorize;
