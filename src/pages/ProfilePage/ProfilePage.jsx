import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import './ProfilePage.css';

const ProfilePage = () => {
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