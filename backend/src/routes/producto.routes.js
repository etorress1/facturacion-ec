const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const productoController = require('../controllers/productoController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/', productoController.listar);
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);

module.exports = router;
