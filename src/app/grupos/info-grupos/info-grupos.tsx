'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import "./info-grupos-style.css";
import { IconArrowsDiagonal, IconArrowsDiagonalMinimize2, IconDotsVertical } from "@tabler/icons-react";
import Bubble from "@/app/ui/components/bubble/bubble";

const InfoGrupos = ({ groupId }) => {
  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false); // Estado para controlar la vista expandida
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Si no hay grupo seleccionado, reseteamos y salimos
    if (!groupId) {
      setGrupo(null);
      return;
    }
    setLoading(true);
    const fetchGrupo = async () => {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/grupos/data/${groupId}`,
          { withCredentials: true }
        );
        setGrupo(response.data);
      } catch (error) {
        console.error("Error al obtener la información del grupo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrupo();
  }, [groupId]);

  // Función para obtener usuarios disponibles para añadir al grupo
  const fetchAvailableUsers = async () => {
    if (!groupId) return;
    
    setLoadingUsers(true);
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/grupos/disponible/${groupId}`,
        { withCredentials: true }
      );
      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios disponibles:", error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Función para manejar la apertura del bubble de añadir miembro
  const handleOpenAddMemberBubble = () => {
    setActiveBubble("añadir-miembro");
    setSelectedUser(null);
    fetchAvailableUsers();
  };

  // Función para añadir un miembro al grupo
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser || !groupId) return;

    try {
      await customAxios.post(
        `http://localhost:5000/api/grupos/${groupId}/miembros`,
        { userId: selectedUser.id },
        { withCredentials: true }
      );
      
      // Actualizar el grupo después de añadir un miembro
      const response = await customAxios.get(
        `http://localhost:5000/api/grupos/data/${groupId}`,
        { withCredentials: true }
      );
      setGrupo(response.data);
      
      setConfirmationMessage('Usuario añadido correctamente');
      setMessageType('success');
      
      // Resetear el usuario seleccionado
      setSelectedUser(null);
      
      // Cerrar el bubble después de un tiempo
      setTimeout(() => {
        closeBubble();
      }, 2000);
      
    } catch (error) {
      console.error("Error al añadir miembro:", error);
      setConfirmationMessage('Error al añadir el usuario');
      setMessageType('error');
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const opcionesMes = { month: 'long' };
    const nombreMes = new Intl.DateTimeFormat('es-ES', opcionesMes).format(date);
    return `${date.getDate()} de ${nombreMes} de ${date.getFullYear()}`;
  };

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage('');
    setSelectedUser(null);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      {!groupId ? (
        <div className="contenido-vacio" id="info-vacio">
          <p>Selecciona un grupo para ver la información.</p>
        </div>
      ) : loading ? (
        <p>Cargando información del grupo...</p>
      ) : !grupo ? (
        <p>No se encontró información del grupo.</p>
      ) : (
        <div className="info-grupo">
          <p>{grupo.descripcion}</p>
          <p>Fecha de creación: {formatFecha(grupo.fecha_creacion)}</p>
          <p>Tipo: {grupo.tipo}</p>
          <div className="miembros">
            <p className="titulo-miembros">
              Miembros <span className="contador-miembros">({grupo.miembros.length})</span>
            </p>
            <div className={`miembros-container ${expanded ? 'expanded' : ''}`}>
              {!expanded ? (
                <div className="miembros-resumen">
                  <button onClick={() => setExpanded(true)} className="collapse-button">
                    <IconArrowsDiagonal/>
                  </button>
                  {grupo.miembros.map((miembro) => (
                    <div key={miembro.id} className="avatar1">
                      {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                // Vista expandida: se muestran avatar, username, rol y botón de acciones
                <div className="miembros-expandido">
                  <button onClick={() => setExpanded(false)} className="collapse-button">
                    <IconArrowsDiagonalMinimize2/>
                  </button>
                  <ul>
                    <li className="miembro añadir-miembro" onClick={handleOpenAddMemberBubble}>
                      <div className="info-miembro">
                        <div className="contendor-username">
                          <p>Añadir miembros</p>
                        </div>
                      </div>
                    </li>
                    {grupo.miembros.map((miembro) => (
                      <li key={miembro.id} className="miembro">
                        <div className="avatar1">
                          {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="info-miembro">
                          <div className="contendor-username" title={miembro.username}>
                            {miembro.username}
                          </div>
                        </div>
                        <div className="rol-grupos">
                          <p>{capitalizeFirstLetter(miembro.rol)}</p>
                        </div>
                        <button className="btn-acciones"><IconDotsVertical /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage} // Pasar el mensaje de confirmación
        type={messageType} // Pasar el tipo de mensaje (success o error)
      >
        {activeBubble === 'añadir-miembro' && (
          <div className="bubble-añadir">
            <h3>Añadir miembro</h3>
            {loadingUsers ? (
              <p>Cargando usuarios disponibles...</p>
            ) : availableUsers.length === 0 ? (
              <p>No hay usuarios disponibles para añadir</p>
            ) : (
              <div className="lista-usuarios-disponibles">
                <ul>
                  {availableUsers.map(user => (
                    <li 
                      key={user.id} 
                      className={`usuario-item ${selectedUser && selectedUser.id === user.id ? 'seleccionado' : ''}`}
                      onClick={() => selectUser(user)}
                    >
                      <div className="avatar1">
                        {user.avatar ? user.avatar : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="info-usuario">
                        <p>{user.username}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="contendor-botn-evento">
              <button type="button" className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button 
                type="button" 
                className="botn-eventos enviar" 
                onClick={handleAddMember} 
                disabled={!selectedUser}
              >
                Añadir
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </>
  );
};

export default InfoGrupos;