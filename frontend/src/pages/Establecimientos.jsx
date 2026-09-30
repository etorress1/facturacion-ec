import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function Establecimientos() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ codigo: '', nombre: '', direccion: '' });
  const [error, setError] = useState('');

  function cargar() {
    axiosClient.get('/establecimientos').then((res) => setLista(res.data));
  }
  useEffect(cargar, []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/establecimientos', form);
      setForm({ codigo: '', nombre: '', direccion: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear');
    }
  }

  async function agregarPunto(establecimientoId) {
    const codigo = prompt('Código del punto de emisión (3 dígitos, ej. 001):');
    if (!codigo) return;
    const descripcion = prompt('Descripción (ej. Caja principal):') || 'Punto de emisión';
    try {
      await axiosClient.post(`/establecimientos/${establecimientoId}/puntos-emision`, { codigo, descripcion });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo crear el punto de emisión');
    }
  }

  return (
    <div>
      <div className="topbar"><h1>Establecimientos y puntos de emisión</h1></div>

      <form className="card" onSubmit={crear}>
        <h3 style={{ marginTop: 0 }}>Nuevo establecimiento</h3>
        <div className="form-row">
          <div>
            <label>Código (3 dígitos)</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} maxLength={3} required />
          </div>
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label>Dirección</label>
            <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit">Crear establecimiento</button>
      </form>

      {lista.map((est) => (
        <div className="card" key={est.id}>
          <div className="topbar" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{est.codigo} — {est.nombre}</h3>
            <button className="secundario" onClick={() => agregarPunto(est.id)}>+ Punto de emisión</button>
          </div>
          <p style={{ color: '#6b7280', marginTop: 0 }}>{est.direccion}</p>
          <table>
            <thead><tr><th>Código</th><th>Descripción</th></tr></thead>
            <tbody>
              {(est.PuntoEmisions || est.puntos_emision || []).map((p) => (
                <tr key={p.id}><td>{p.codigo}</td><td>{p.descripcion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
