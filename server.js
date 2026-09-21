require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models'); // registra todas las asociaciones

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');

    // En desarrollo local, sincroniza modelos que aún no existan como tabla.
    // En producción se recomienda usar migraciones en vez de sync().
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

iniciar();
