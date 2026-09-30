const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const clienteController = require('../controllers/clienteController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);

module.exports = router;
