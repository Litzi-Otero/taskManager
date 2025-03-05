import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaEnvelope, FaSignOutAlt, FaArrowLeft, FaArrowRight, FaUsers, FaUserFriends } from 'react-icons/fa';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <nav>
          <ul>
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard">
                <FaTachometerAlt />
                {!isSidebarCollapsed && <span> Dashboard</span>}
              </Link>
            </li>
            {userRol === 'master' && (
              <li className={location.pathname === '/grupos' ? 'active' : ''}>
                <Link to="/grupos">
                  <FaUsers />
                  {!isSidebarCollapsed && <span> Grupos</span>}
                </Link>
              </li>
            )}
            {userRol === 'administrador' && (
              <>
                <li className={location.pathname === '/users' ? 'active' : ''}>
                  <Link to="/users">
                    <FaUserFriends />
                    {!isSidebarCollapsed && <span> Usuarios</span>}
                  </Link>
                </li>
                <li className={location.pathname === '/grupos' ? 'active' : ''}>
                  <Link to="/grupos">
                    <FaUsers />
                    {!isSidebarCollapsed && <span> Grupos</span>}
                  </Link>
                </li>
              </>
            )}
            {userRol === 'user' && (
              <li className={location.pathname === '/grupo' ? 'active' : ''}>
                <Link to="/grupo">
                  <FaUsers />
                  {!isSidebarCollapsed && <span> Grupo</span>}
                </Link>
              </li>
            )}
            <li className={location.pathname === '/perfil' ? 'active' : ''}>
              <Link to="/perfil">
                <FaUser />
                {!isSidebarCollapsed && <span> Perfil</span>}
              </Link>
            </li>
            <li className={location.pathname === '/contacto' ? 'active' : ''}>
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
        <button className="toggle-button" onClick={toggleSidebar}>
          {isSidebarCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;