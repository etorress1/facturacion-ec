import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function FacturaDetalle() {
  const { id } = useParams();
  const [factura, setFactura] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  function cargar() {
    axiosClient.get(`/facturas/${id}`).then((res) => setFactura(res.data));
  }
  useEffect(cargar, [id]);

  async function emitirSri() {
    setProcesando(true);
    setMensaje('');
    try {
      await axiosClient.post(`/facturas/${id}/emitir-sri`);
      setMensaje('Comprobante procesado. Revisa el estado abajo.');
      cargar();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'No se pudo procesar el comprobante');
    } finally {
      setProcesando(false);
    }
  }

  if (!factura) return <p>Cargando...</p>;

  const comprobante = factura.comprobanteSri;

  return (
    <div>
      <div className="topbar">
        <h1>Factura {factura.secuencial}</h1>
        <Link to="/facturas">← Volver</Link>
      </div>

      <div className="card">
        <div className="form-row">
          <div><strong>Cliente</strong><div>{factura.Cliente?.razon_social}</div></div>
          <div><strong>Identificación</strong><div>{factura.Cliente?.identificacion}</div></div>
          <div><strong>Fecha de emisión</strong><div>{factura.fecha_emision}</div></div>
        </div>

        <table style={{ marginTop: 16 }}>
          <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>IVA</th><th>Subtotal</th></tr></thead>
          <tbody>
            {factura.detalles?.map((d) => (
              <tr key={d.id}>
                <td>{d.descripcion}</td>
                <td>{d.cantidad}</td>
                <td>${Number(d.precio_unitario).toFixed(2)}</td>
                <td>${Number(d.valor_iva).toFixed(2)}</td>
                <td>${Number(d.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <div>Subtotal 0%: ${Number(factura.subtotal_0).toFixed(2)}</div>
          <div>Subtotal con IVA: ${Number(factura.subtotal_iva).toFixed(2)}</div>
          <div>IVA: ${Number(factura.valor_iva).toFixed(2)}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Total: ${Number(factura.total).toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Integración con el SRI</h3>

        {!comprobante && (
          <>
            <p style={{ color: '#6b7280' }}>
              Esta factura todavía no tiene un comprobante electrónico generado.
            </p>
            <button onClick={emitirSri} disabled={procesando}>
              {procesando ? 'Procesando...' : 'Generar y emitir al SRI'}
            </button>
          </>
        )}

        {comprobante && (
          <div>
            <p><strong>Clave de acceso:</strong> {comprobante.clave_acceso}</p>
            <p><strong>Estado:</strong> <span className="badge amarillo">{comprobante.estado}</span></p>
            {comprobante.numero_autorizacion && <p><strong>N.º de autorización:</strong> {comprobante.numero_autorizacion}</p>}
            {comprobante.mensaje_error && <p style={{ color: '#d97706' }}>{comprobante.mensaje_error}</p>}
          </div>
        )}

        {mensaje && <p>{mensaje}</p>}
      </div>
    </div>
  );
}
