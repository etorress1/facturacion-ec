const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';

function obtenerClave() {
  const clave = process.env.APP_MASTER_KEY || '';
  // Se deriva una clave de 32 bytes a partir de APP_MASTER_KEY sin importar su longitud original.
  return crypto.createHash('sha256').update(clave).digest();
}

function cifrar(texto) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITMO, obtenerClave(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cifrado.toString('hex')}`;
}

function descifrar(textoCifrado) {
  const [ivHex, dataHex] = textoCifrado.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITMO, obtenerClave(), iv);
  const descifrado = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return descifrado.toString('utf8');
}

module.exports = { cifrar, descifrar };
