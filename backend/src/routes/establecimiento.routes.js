const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const establecimientoController = require('../controllers/establecimientoController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/', establecimientoController.listar);
router.post('/', authorize('super_admin', 'admin'), establecimientoController.crear);
router.post('/:establecimientoId/puntos-emision', authorize('super_admin', 'admin'), establecimientoController.crearPuntoEmision);

module.exports = router;
