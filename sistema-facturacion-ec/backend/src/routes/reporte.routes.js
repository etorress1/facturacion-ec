const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { tenantScope, requireEmpresa } = require('../middleware/tenant');
const reporteController = require('../controllers/reporteController');

router.use(authenticate, tenantScope, requireEmpresa);

router.get('/resumen', reporteController.resumen);

module.exports = router;
