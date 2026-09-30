import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [puntosEmision, setPuntosEmision] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');

  const [clienteId, setClienteId] = useState('');
  const [puntoEmisionId, setPuntoEmisionId] = useState('');
  const [formaPago, setFormaPago] = useState('01');
  const [items, setItems] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  function cargar() {
    axiosClient.get('/facturas').then((res) => setFacturas(res.data));
  }

  useEffect(() => {
    cargar();
    axiosClient.get('/clientes').then((res) => setClientes(res.data));
    axiosClient.get('/productos').then((res) => setProductos(res.data));
    axiosClient.get('/establecimientos').then((res) => {
      const puntos = res.data.flatMap((est) =>
        (est.PuntoEmisions || est.puntos_emision || []).map((p) => ({ ...p, establecimientoNombre: est.nombre }))
      );
      setPuntosEmision(puntos);
    });
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

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (!clienteId || !puntoEmisionId || items.length === 0) {
      setError('Selecciona cliente, punto de emisión y agrega al menos un ítem');
      return;
    }
    try {
      await axiosClient.post('/facturas', {
        cliente_id: clienteId,
        punto_emision_id: puntoEmisionId,
        forma_pago_codigo: formaPago,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad, descuento: i.descuento })),
      });
      setItems([]);
      setClienteId('');
      setPuntoEmisionId('');
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la factura');
    }
  }

  const estadoComprobante = (f) => f.comprobanteSri?.estado || 'SIN GENERAR';
  const colorEstado = {
    AUTORIZADO: 'verde', NO_ELECTRONICO: 'amarillo', GENERADO: 'amarillo',
    FIRMADO: 'amarillo', ENVIADO: 'amarillo', RECHAZADO: 'rojo', ERROR: 'rojo', 'SIN GENERAR': 'gris',
  };

  return (
    <div>
      <div className="topbar">
        <h1>Facturas</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nueva factura'}</button>
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
              <label>Punto de emisión</label>
              <select value={puntoEmisionId} onChange={(e) => setPuntoEmisionId(e.target.value)} required>
                <option value="">Selecciona un punto de emisión</option>
                {puntosEmision.map((p) => (
                  <option key={p.id} value={p.id}>{p.establecimientoNombre} — {p.codigo} ({p.descripcion})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Forma de pago</label>
              <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)}>
                <option value="01">Sin sistema financiero (efectivo)</option>
                <option value="16">Tarjeta de débito</option>
                <option value="19">Tarjeta de crédito</option>
                <option value="20">Otros</option>
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

          {error && <div className="error-msg">{error}</div>}
          <button type="submit" style={{ marginTop: 10 }}>Guardar factura</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Secuencial</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>SRI</th><th></th></tr></thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id}>
                <td>{f.secuencial}</td>
                <td>{f.Cliente?.razon_social}</td>
                <td>{f.fecha_emision}</td>
                <td>${Number(f.total).toFixed(2)}</td>
                <td><span className={`badge ${colorEstado[estadoComprobante(f)] || 'gris'}`}>{estadoComprobante(f)}</span></td>
                <td><Link to={`/facturas/${f.id}`}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
