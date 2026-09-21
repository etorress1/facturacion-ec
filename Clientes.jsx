import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const vacio = { tipo_identificacion: '05', identificacion: '', razon_social: '', direccion: '', telefono: '', email: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  function cargar(q = '') {
    axiosClient.get('/clientes', { params: { q } }).then((res) => setClientes(res.data));
  }
  useEffect(() => cargar(), []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/clientes', form);
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el cliente');
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1>Clientes</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nuevo cliente'}</button>
      </div>

      {mostrarForm && (
        <form className="card" onSubmit={crear}>
          <div className="form-row">
            <div>
              <label>Tipo identificación</label>
              <select value={form.tipo_identificacion} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
                <option value="05">Cédula</option>
                <option value="04">RUC</option>
                <option value="06">Pasaporte</option>
                <option value="07">Consumidor final</option>
              </select>
            </div>
            <div>
              <label>Identificación</label>
              <input value={form.identificacion} onChange={(e) => setForm({ ...form, identificacion: e.target.value })} required />
            </div>
            <div>
              <label>Razón social / Nombres</label>
              <input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Dirección</label>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div>
              <label>Teléfono</label>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit">Guardar cliente</button>
        </form>
      )}

      <div className="card">
        <input
          placeholder="Buscar por nombre o identificación..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); cargar(e.target.value); }}
          style={{ marginBottom: 14 }}
        />
        <table>
          <thead><tr><th>Identificación</th><th>Nombre</th><th>Teléfono</th><th>Email</th></tr></thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.identificacion}</td>
                <td>{c.razon_social}</td>
                <td>{c.telefono || '—'}</td>
                <td>{c.email || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
