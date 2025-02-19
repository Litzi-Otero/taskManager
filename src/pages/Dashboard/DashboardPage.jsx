import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import './DashboardPage.css';

const DashboardPage = () => {
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