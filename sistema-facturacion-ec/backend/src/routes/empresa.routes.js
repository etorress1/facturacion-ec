const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const empresaController = require('../controllers/empresaController');

router.use(authenticate);

router.get('/', authorize('super_admin'), empresaController.listar);
router.post('/', authorize('super_admin'), empresaController.crear);
router.get('/:id', authorize('super_admin', 'admin'), empresaController.obtener);
router.put('/:id', authorize('super_admin', 'admin'), empresaController.actualizar);

module.exports = router;
