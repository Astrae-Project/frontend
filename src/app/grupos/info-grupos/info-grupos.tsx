'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect, useCallback, useRef } from "react";
import "./info-grupos-style.css";
import "../../ui/components/bento-inicio/bento-inicio-style.css";
import {
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconDotsVertical
} from "@tabler/icons-react";
import Bubble from "@/app/ui/components/bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";

const InfoGrupos = ({ groupId }) => {
  const [usuario, setUsuario] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Cargar información del grupo según groupId
  useEffect(() => {
    if (!groupId) {
      setGrupo(null);
      return;
    }
    setLoading(true);
    const fetchGrupo = async () => {
      try {
        const { data } = await customAxios.get(
          `http://localhost:5000/api/grupos/data/${groupId}`,
          { withCredentials: true }
        );
        setGrupo(data);
      } catch (error) {
        console.error("Error al obtener la información del grupo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrupo();
  }, [groupId]);

  // Cargar información del usuario actual
  const fetchUsuario = useCallback(async () => {
    try {
      const { data } = await customAxios.get("http://localhost:5000/api/data/usuario", {
        withCredentials: true,
      });
      setUsuario(data);
    } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  // Definir el id del usuario actual, ya sea inversor o startup
  const currentUserId = usuario?.inversor?.id_usuario || usuario?.startup?.id_usuario;

  // Determinar si el usuario actual es administrador en el grupo
  const isCurrentUserAdmin = () => {
    const currentMember = grupo?.miembros.find(miembro => miembro.id === currentUserId);
    return currentMember && currentMember.rol.toLowerCase() === 'administrador';
  };

  // Obtener usuarios disponibles para añadir al grupo
  const fetchAvailableUsers = async () => {
    if (!groupId) return;
    setLoadingUsers(true);
    try {
      const { data } = await customAxios.get(
        `http://localhost:5000/api/grupos/disponible/${groupId}`,
        { withCredentials: true }
      );
      setAvailableUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios disponibles:", error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Abrir bubble para añadir miembro
  const handleOpenAddMemberBubble = () => {
    setActiveBubble("añadir-miembro");
    setSelectedUser(null);
    fetchAvailableUsers();
  };

  // Añadir un miembro al grupo
  const handleAddMember = async () => {
    if (!selectedUser || !groupId) return;
    try {
      await customAxios.post(
        `http://localhost:5000/api/grupos/anadir/${groupId}/miembro/${selectedUser.id}`,
        { withCredentials: true }
      );
      // Actualizar la información del grupo
      const { data } = await customAxios.get(
        `http://localhost:5000/api/grupos/data/${groupId}`,
        { withCredentials: true }
      );
      setGrupo(data);
      setConfirmationMessage('Usuario añadido correctamente');
      setMessageType('success');
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al añadir miembro:", error);
      setConfirmationMessage('Error al añadir el usuario');
      setMessageType('error');
    }
  };

  // Eliminar un miembro del grupo (corregido)
  const handleRemoveMember = async () => {
    if (!selectedUser || !groupId) return;
    
    try {
      // Eliminar al usuario del grupo usando DELETE y pasando el id en la URL
      await customAxios.delete(
        `http://localhost:5000/api/grupos/eliminar/${groupId}/miembro/${selectedUser.id}`,
        { withCredentials: true }
      );
  
      // Actualizar la información del grupo
      const { data } = await customAxios.get(
        `http://localhost:5000/api/grupos/data/${groupId}`,
        { withCredentials: true }
      );
  
      setGrupo(data);
      setConfirmationMessage('Usuario eliminado correctamente');
      setMessageType('success');
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      setConfirmationMessage('Error al eliminar el usuario');
      setMessageType('error');
    }
  };

  // Función para formatear la fecha en dd/mm/yyyy
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Capitalizar la primera letra del string
  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage('');
    setSelectedUser(null);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if the click is outside ALL dropdown-related elements
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        // Check that the click is not on the dropdown toggle button
        !event.target.closest('.btn-dropdown')
      ) {
        setOpenDropdownId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUser = (user) => setSelectedUser(user);

  // Condición para mostrar el botón de "Añadir miembros"
  const canInviteMembers =
    grupo?.permisos?.find(p => p.permiso === "invitar_miembros")?.abierto || isCurrentUserAdmin();

  // Nuevos manejadores de eventos para dropdown
  const handleDropdownClick = (e, miembro) => {
    e.stopPropagation(); // Stop the click from propagating
    setOpenDropdownId(openDropdownId === miembro.id ? null : miembro.id);
  };

  const handleDropdownActionClick = (e, action, miembro) => {
    e.stopPropagation(); // Prevent closing the dropdown
    
    if (action === 'edit') {
      setActiveBubble({ type: "perfil-miembro", miembro });
      setOpenDropdownId(null);
    } else if (action === 'remove') {
      selectUser(miembro);
      handleRemoveMember();
      setOpenDropdownId(null);
    }
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
        <div className="informacion-grupo">
          <nav className="top-bar">
            <ul className="tabs-list">
              {['info', 'ofertas', 'archivos'].map((tab) => (
                <li
                  key={tab}
                  className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <p>{capitalizeFirstLetter(tab)}</p>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contenido según la pestaña activa */}
          {activeTab === 'info' && (
            <>
              <div className="info-grupo-container">
                <p className="titulo-informacion">Información principal</p>
                <div className="espacio">
                  <p className="titulo-primero">Creador</p>
                  <div className="creador-info">
                    <div className="avatar-creador">
                      {grupo.creador?.avatar ? (
                        <img src={grupo.creador.avatar} alt="Avatar del creador" />
                      ) : (
                        grupo.creador.username.charAt(0).toUpperCase()
                      )}
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
                    <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="collapse-button"
                    >
                    {expanded ? <IconArrowsDiagonalMinimize2 /> : <IconArrowsDiagonal />}
                    </button>

                </p>
                <div className={`miembros-container ${expanded ? 'expanded' : ''}`}>
                  {!expanded ? (
                    <div className="miembros-resumen">
                      {grupo.miembros.map(miembro => (
                        <div key={miembro.id} className="avatar-miembro">
                          {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="miembros-expandido">
                      <ul>
                        {canInviteMembers && (
                          <li className="miembro añadir-miembro" onClick={handleOpenAddMemberBubble}>
                            <div className="info-miembro">
                              <div className="contendor-username" id="añadir-miembro">
                                <p>Añadir miembros</p>
                              </div>
                            </div>
                          </li>
                        )}
                        {grupo.miembros.map(miembro => (
                          <li key={miembro.id} className="miembro">
                            <div className="avatar-miembro">
                              {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="info-miembro">
                              <div className="contendor-username">
                                {miembro.username}
                              </div>
                            </div>
                            <div className={`rol-grupos ${miembro.rol === "administrador" ? "rol-admin" : "rol-miembro"}`}>
                              <p>{capitalizeFirstLetter(miembro.rol)}</p>
                            </div>
                            <div ref={dropdownRef}>
                              {miembro.id !== currentUserId && (
                                <button
                                  onClick={(e) => handleDropdownClick(e, miembro)}
                                  className="btn-acciones"
                                >
                                  <IconDotsVertical />
                                </button>
                              )}
                              {openDropdownId === miembro.id && (
                                <div 
                                  className="dropdown" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="btn-dropdown"
                                    onClick={(e) => handleDropdownActionClick(e, 'edit', miembro)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="btn-dropdown"
                                    id="eliminar"
                                    onClick={(e) => handleDropdownActionClick(e, 'remove', miembro)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                        </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="permisos-seccion">
                <p className="titulo-informacion">Permisos</p>
                <div className="espacio">
                  <p className="titulo-primero">Invitar miembros</p>
                  <div className={`rol-grupos ${grupo.permisos?.find(p => p.permiso === "invitar_miembros")?.abierto ? "rol-miembro" : "rol-admin"}`}>
                    <p>{grupo.permisos?.find(p => p.permiso === "invitar_miembros")?.abierto ? 'Miembro' : 'Administrador'}</p>
                  </div>
                </div>
                <div className="espacio">
                  <p className="titulo-primero">Subir documentos</p>
                  <div className={`rol-grupos ${grupo.permisos?.find(p => p.permiso === "subir_documentos")?.abierto ? "rol-miembro" : "rol-admin"}`}>
                    <p>{grupo.permisos?.find(p => p.permiso === "subir_documentos")?.abierto ? 'Miembro' : 'Administrador'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ofertas' && (
            <div>
              <p>Contenido de ofertas</p>
              {/* Implementar contenido relacionado a ofertas */}
            </div>
          )}

          {activeTab === 'archivos' && (
            <div>
              <p>Contenido de archivos</p>
              {/* Implementar contenido relacionado a archivos */}
            </div>
          )}
        </div>
      )}

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "perfil-miembro" && (
          <PerfilOtro username={miembro.username}></PerfilOtro>
        )}

        {activeBubble === "añadir-miembro" && (
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