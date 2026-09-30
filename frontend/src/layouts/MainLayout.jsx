import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function MainLayout() {
  const { usuario, empresa, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Facturación EC</h2>
        <NavLink to="/" end>Panel</NavLink>
        <NavLink to="/cotizaciones">Cotizaciones</NavLink>
        <NavLink to="/facturas">Facturas</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        {(usuario.rol === 'admin' || usuario.rol === 'super_admin') && (
          <>
            <NavLink to="/usuarios">Usuarios</NavLink>
            <NavLink to="/establecimientos">Establecimientos</NavLink>
          </>
        )}
        {usuario.rol === 'super_admin' && <NavLink to="/negocios">Negocios</NavLink>}

        <div className="empresa-info">
          <div><strong>{usuario.nombres} {usuario.apellidos}</strong></div>
          <div>{usuario.rol}</div>
          {empresa && <div style={{ marginTop: 6 }}>{empresa.nombre_comercial || empresa.razon_social}</div>}
          <button className="secundario" style={{ marginTop: 10, width: '100%', background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
