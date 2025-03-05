import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Popconfirm, Form, Input, Modal } from 'antd';
import './UsersPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Option } = Select;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/users/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (email, newRole) => {
    console.log('Changing role for user with email:', email, 'to:', newRole); // Agrega este console.log para verificar el email y newRole
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/users/${email}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rol: newRole }),
      });
      if (response.ok) {
        setUsers(users.map(user => (user.email === email ? { ...user, rol: newRole } : user)));
      } else {
        console.error('Error al cambiar el rol del usuario');
      }
    } catch (error) {
      console.error('Error al cambiar el rol del usuario', error);
    }
  };

  const handleDeleteUser = async (email) => {
    console.log('Deleting user with email:', email); 
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/delete/users/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setUsers(users.filter(user => user.email !== email));
      } else {
        console.error('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
    }
  };

  const handleAddUser = async (values) => {
    console.log('Adding user:', values); 
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('https://backtasks-vc1c.onrender.com/api/add/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setIsModalVisible(false);
        form.resetFields();
      } else {
        console.error('Error al agregar el usuario');
      }
    } catch (error) {
      console.error('Error al agregar el usuario', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    editForm.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    console.log('Updating user:', values); 
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://backtasks-vc1c.onrender.com/api/edit/users/${editingUser.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setUsers(users.map(user => (user.email === editingUser.email ? { ...user, ...values } : user)));
        setIsEditModalVisible(false);
        setEditingUser(null);
        editForm.resetFields();
      } else {
        console.error('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al actualizar el usuario', error);
    }
  };

  const columns = [
    {
      title: 'Nombre de Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Correo Electrónico',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, record) => (
        <>
          <Select
            defaultValue={record.rol}
            style={{ width: 120 }}
            onChange={(value) => handleRoleChange(record.email, value)}
          >
            <Option value="user">Usuario</Option>
            <Option value="administrador">Administrador</Option>
            <Option value="master">Master</Option>
          </Select>
          <Button type="link" onClick={() => handleEditUser(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => handleDeleteUser(record.email)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.rol]) {
      acc[user.rol] = [];
    }
    acc[user.rol].push(user);
    return acc;
  }, {});

  const roles = Object.keys(groupedUsers);
  const currentRole = roles[currentRoleIndex];

  const handleNext = () => {
    setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
  };

  const handlePrevious = () => {
    setCurrentRoleIndex((prevIndex) => (prevIndex - 1 + roles.length) % roles.length);
  };

  return (
    <MainLayout>
      <div className="users-container">
        <h2>Lista de Usuarios</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Agregar Usuario
        </Button>
        <Modal
          title="Agregar Usuario"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleAddUser}>
            <Form.Item
              name="username"
              label="Nombre de Usuario"
              rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Correo Electrónico"
              rules={[{ required: true, message: 'Por favor ingrese el correo electrónico' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="rol"
              label="Rol"
              rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
            >
              <Select>
                <Option value="user">Usuario</Option>
                <Option value="administrador">Administrador</Option>
                <Option value="master">Master</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Agregar
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Editar Usuario"
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
        >
          <Form form={editForm} onFinish={handleUpdateUser}>
            <Form.Item
              name="username"
              label="Nombre de Usuario"
              rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Correo Electrónico"
              rules={[{ required: true, message: 'Por favor ingrese el correo electrónico' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="rol"
              label="Rol"
              rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
            >
              <Select>
                <Option value="user">Usuario</Option>
                <Option value="administrador">Administrador</Option>
                <Option value="master">Master</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Actualizar
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        {roles.length > 0 && (
          <>
            <div className="navigation-buttons">
              <Button onClick={handlePrevious} disabled={roles.length <= 1}>
                &lt; Anterior
              </Button>
              <Button onClick={handleNext} disabled={roles.length <= 1}>
                Siguiente &gt;
              </Button>
            </div>
            <div key={currentRole}>
              <h3>{currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</h3>
              <Table columns={columns} dataSource={groupedUsers[currentRole]} rowKey="email" />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default UsersPage;