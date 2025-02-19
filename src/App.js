import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ContactPage from './pages/ContactPage/ContactPage';
import RecordPage from './pages/RecordPage/RecordPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/registro" element={<RecordPage />} />
      </Routes>
    </Router>
  );
}

export default App;