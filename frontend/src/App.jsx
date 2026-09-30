import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Cotizaciones from './pages/Cotizaciones.jsx';
import Facturas from './pages/Facturas.jsx';
import FacturaDetalle from './pages/FacturaDetalle.jsx';
import Clientes from './pages/Clientes.jsx';
import Productos from './pages/Productos.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Empresas from './pages/Empresas.jsx';
import Establecimientos from './pages/Establecimientos.jsx';

function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={
          <RutaProtegida>
            <MainLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
        <Route path="facturas" element={<Facturas />} />
        <Route path="facturas/:id" element={<FacturaDetalle />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route
          path="usuarios"
          element={
            <RutaProtegida rolesPermitidos={['super_admin', 'admin']}>
              <Usuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="establecimientos"
          element={
            <RutaProtegida rolesPermitidos={['super_admin', 'admin']}>
              <Establecimientos />
            </RutaProtegida>
          }
        />
        <Route
          path="negocios"
          element={
            <RutaProtegida rolesPermitidos={['super_admin']}>
              <Empresas />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
