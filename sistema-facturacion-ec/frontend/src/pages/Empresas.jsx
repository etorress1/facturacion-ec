import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext.jsx';

const vacio = {
  ruc: '', razon_social: '', nombre_comercial: '', direccion_matriz: '',
  telefono: '', email: '', ambiente_sri: 'PRUEBAS',
};

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const { empresa, seleccionarEmpresa } = useAuth();

  function cargar() {
    axiosClient.get('/empresas').then((res) => setEmpresas(res.data));
  }

  useEffect(cargar, []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/empresas', form);
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el negocio');
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1>Negocios registrados</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo negocio'}
        </button>
      </div>

      {mostrarForm && (
        <form className="card" onSubmit={crear}>
          <div className="form-row">
            <div>
              <label>RUC</label>
              <input value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} required maxLength={13} />
            </div>
            <div>
              <label>Razón social</label>
              <input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} required />
            </div>
            <div>
              <label>Nombre comercial</label>
              <input value={form.nombre_comercial} onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Dirección matriz</label>
              <input value={form.direccion_matriz} onChange={(e) => setForm({ ...form, direccion_matriz: e.target.value })} required />
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
          <div className="form-row">
            <div>
              <label>Ambiente SRI</label>
              <select value={form.ambiente_sri} onChange={(e) => setForm({ ...form, ambiente_sri: e.target.value })}>
                <option value="PRUEBAS">Pruebas</option>
                <option value="PRODUCCION">Producción</option>
              </select>
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit">Guardar negocio</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr><th>RUC</th><th>Razón social</th><th>Ambiente SRI</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id}>
                <td>{e.ruc}</td>
                <td>{e.razon_social}</td>
                <td>{e.ambiente_sri}</td>
                <td>
                  <span className={`badge ${e.activo ? 'verde' : 'gris'}`}>{e.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td>
                  <button
                    className="secundario"
                    onClick={() => seleccionarEmpresa(e)}
                    disabled={empresa?.id === e.id}
                  >
                    {empresa?.id === e.id ? 'Seleccionado' : 'Trabajar aquí'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
