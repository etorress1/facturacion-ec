import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext.jsx';

const vacio = { nombres: '', apellidos: '', email: '', password: '', rol: 'trabajador' };

export default function Usuarios() {
  const { usuario, empresa } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');

  function cargar() {
    axiosClient.get('/usuarios').then((res) => setUsuarios(res.data));
  }
  useEffect(() => {
    if (usuario.rol === 'super_admin' && !empresa) return;
    cargar();
  }, [empresa]);

  async function crear(e) {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/usuarios', form);
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el usuario');
    }
  }

  async function alternarActivo(u) {
    await axiosClient.put(`/usuarios/${u.id}`, { activo: !u.activo });
    cargar();
  }

  if (usuario.rol === 'super_admin' && !empresa) {
    return (
      <div className="card">
        <h3>Selecciona un negocio</h3>
        <p>Ve a "Negocios" y elige con cuál negocio quieres administrar usuarios.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <h1>Usuarios</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}</button>
      </div>

      {mostrarForm && (
        <form className="card" onSubmit={crear}>
          <div className="form-row">
            <div>
              <label>Nombres</label>
              <input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
            </div>
            <div>
              <label>Apellidos</label>
              <input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            {usuario.rol === 'super_admin' && (
              <div>
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="trabajador">Trabajador</option>
                  <option value="admin">Administrador del negocio</option>
                </select>
              </div>
            )}
          </div>
          {usuario.rol === 'admin' && (
            <p style={{ color: '#6b7280', fontSize: 13 }}>
              Como administrador, los usuarios que crees serán "trabajadores" de tu negocio.
            </p>
          )}
          {error && <div className="error-msg">{error}</div>}
          <button type="submit">Guardar usuario</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombres} {u.apellidos}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td><span className={`badge ${u.activo ? 'verde' : 'gris'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <button className="secundario" onClick={() => alternarActivo(u)}>
                    {u.activo ? 'Desactivar' : 'Activar'}
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
