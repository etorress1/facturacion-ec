const { Empresa, Establecimiento, PuntoEmision, Secuencial } = require('../models');

// Solo super_admin: lista todos los negocios registrados en el sistema.
async function listar(req, res) {
  const empresas = await Empresa.findAll({ order: [['razon_social', 'ASC']] });
  res.json(empresas);
}

async function obtener(req, res) {
  const empresa = await Empresa.findByPk(req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Negocio no encontrado' });
  res.json(empresa);
}

// Solo super_admin: da de alta un nuevo negocio dentro del sistema, junto
// con su primer establecimiento (matriz) y punto de emisión.
async function crear(req, res) {
  const {
    ruc,
    razon_social,
    nombre_comercial,
    direccion_matriz,
    telefono,
    email,
    obligado_contabilidad,
    regimen,
    ambiente_sri,
  } = req.body;

  if (!ruc || !razon_social || !direccion_matriz) {
    return res.status(400).json({ error: 'ruc, razon_social y direccion_matriz son requeridos' });
  }

  const empresa = await Empresa.create({
    ruc,
    razon_social,
    nombre_comercial,
    direccion_matriz,
    telefono,
    email,
    obligado_contabilidad: obligado_contabilidad || 'NO',
    regimen: regimen || 'GENERAL',
    ambiente_sri: ambiente_sri || 'PRUEBAS',
  });

  const establecimiento = await Establecimiento.create({
    empresa_id: empresa.id,
    codigo: '001',
    nombre: 'Matriz',
    direccion: direccion_matriz,
  });

  const puntoEmision = await PuntoEmision.create({
    establecimiento_id: establecimiento.id,
    codigo: '001',
    descripcion: 'Punto de emisión principal',
  });

  await Promise.all(
    ['01', '03', '04', '05', '06', '07'].map((tipo) =>
      Secuencial.create({ punto_emision_id: puntoEmision.id, tipo_comprobante: tipo, secuencial_actual: 0 })
    )
  );

  res.status(201).json({ empresa, establecimiento, puntoEmision });
}

async function actualizar(req, res) {
  const empresa = await Empresa.findByPk(req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Negocio no encontrado' });

  // admin solo puede editar su propio negocio; super_admin cualquiera.
  if (req.user.rol === 'admin' && req.user.empresa_id !== empresa.id) {
    return res.status(403).json({ error: 'No puedes editar otro negocio' });
  }

  const camposEditables = [
    'razon_social', 'nombre_comercial', 'direccion_matriz', 'telefono', 'email',
    'obligado_contabilidad', 'contribuyente_especial', 'agente_retencion', 'regimen',
    'ambiente_sri', 'tipo_emision', 'logo_path', 'activo',
  ];
  camposEditables.forEach((campo) => {
    if (req.body[campo] !== undefined) empresa[campo] = req.body[campo];
  });

  await empresa.save();
  res.json(empresa);
}

module.exports = { listar, obtener, crear, actualizar };
