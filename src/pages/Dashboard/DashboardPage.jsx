import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Modal, Form, Input, Select, DatePicker, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const formRef = useRef(null);

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

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const form = formRef.current;
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const email = decodedToken.email;

      const response = await fetch('http://localhost:5000/api/record/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...values, email }),
      });
      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      } else {
        console.error('Error al insertar la tarea');
      }
    } catch (error) {
      console.error('Error al validar el formulario', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>TAREAS</p>
        <Button
          type="primary"
          className="floating-button"
          onClick={showModal}
        >
          +
        </Button>
        <Modal
          title="Nueva Tarea"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          className="custom-modal"
        >
          <Form layout="vertical" ref={formRef}>
            <Form.Item label="Nombre de la Tarea" name="name_task" rules={[{ required: true, message: 'Por favor ingrese el nombre de la tarea' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Descripción" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Tiempo hasta finalizar / Recordarme" name="dead_line">
              <DatePicker showTime />
            </Form.Item>
            <Form.Item label="Estado" name="status" rules={[{ required: true, message: 'Por favor seleccione el estado' }]}>
              <Select>
                <Option value="in-progress">En Progreso</Option>
                <Option value="done">Hecho</Option>
                <Option value="paused">Pausado</Option>
                <Option value="revision">En Revisión</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Categoría/Etiqueta" name="category">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <List
          itemLayout="horizontal"
          dataSource={tasks}
          renderItem={task => (
            <List.Item>
              <List.Item.Meta
                title={task.name_task}
                description={`Estado: ${task.status}`}
              />
            </List.Item>
          )}
        />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;