import React, { useState, useEffect } from 'react';
import { Typography, Button, Modal, Select, Row, Col, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './GroupPage.css';
import MainLayout from '../../layouts/MainLayout';

const { Title } = Typography;
const { Option } = Select;

const GroupPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [userGroup, setUserGroup] = useState(null);

  useEffect(() => {
    const fetchGroupTasks = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/user/group/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setFilteredTasks(data);
    };

    const fetchUserGroup = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/user/group', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.group) {
        setUserGroup(data.group);
        fetchGroupTasks();
      }
    };

    fetchUserGroup();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/status/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setFilteredTasks(filteredTasks.map(task => (task.id === taskId ? updatedTask : task)));
        message.success('Estado de la tarea actualizado correctamente');
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar el estado de la tarea', errorData);
        message.error('Error al actualizar el estado de la tarea');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea', error);
      message.error('Error al actualizar el estado de la tarea');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const draggedTask = filteredTasks.find(task => task.id === draggableId);
    const updatedTask = { ...draggedTask, status: destination.droppableId };

    await handleStatusChange(draggableId, destination.droppableId);
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
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
      <div className="group-container">
        <Title level={2}>Tareas del Grupo: {userGroup ? userGroup.name : ''}</Title>
        <DragDropContext onDragEnd={onDragEnd}>
          <Row gutter={[16, 16]}>
            {['in-progress', 'done', 'paused', 'revision'].map(status => (
              <Col key={status} xs={24} sm={12} md={6}>
                <div className="kanban-column">
                  <h3>{status.replace('-', ' ').toUpperCase()}</h3>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="kanban-column-content"
                      >
                        {getTasksByStatus(status).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="kanban-card"
                              >
                                <Card
                                  title={
                                    <div className="card-title-container" style={{ backgroundColor: getStatusColor(task.status) }}>
                                      {task.name_task}
                                    </div>
                                  }
                                >
                                  <p>Estado: {task.status}</p>
                                  <p>Descripción: {task.description}</p>
                                  <p>Fecha límite: {task.dead_line ? moment(task.dead_line).format('DD/MM/YYYY HH:mm') : 'No especificada'}</p>
                                  <p>Categoría: {task.category}</p>
                                  <p>Estado: 
                                    <Select
                                      defaultValue={task.status}
                                      style={{ width: 120 }}
                                      onChange={(value) => handleStatusChange(task.id, value)}
                                    >
                                      <Option value="in-progress">En Progreso</Option>
                                      <Option value="done">Hecho</Option>
                                      <Option value="paused">Pausado</Option>
                                      <Option value="revision">En Revisión</Option>
                                    </Select>
                                  </p>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </Col>
            ))}
          </Row>
        </DragDropContext>
      </div>
    </MainLayout>
  );
};

export default GroupPage;