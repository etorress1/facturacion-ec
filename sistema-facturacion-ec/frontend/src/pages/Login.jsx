import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={manejarSubmit}>
        <h2 style={{ marginTop: 0 }}>Sistema de Facturación</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: -8 }}>
          Cotizaciones, facturas y conexión con el SRI
        </p>

        <div style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" style={{ width: '100%', marginTop: 8 }} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
