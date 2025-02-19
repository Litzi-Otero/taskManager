import React, { useEffect } from 'react';
import { Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
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
      }
    };

    // Verificar el token inmediatamente cuando se monta el componente
    checkToken();

    // Establecer un intervalo para verificar el token cada 5 minutos (300000 ms)
    const intervalId = setInterval(checkToken, 300000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Bienvenido a dashboard!</p>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
