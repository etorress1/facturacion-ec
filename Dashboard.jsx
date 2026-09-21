import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { empresa } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!empresa) return;
    axiosClient
      .get('/reportes/resumen')
      .then((res) => setResumen(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No se pudo cargar el resumen'));
  }, [empresa]);

  if (!empresa) {
    return (
      <div className="card">
        <h3>Selecciona un negocio</h3>
        <p>Ve a la sección "Negocios" para elegir con cuál negocio quieres trabajar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <h1>Panel — {empresa.nombre_comercial || empresa.razon_social}</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="grid-cards">
        <div className="card">
          <div className="stat-value">{resumen ? resumen.numero_facturas : '—'}</div>
          <div className="stat-label">Facturas emitidas</div>
        </div>
        <div className="card">
          <div className="stat-value">${resumen ? resumen.total_facturado.toFixed(2) : '—'}</div>
          <div className="stat-label">Total facturado</div>
        </div>
        <div className="card">
          <div className="stat-value">{resumen ? resumen.cotizaciones_pendientes : '—'}</div>
          <div className="stat-label">Cotizaciones pendientes</div>
        </div>
        <div className="card">
          <div className="stat-value">{empresa.ambiente_sri}</div>
          <div className="stat-label">Ambiente SRI</div>
        </div>
      </div>

      <div className="card">
        <h3>Ventas últimos 30 días</h3>
        {resumen && resumen.ventas_por_dia.length > 0 ? (
          <table>
            <thead><tr><th>Fecha</th><th>Total</th></tr></thead>
            <tbody>
              {resumen.ventas_por_dia.map((v) => (
                <tr key={v.fecha}>
                  <td>{v.fecha}</td>
                  <td>${Number(v.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280' }}>Aún no hay ventas registradas en este periodo.</p>
        )}
      </div>
    </div>
  );
}
