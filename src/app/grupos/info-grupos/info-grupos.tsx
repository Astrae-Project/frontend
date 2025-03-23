'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import "./info-grupos-style.css";
import "../../ui/components/bento-inicio/bento-inicio-style.css";
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
  // Nuevo estado para la pestaña activa en la barra superior
  const [activeTab, setActiveTab] = useState('info');

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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <div className="contenido-vacio info-vacio">
          <p>Selecciona un grupo para ver la información.</p>
        </div>
      ) : loading ? (
        <p>Cargando información del grupo...</p>
      ) : !grupo ? (
        <p>No se encontró información del grupo.</p>
      ) : (
        <div className="info-grupo">
          {/* Barra superior con pestañas */}
          <nav className="top-bar">
            <ul className="tabs-list">
              {['info', 'ofertas', 'archivos'].map((tab) => (
                <li
                  key={tab}
                  className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <p>{tab.charAt(0).toUpperCase() + tab.slice(1)}</p> 
                </li>
              ))}
            </ul>
          </nav>

          {/* Se muestra el contenido según la pestaña activa */}
          {activeTab === 'info' && (
            <>
              <div className="info-grupo-container">
                <p className="titulo-informacion">Información principal</p>

                <div className="espacio">
                  <p className="titulo-primero">Creador</p>
                  <div className="creador-info">
                    <div className="avatar-creador">
                      {grupo.creador?.avatar ? grupo.creador.avatar : grupo.creador.username.charAt(0).toUpperCase()}
                    </div>  
                    <p className="titulo-segundo">{grupo.creador?.username}</p>
                  </div>
                </div>

                <div className="espacio">
                  <p className="titulo-primero">Fecha de creación</p>
                  <p className="titulo-segundo">{formatFecha(grupo.fecha_creacion)}</p>
                </div>

                <div className="espacio">
                  <p className="titulo-primero">Tipo</p>
                  <p className="titulo-segundo">{capitalizeFirstLetter(grupo.tipo)}</p>
                </div>
              </div>

              <p className="titulo-informacion" id="titulo-descripcion">Descripción</p>
              <div className="descripcion-container">
                <p className="descripcion">{grupo.descripcion}</p>
              </div>

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
                        <div key={miembro.id} className="avatar-miembro">
                          {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="miembros-expandido">
                      <button onClick={() => setExpanded(false)} className="collapse-button">
                        <IconArrowsDiagonalMinimize2/>
                      </button>
                      <ul>
                        <li className="miembro añadir-miembro" onClick={handleOpenAddMemberBubble}>
                          <div className="info-miembro">
                            <div className="contendor-username" id="añadir-miembro">
                              <p>Añadir miembros</p>
                            </div>
                          </div>
                        </li>
                        {grupo.miembros.map((miembro) => (
                          <li key={miembro.id} className="miembro">
                            <div className="avatar-miembro">
                              {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="info-miembro">
                              <div className="contendor-username">
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

              <div className="permisos-seccion">
                <p className="titulo-informacion">Permisos</p>
                <div className="permisos-resumen">
                  <div className="espacio">
                    <p className="titulo-primero">Permisos por defecto</p>
                    <div className="permisos-defecto">
                      <div className="permiso-item">
                        <span className="icono-permiso">📝</span>
                        <p className="titulo-segundo">Editar información: {grupo.permisosDefecto?.editarInfo ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="espacio">
                    <p className="titulo-primero">Permisos por defecto</p>
                    <div className="permisos-defecto">
                      <div className="permiso-item">
                        <span className="icono-permiso">👥</span>
                        <p className="titulo-segundo">Invitar miembros: {grupo.permisosDefecto?.invitarMiembros ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="espacio">
                    <p className="titulo-primero">Permisos por defecto</p>
                    <div className="permisos-defecto">
                      <div className="permiso-item">
                        <span className="icono-permiso">📂</span>
                        <p className="titulo-segundo">Subir archivos: {grupo.permisosDefecto?.subirArchivos ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab === 'ofertas' && (
            <div>
              <p>Contenido de ofertas</p>
              {/* Aquí puedes implementar el contenido relacionado a Files */}
            </div>
          )}
          {activeTab === 'archivos' && (
            <div>
              <p>Contenido de archivos</p>
              {/* Aquí puedes implementar el contenido relacionado a Pins */}
            </div>
          )}
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
              <div className="espacio-vacio">
                <p>No hay usuarios disponibles para añadir</p>
              </div>
            ) : (
              <div className="lista-usuarios-disponibles">
                <ul className="lista-usuarios">
                  {availableUsers.map(user => (
                    <li 
                      key={user.id} 
                      className={`usuario-disponible ${selectedUser && selectedUser.id === user.id ? 'seleccionado' : ''}`}
                      onClick={() => selectUser(user)}
                    >
                      <div className="disponible-avatar">
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
