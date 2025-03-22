import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Modal, Form, Input, Select, List, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import './GroupsPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Title } = Typography;
const { Option } = Select;

const GroupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isTaskListModalVisible, setIsTaskListModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRol, setUserRol] = useState('');
  const [tasks, setTasks] = useState([]);
  const formRef = useRef(null);
  const taskFormRef = useRef(null);
  const addUserFormRef = useRef(null);

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
    const fetchGroups = async () => {
      const token = localStorage.getItem('authToken');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRol(decodedToken.rol);

      let response;
      if (decodedToken.rol === 'administrador') {
        response = await fetch('https://backtasks-vc1c.onrender.com/api/admin/groups', {
          //response = await fetch('http://localhost:5000/api/admin/groups', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch('https://backtasks-vc1c.onrender.com/api/groups', {
          //response = await fetch('http://localhost:5000/api/groups', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        let userGroups;
        if (decodedToken.rol === 'administrador') {
          userGroups = data.filter(group => group.members.includes(decodedToken.email));
        } else {
          userGroups = data.filter(group => group.created_by === decodedToken.email);
        }
        setGroups(userGroups);
      } else {
        console.error('La respuesta de la API no es un array:', data);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/users', {
        //const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const filteredUsers = data.filter(user => user.rol === 'user' || user.rol === 'administrador');
        setUsers(filteredUsers);
      } else {
        console.error('La respuesta de la API no es un array:', data);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const usersInGroups = groups.flatMap(group => group.members);
    const availableUsers = users.filter(user => !usersInGroups.includes(user.email));
    setAvailableUsers(availableUsers);
  }, [groups, users]);

  const showModal = () => {
    if (formRef.current) {
      formRef.current.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const form = formRef.current;
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      const response = await fetch('https://backtasks-vc1c.onrender.com/api/create/groups', {
        //const response = await fetch('http://localhost:5000/api/create/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          created_by: decodedToken.email,
        }),
      });

      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        message.success('Grupo agregado correctamente');
      } else {
        console.error('Error al agregar el grupo');
        message.error('Error al agregar el grupo');
      }
    } catch (error) {
      console.error('Error al validar el formulario', error);
      message.error('Error al validar el formulario');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleGroupChange = (groupId) => {
    const group = groups.find(group => group.id === groupId);
    setSelectedGroup(group);
  };

  const handleAssignTask = (email) => {
    if (!email) {
      console.error("Error: Usuario inválido al asignar tarea.");
      message.error("Error: No se pudo seleccionar un usuario.");
      return;
    }
  
    console.log("Usuario seleccionado para asignación de tarea:", email);
    setSelectedUser(email);
    setIsTaskModalVisible(true);
  };

  const handleTaskModalOk = async () => {
    const form = taskFormRef.current;
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      const email = selectedUser;
  
      if (!email) {
        console.error("Error: No se ha seleccionado un usuario para la tarea.");
        message.error("No se ha seleccionado un usuario para la tarea.");
        return;
      }
  
      console.log("Email del usuario seleccionado:", email); // Agregar este log para verificar el email
  
      const requestData = {
        ...values,
        email,
        groupName: selectedGroup.name, // Agregar el nombre del grupo
        description: values.description || null,
        category: values.category || null,
        dead_line: values.dead_line ? values.dead_line.toISOString() : null,
      };
  
      console.log("Datos que se enviarán al servidor:", requestData);
  
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/record/user/task', {
        //const response = await fetch('http://localhost:5000/api/record/user/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
  
      const responseData = await response.json();
      console.log("Respuesta del servidor:", responseData);
  
      if (response.ok) {
        setIsTaskModalVisible(false);
        form.resetFields();
        message.success('Tarea asignada correctamente');
      } else {
        message.error(responseData.message || 'Error al asignar la tarea');
      }
    } catch (error) {
      console.error('Error al validar el formulario', error);
      message.error('Error al validar el formulario');
    }
  };

  const handleTaskModalCancel = () => {
    setIsTaskModalVisible(false);
    setSelectedUser(null);
  };

  const showAddUserModal = () => {
    if (addUserFormRef.current) {
      addUserFormRef.current.resetFields();
    }
    setIsAddUserModalVisible(true);
  };

  const handleAddUserOk = async () => {
    const form = addUserFormRef.current;
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      console.log("Valores del formulario:", values);
      console.log("Token de autenticación:", token);
      console.log("Nombre del grupo seleccionado:", selectedGroup.name);
  
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/groups/add-users`, {
       // const response = await fetch(`http://localhost:5000/api/groups/add-users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupName: selectedGroup.name, members: values.members }),
      });
  
      console.log("Respuesta de la solicitud:", response);
  
      if (response.ok) {
        let updatedGroup;
        try {
          updatedGroup = await response.json();
        } catch (jsonError) {
          console.error('Error al parsear la respuesta JSON:', jsonError);
          updatedGroup = null;
        }
        console.log("Grupo actualizado:", updatedGroup);
        if (updatedGroup) {
          setGroups(groups.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
        }
        setIsAddUserModalVisible(false);
        form.resetFields();
        message.success('Usuarios agregados correctamente');
      } else {
        const errorData = await response.json();
        console.error('Error al agregar usuarios al grupo:', errorData);
        message.error('Error al agregar usuarios al grupo');
      }
    } catch (error) {
      console.error('Error al validar el formulario', error);
      message.error('Error al validar el formulario');
    }
  };

  const handleAddUserCancel = () => {
    setIsAddUserModalVisible(false);
  };

  const showTaskListModal = async () => {
    if (selectedGroup) {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/groups/${selectedGroup.name}/tasks`, { 
        //const response = await fetch(`http://localhost:5000/api/groups/${selectedGroup.name}/tasks`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
        setIsTaskListModalVisible(true);
      } else {
        console.error('La respuesta de la API no es un array:', data);
      }
    }
  };

  const handleTaskListModalCancel = () => {
    setIsTaskListModalVisible(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/tasks/status/${taskId}`, {
        //const response = await fetch(`http://localhost:5000/api/tasks/status/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
        message.success('Estado de la tarea actualizado correctamente');
      } else {
        message.error('Error al actualizar el estado de la tarea');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea', error);
      message.error('Error al actualizar el estado de la tarea');
    }
  };

  return (
    <MainLayout>
      <div className="group-container">
        <div className="header">
          <Title level={2}>Grupos</Title>
          {userRol !== 'administrador' && (
            <Button
              type="primary"
              className="add-group-button"
              onClick={showModal}
            >
              + Agregar Grupo
            </Button>
          )}
        </div>
        <Modal
          title="Nuevo Grupo"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          className="custom-modal"
        >
          <Form layout="vertical" ref={formRef}>
            <Form.Item label="Nombre del Grupo" name="name" rules={[{ required: true, message: 'Por favor ingrese el nombre del grupo' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Descripción" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Miembros" name="members" rules={[{ required: true, message: 'Por favor seleccione al menos un miembro' }]}>
              <Select mode="multiple" placeholder="Seleccione miembros">
                {availableUsers.map(user => (
                  <Option key={user.email} value={user.email}>
                    {user.username} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Select
          placeholder="Seleccione un grupo"
          style={{ width: 200, marginBottom: 20 }}
          onChange={handleGroupChange}
        >
          {groups.map(group => (
            <Option key={group.id} value={group.id}>
              {group.name}
            </Option>
          ))}
        </Select>
        {selectedGroup && (
          <div className="group-members">
            <Title level={3}>Miembros del Grupo: {selectedGroup.name}</Title>
            {userRol !== 'administrador' && (
            <Button type="primary" className="add-member-button" onClick={showAddUserModal}>
              Agregar Miembros
            </Button>
          )}
            {userRol === 'administrador' && (
            <Button type="primary" className="view-tasks-button" onClick={showTaskListModal}>
              Ver Tareas
            </Button>
          )}
            <List
              dataSource={selectedGroup.members}
              renderItem={email => {
                const user = users.find(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
                return (
                  <List.Item actions={[<Button onClick={() => handleAssignTask(email)} disabled={!email}>Asignar Tarea</Button>]}>
                    {user ? `${user.username} (${user.email})` : email}
                  </List.Item>
                );
              }}
            />
          </div>
        )}
        <Modal
          title={`Asignar Tarea a ${selectedUser ? selectedUser : ''}`}
          visible={isTaskModalVisible}
          onOk={handleTaskModalOk}
          onCancel={handleTaskModalCancel}
          className="custom-modal"
        >
          <Form layout="vertical" ref={taskFormRef}>
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
        <Modal
          title="Agregar Miembros al Grupo"
          visible={isAddUserModalVisible}
          onOk={handleAddUserOk}
          onCancel={handleAddUserCancel}
          className="custom-modal"
        >
          <Form layout="vertical" ref={addUserFormRef}>
            <Form.Item label="Miembros" name="members" rules={[{ required: true, message: 'Por favor seleccione al menos un miembro' }]}>
              <Select mode="multiple" placeholder="Seleccione miembros">
                {availableUsers.map(user => (
                  <Option key={user.email} value={user.email}>
                    {user.username} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Lista de Tareas"
          visible={isTaskListModalVisible}
          onCancel={handleTaskListModalCancel}
          footer={null}
          className="custom-modal"
        >
          <List
            dataSource={tasks}
            renderItem={task => (
              <List.Item>
                <List.Item.Meta
                  title={task.name_task}
                  description={task.description}
                />
                <Select
                  value={task.status}
                  onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  style={{ width: 120 }}
                >
                  <Option value="in-progress">En Progreso</Option>
                  <Option value="done">Hecho</Option>
                  <Option value="paused">Pausado</Option>
                  <Option value="revision">En Revisión</Option>
                </Select>
              </List.Item>
            )}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};

export default GroupPage;