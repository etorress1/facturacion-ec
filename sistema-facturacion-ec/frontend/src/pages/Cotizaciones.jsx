import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');

  const [clienteId, setClienteId] = useState('');
  const [establecimientoId, setEstablecimientoId] = useState('');
  const [items, setItems] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  function cargar() {
    axiosClient.get('/cotizaciones').then((res) => setCotizaciones(res.data));
  }

  useEffect(() => {
    cargar();
    axiosClient.get('/clientes').then((res) => setClientes(res.data));
    axiosClient.get('/productos').then((res) => setProductos(res.data));
    axiosClient.get('/establecimientos').then((res) => setEstablecimientos(res.data));
  }, []);

  function agregarItem() {
    const producto = productos.find((p) => String(p.id) === String(productoSeleccionado));
    if (!producto) return;
    setItems([...items, {
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: Number(cantidad),
      precio_unitario: Number(producto.precio_unitario),
      porcentaje_iva: Number(producto.porcentaje_iva),
      descuento: 0,
    }]);
    setProductoSeleccionado('');
    setCantidad(1);
  }

  function quitarItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const totalEstimado = items.reduce((acc, i) => {
    const subtotal = i.cantidad * i.precio_unitario - i.descuento;
    const iva = subtotal * (i.porcentaje_iva / 100);
    return acc + subtotal + iva;
  }, 0);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (!clienteId || !establecimientoId || items.length === 0) {
      setError('Selecciona cliente, establecimiento y agrega al menos un ítem');
      return;
    }
    try {
      await axiosClient.post('/cotizaciones', {
        cliente_id: clienteId,
        establecimiento_id: establecimientoId,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad, descuento: i.descuento })),
      });
      setItems([]);
      setClienteId('');
      setEstablecimientoId('');
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cotización');
    }
  }

  async function convertirAFactura(cotizacion) {
    const puntoEmisionId = prompt('ID del punto de emisión para la factura (revisa en Establecimientos):');
    if (!puntoEmisionId) return;
    try {
      await axiosClient.post('/facturas', { cotizacion_id: cotizacion.id, punto_emision_id: puntoEmisionId });
      alert('Factura creada correctamente. Ve a la sección Facturas para emitirla al SRI.');
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo convertir a factura');
    }
  }

  const estadoColor = { BORRADOR: 'gris', ENVIADA: 'amarillo', ACEPTADA: 'verde', RECHAZADA: 'rojo', CONVERTIDA: 'verde', ANULADA: 'rojo' };

  return (
    <div>
      <div className="topbar">
        <h1>Cotizaciones</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nueva cotización'}</button>
      </div>

      {mostrarForm && (
        <form className="card" onSubmit={guardar}>
          <div className="form-row">
            <div>
              <label>Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
            </div>
            <div>
              <label>Establecimiento</label>
              <select value={establecimientoId} onChange={(e) => setEstablecimientoId(e.target.value)} required>
                <option value="">Selecciona un establecimiento</option>
                {establecimientos.map((e) => <option key={e.id} value={e.id}>{e.codigo} — {e.nombre}</option>)}
              </select>
            </div>
          </div>

          <h4>Ítems</h4>
          <div className="form-row">
            <div>
              <label>Producto</label>
              <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                <option value="">Selecciona un producto</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.precio_unitario).toFixed(2)}</option>)}
              </select>
            </div>
            <div>
              <label>Cantidad</label>
              <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="button" className="secundario" onClick={agregarItem}>Agregar ítem</button>
            </div>
          </div>

          {items.length > 0 && (
            <table className="detalle-tabla">
              <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>IVA</th><th></th></tr></thead>
              <tbody>
                {items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.nombre}</td>
                    <td>{i.cantidad}</td>
                    <td>${i.precio_unitario.toFixed(2)}</td>
                    <td>{i.porcentaje_iva}%</td>
                    <td><button type="button" className="secundario" onClick={() => quitarItem(idx)}>Quitar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p style={{ textAlign: 'right', fontWeight: 700, marginTop: 10 }}>
            Total estimado: ${totalEstimado.toFixed(2)}
          </p>

          {error && <div className="error-msg">{error}</div>}
          <button type="submit">Guardar cotización</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {cotizaciones.map((c) => (
              <tr key={c.id}>
                <td>{c.numero}</td>
                <td>{c.Cliente?.razon_social}</td>
                <td>{c.fecha_emision}</td>
                <td>${Number(c.total).toFixed(2)}</td>
                <td><span className={`badge ${estadoColor[c.estado] || 'gris'}`}>{c.estado}</span></td>
                <td>
                  {c.estado !== 'CONVERTIDA' && c.estado !== 'ANULADA' && (
                    <button className="secundario" onClick={() => convertirAFactura(c)}>Convertir a factura</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
