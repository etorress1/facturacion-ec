const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const cotizacionController = require('../controllers/cotizacionController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/', cotizacionController.listar);
router.get('/:id', cotizacionController.obtener);
router.post('/', cotizacionController.crear);
router.patch('/:id/estado', cotizacionController.cambiarEstado);

module.exports = router;
