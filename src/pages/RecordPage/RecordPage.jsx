import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RecordPage.css';

const RecordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!email || !password || !username || !rol) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Validar formato del email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError('El formato del correo electrónico es inválido');
      return;
    }

    try {
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      setSuccess('Usuario registrado exitosamente');
      setError('');
      
      // Redirigir tras el registro exitoso
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  return (
    <div className="record-container">
      <h1>Registrar Usuario</h1>
      <form className="record-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Nombre de usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol:</label>
          <input
            type="text"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="register-button">Registrar</button>
      </form>
        <Link to="/login">¿Ya tienes una cuenta? Inicia sesión aquí</Link>
      
    </div>
  );
};

export default RecordPage;