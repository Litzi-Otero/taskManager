import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1>Bienvenido</h1>
      <p>Página de inicio.</p>
      <Link to="/login" className="login-link">Login</Link>
    </div>
  );
};

export default LandingPage;