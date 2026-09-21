import { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [empresa, setEmpresa] = useState(() => {
    const guardada = localStorage.getItem('empresaActiva');
    return guardada ? JSON.parse(guardada) : null;
  });

  async function login(email, password) {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);

    if (data.empresa) {
      localStorage.setItem('empresaActiva', JSON.stringify(data.empresa));
      localStorage.setItem('empresaActivaId', data.empresa.id);
      setEmpresa(data.empresa);
    }
    return data.usuario;
  }

  function seleccionarEmpresa(empresaSeleccionada) {
    localStorage.setItem('empresaActiva', JSON.stringify(empresaSeleccionada));
    localStorage.setItem('empresaActivaId', empresaSeleccionada.id);
    setEmpresa(empresaSeleccionada);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('empresaActiva');
    localStorage.removeItem('empresaActivaId');
    setUsuario(null);
    setEmpresa(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, empresa, login, logout, seleccionarEmpresa }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
