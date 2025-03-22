import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Modal, Form, Input, Select, DatePicker, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import './DashboardPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]); // Tareas generales
  const [editingTask, setEditingTask] = useState(null);
  const [username, setUsername] = useState('');
  const [userRol, setUserRol] = useState('');
  const formRef = useRef(null);

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

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/tasks', {
        //const response = await fetch('http://localhost:5000/api/tasks', {
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
    setEditingTask(null);
    if (formRef.current) {
      formRef.current.resetFields();
    }
    setIsModalVisible(true);
  };

  const showEditModal = (task) => {
    setEditingTask(task);
    if (formRef.current) {
      formRef.current.setFieldsValue({
        name_task: task.name_task,
        description: task.description,
        dead_line: task.dead_line ? moment(task.dead_line) : null,
        status: task.status,
        category: task.category,
      });
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const form = formRef.current;
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const email = decodedToken.email;

      let response;
      if (editingTask) {
        response = await fetch(`https://backtasks-vc1c.onrender.com/api/edit/tasks/${editingTask.id}`, {
        //  response = await fetch(`http://localhost:5000/api/edit/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, email }),
        });
      } else {
        response = await fetch('https://backtasks-vc1c.onrender.com/api/record/tasks', {
          //response = await fetch('http://localhost:5000/api/record/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, email }),
        });
      }

      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        const newTask = await response.json();
        if (editingTask) {
          setTasks(tasks.map(task => (task.id === editingTask.id ? newTask : task)));
        } else {
          setTasks([...tasks, newTask]);
        }
        setEditingTask(null);
      } else {
        console.error('Error al insertar la tarea');
      }
    } catch (error) {
      console.error('Error al validar el formulario', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const deleteTask = async (taskId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/delete/tasks/${taskId}`, {
        //const response = await fetch(`http://localhost:5000/api/delete/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        console.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error al eliminar la tarea', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return '#3498db';
      case 'done':
        return '#58d68d';
      case 'paused':
        return '#f39c12';
      case 'revision':
        return '#a569bd';
      default:
        return 'gray';
    }
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h2>Bienvenido, {username}!</h2>
        <p>TAREAS</p>
        <Button
          type="primary"
          className="floating-button"
          onClick={showModal}
        >
          +
        </Button>
        <Modal
          title={editingTask ? "Editar Tarea" : "Nueva Tarea"}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          className="custom-modal"
        >
          <Form layout="vertical" ref={formRef}>
            <Form.Item label="Nombre de la Tarea" name="name_task" rules={[{ required: true, message: 'Por favor ingrese el nombre de la tarea' }]} >
              <Input />
            </Form.Item>
            <Form.Item label="Descripción" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Tiempo hasta finalizar / Recordarme" name="dead_line">
              <DatePicker showTime />
            </Form.Item>
            <Form.Item label="Estado" name="status" rules={[{ required: true, message: 'Por favor seleccione el estado' }]} >
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
        <div>
          <Row gutter={[16, 16]}>
            {tasks.map(task => (
              <Col key={task.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={
                    <div className="card-title-container" style={{ backgroundColor: getStatusColor(task.status) }}>
                      {task.name_task}
                    </div>
                  }
                >
                  <p>Estado: {task.status}</p>
                  <Button type="link" onClick={() => showEditModal(task)}>Editar</Button>
                  <Button type="link" danger onClick={() => deleteTask(task.id)}>Eliminar</Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;