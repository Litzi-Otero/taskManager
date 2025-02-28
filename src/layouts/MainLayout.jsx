import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaEnvelope, FaSignOutAlt, FaBars, FaUsers, FaUserFriends } from 'react-icons/fa';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRol, setUserRol] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRol(decodedToken.rol);

      // Programar el cierre de sesión después de 10 minutos
      const expirationTime = 10 * 60 * 1000; // 10 minutos en milisegundos
      const timer = setTimeout(() => {
        handleLogout();
      }, expirationTime);

      // Limpiar el temporizador cuando el componente se desmonte
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="main-layout">
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="toggle-button" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">
                <FaTachometerAlt />
                {!isSidebarCollapsed && <span> Dashboard</span>}
              </Link>
            </li>
            {userRol === 'master' && (
              <li>
                <Link to="/grupos">
                  <FaUsers />
                  {!isSidebarCollapsed && <span> Grupos</span>}
                </Link>
              </li>
            )}
            {userRol === 'administrador' && (
            <li>
              <Link to="/users">
                <FaUserFriends />
                {!isSidebarCollapsed && <span> Usuarios</span>}
              </Link>
            </li>
          )}
          {userRol === 'administrador' && (
            <li>
              <Link to="/grupos">
                <FaUsers />
                {!isSidebarCollapsed && <span> Grupos</span>}
              </Link>
            </li>
          )}
          {userRol === 'user' && (
            <li>
              <Link to="/grupo">
                <FaUsers />
                {!isSidebarCollapsed && <span> Grupo</span>}
              </Link>
            </li>
          )}
          <li>
              <Link to="/perfil">
                <FaUser />
                {!isSidebarCollapsed && <span> Perfil</span>}
              </Link>
            </li>
            <li>
              <Link to="/contacto">
                <FaEnvelope />
                {!isSidebarCollapsed && <span> Contacto</span>}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt />
                {!isSidebarCollapsed && <span> Cerrar Sesión</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;