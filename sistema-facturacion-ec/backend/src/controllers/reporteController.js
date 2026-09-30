const { sequelize, Factura, Cotizacion } = require('../models');
const { QueryTypes } = require('sequelize');

async function resumen(req, res) {
  const empresaId = req.empresaId;

  const [totalesFacturas] = await sequelize.query(
    `SELECT
        COUNT(*) AS numero_facturas,
        COALESCE(SUM(total), 0) AS total_facturado
     FROM facturas
     WHERE empresa_id = :empresaId AND estado = 'EMITIDA'`,
    { replacements: { empresaId }, type: QueryTypes.SELECT }
  );

  const cotizacionesPendientes = await Cotizacion.count({
    where: { empresa_id: empresaId, estado: ['BORRADOR', 'ENVIADA'] },
  });

  const ventasPorDia = await sequelize.query(
    `SELECT fecha_emision AS fecha, SUM(total) AS total
     FROM facturas
     WHERE empresa_id = :empresaId AND estado = 'EMITIDA'
       AND fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY fecha_emision
     ORDER BY fecha_emision ASC`,
    { replacements: { empresaId }, type: QueryTypes.SELECT }
  );

  res.json({
    numero_facturas: Number(totalesFacturas.numero_facturas),
    total_facturado: Number(totalesFacturas.total_facturado),
    cotizaciones_pendientes: cotizacionesPendientes,
    ventas_por_dia: ventasPorDia,
  });
}

module.exports = { resumen };
