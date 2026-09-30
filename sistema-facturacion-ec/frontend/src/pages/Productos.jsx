import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const vacio = {
  codigo_principal: '', nombre: '', descripcion: '', tipo: 'BIEN',
  precio_unitario: '', porcentaje_iva: 15, unidad_medida: 'UNIDAD',
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');

  function cargar() {
    axiosClient.get('/productos').then((res) => setProductos(res.data));
  }
  useEffect(cargar, []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/productos', form);
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el producto');
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1>Productos y servicios</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nuevo producto'}</button>
      </div>

      {mostrarForm && (
        <form className="card" onSubmit={crear}>
          <div className="form-row">
            <div>
              <label>Código principal</label>
              <input value={form.codigo_principal} onChange={(e) => setForm({ ...form, codigo_principal: e.target.value })} required />
            </div>
            <div>
              <label>Nombre</label>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="BIEN">Bien</option>
                <option value="SERVICIO">Servicio</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Precio unitario</label>
              <input type="number" step="0.0001" value={form.precio_unitario} onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })} required />
            </div>
            <div>
              <label>% IVA</label>
              <select value={form.porcentaje_iva} onChange={(e) => setForm({ ...form, porcentaje_iva: e.target.value })}>
                <option value={15}>15%</option>
                <option value={0}>0% (exento/tarifa 0)</option>
              </select>
            </div>
            <div>
              <label>Unidad de medida</label>
              <input value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} />
            </div>
          </div>
          <div>
            <label>Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" style={{ marginTop: 10 }}>Guardar producto</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Precio</th><th>IVA</th></tr></thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo_principal}</td>
                <td>{p.nombre}</td>
                <td>{p.tipo}</td>
                <td>${Number(p.precio_unitario).toFixed(2)}</td>
                <td>{p.porcentaje_iva}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
