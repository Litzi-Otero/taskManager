import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userRol, setUserRol] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MainLayout>
      <div className="contact-container">
        <h1>Contacto</h1>
        {submitted ? (
          <p className="success-message">¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.</p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <label>Mensaje:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Enviar</button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default ContactPage;