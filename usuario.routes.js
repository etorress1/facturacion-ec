const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const usuarioController = require('../controllers/usuarioController');

router.use(authenticate, tenantScope);

router.get('/', authorize('super_admin', 'admin'), usuarioController.listar);
router.post('/', authorize('super_admin', 'admin'), requireEmpresa, usuarioController.crear);
router.put('/:id', authorize('super_admin', 'admin'), usuarioController.actualizar);

module.exports = router;
