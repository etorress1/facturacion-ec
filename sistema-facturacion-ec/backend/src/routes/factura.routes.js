const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const facturaController = require('../controllers/facturaController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/', facturaController.listar);
router.get('/:id', facturaController.obtener);
router.post('/', facturaController.crear);
router.post('/:id/emitir-sri', facturaController.emitirSri);
router.post('/:id/anular', facturaController.anular);

module.exports = router;
