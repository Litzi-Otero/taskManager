import React, { useState, useEffect } from 'react';
import { Typography, List, Button, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const { Title } = Typography;

const GroupMembersPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      const token = localStorage.getItem('authToken');
      //const response = await fetch(`https://backtasks-vc1c.onrender.com/api/groups/${groupId}`, {
        const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setGroup(data);
      } else {
        console.error('Error al obtener el grupo:', data);
        message.error('Error al obtener el grupo');
      }
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      //const response = await fetch('https://backtasks-vc1c.onrender.com/api/users', {
        const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('La respuesta de la API no es un array:', data);
      }
    };

    fetchGroup();
    fetchUsers();
  }, [groupId]);

  const handleAssignTask = (user) => {
    navigate(`/assign-task/${user.email}`);
  };

  return (
    <MainLayout>
      <div className="group-members-container">
        {group && (
          <>
            <Title level={2}>Miembros del Grupo: {group.name}</Title>
            <List
              dataSource={group.members}
              renderItem={email => {
                const user = users.find(user => user.email === email);
                return (
                  <List.Item actions={[<Button onClick={() => handleAssignTask(user)}>Asignar Tarea</Button>]}>
                    {user ? `${user.username} (${user.email})` : email}
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default GroupMembersPage;