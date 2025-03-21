import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userRol, setUserRol] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('authToken');
    
      if (!token) {
        navigate('/login');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1])); 
      const expirationTime = decodedToken.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setUsername(decodedToken.username);
        setUserRol(decodedToken.rol);
      }
    };

    checkToken();
    const intervalId = setInterval(checkToken, 300000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="profile-container">
        <h1>Perfil</h1>
        <div className="profile-details">
          <p><strong>Nombre:</strong> Litzi Otero</p>
          <p><strong>Email:</strong> litzi.otero@example.com</p>
          <p><strong>Teléfono:</strong> +123 456 7890</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;