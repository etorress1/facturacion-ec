/**
 * Crea (o actualiza) el usuario super_admin inicial.
 * Uso:  npm run seed
 * Pide los datos por variables de entorno para no dejar contraseñas
 * escritas en el código:
 *   SEED_ADMIN_EMAIL=admin@minegocio.com SEED_ADMIN_PASSWORD=algoSeguro123 npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../models');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sistema.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'CambiarInmediatamente123!';

  await sequelize.sync(); // crea tablas que falten sin borrar datos existentes
  const password_hash = await bcrypt.hash(password, 10);

  const [usuario, creado] = await Usuario.findOrCreate({
    where: { email },
    defaults: {
      nombres: 'Super',
      apellidos: 'Admin',
      email,
      password_hash,
      rol: 'super_admin',
      empresa_id: null,
      activo: true,
    },
  });

  if (!creado) {
    usuario.password_hash = password_hash;
    usuario.rol = 'super_admin';
    await usuario.save();
    console.log(`Super admin actualizado: ${email}`);
  } else {
    console.log(`Super admin creado: ${email}`);
  }

  console.log(`Contraseña: ${password}  (cámbiala después de tu primer login)`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creando super_admin:', err);
  process.exit(1);
});
