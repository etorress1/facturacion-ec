const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const empresaRoutes = require('./routes/empresa.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const establecimientoRoutes = require('./routes/establecimiento.routes');
const clienteRoutes = require('./routes/cliente.routes');
const productoRoutes = require('./routes/producto.routes');
const cotizacionRoutes = require('./routes/cotizacion.routes');
const facturaRoutes = require('./routes/factura.routes');
const reporteRoutes = require('./routes/reporte.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'facturacion-ec-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/establecimientos', establecimientoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/reportes', reporteRoutes);

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
});

module.exports = app;
