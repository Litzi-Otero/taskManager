import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;

    try {
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);

        message.success('Ingreso exitoso');
        navigate('/dashboard');
      } else {
        message.error(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      message.error('Error en la conexión');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>Inicio de sesión</h1>
      <Form name="login" layout="vertical" onFinish={onFinish}>
        <div className="form-group">
          <label>Email:</label>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Por favor, ingrese su correo electrónico' }]}
          >
            <Input
              type="email"
              placeholder="Correo Electrónico"
            />
          </Form.Item>
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, ingrese su contraseña' }]}
          >
            <Input.Password
              placeholder="Contraseña"
            />
          </Form.Item>
        </div>
        <div className="form-group">
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="login-button"
          >
            Iniciar
          </Button>
        </div>
      </Form>
      <div className="register-link">
        <Link to="/registro">¿No tienes una cuenta? Regístrate aquí</Link>
      </div>
    </div>
  );
};

export default LoginPage;