'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import Input from "../textarea/textarea-demo";
import "./chat-style.css";
import { IconDotsVertical, IconLogout2, IconPencil, IconPin, IconUserShield } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";
import Bubble from "@/app/ui/components/bubble/bubble";

const SOCKET_SERVER_URL = "http://localhost:5000";

const ChatGroup = ({ groupId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formData, setFormData] = useState({
    nombre: groupData ? groupData.nombre : "",
    descripcion: groupData ? groupData.descripcion : "",
    tipo: groupData ? groupData.tipo : "privado",
  });
  const dropdownRef = useRef(null);
  const [permisos, setPermisos] = useState([]);

  
  // Referencias para el scroll
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const numericGroupId = groupId ? parseInt(String(groupId).trim(), 10) : null;

  const isCurrentUserAdmin = () => {
    const currentMember = groupData?.miembros.find(miembro => miembro.id === currentUserId);
    return currentMember && currentMember.rol.toLowerCase() === 'administrador';
  };

  const currentUserId = currentUser ? currentUser.id : null;

  // Obtener datos del usuario
  const fetchRol = async () => {
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/data/usuario`,
        { withCredentials: true }
      );
      setCurrentUser(
        response.data.inversor?.usuario || response.data.startup?.usuario
      );
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchRol();
  }, []);

  const fetchGroupData = async () => {
    if (!numericGroupId) return;
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/grupos/data/${numericGroupId}`
      );
      setGroupData(response.data);
      setPermisos(response.data.permisos);
    } catch (error) {
      console.error("Error obteniendo datos del grupo:", error);
    }
  };
  
  useEffect(() => {
    fetchGroupData();
  }, [numericGroupId]);

  const actualizarPermiso = async (permisoId, nuevoValor) => {
  try {
    await customAxios.put(`http://localhost:5000/api/grupos/cambio-permiso/${numericGroupId}`, {
      groupId: numericGroupId,
      permiso: permisoId,
      abierto: nuevoValor,
    });
  } catch (error) {
    console.error("Error actualizando permiso:", error);
  }
};
  useEffect(() => {
    if (permisos.length > 0) {
      permisos.forEach((permiso) => {
        actualizarPermiso(permiso.permiso, permiso.abierto);
      });
    }
  }, [permisos]);

  const togglePermiso = (permisoId) => {
  setPermisos((prev) =>
    prev.map((permiso) => {
      if (permiso.permiso === permisoId) {
        const nuevoValor = !permiso.abierto;
        // Llamada al backend
        actualizarPermiso(permisoId, nuevoValor);
        return { ...permiso, abierto: nuevoValor };
      }
      return permiso;
      })
    );
  };

  
  // Obtener mensajes
  useEffect(() => {
    if (!numericGroupId) return;
    setIsLoading(true);
    const fetchMessages = async () => {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/grupos/ver/${numericGroupId}/mensajes`
        );
        setMessages(response.data.mensajes);
      } catch (error) {
        console.error("Error obteniendo mensajes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [numericGroupId]);

  // Hacer scroll al final cuando se carguen los mensajes
  useEffect(() => {
    if (chatContainerRef.current && !isLoading) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Conexión con Socket.IO
  useEffect(() => {
    if (!numericGroupId) return;
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });
    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", numericGroupId);
    });
    newSocket.on("newMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isAtBottom) {
          setTimeout(() => {
            chatContainerRef.current.scrollTo({
              top: chatContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        }
      }
    });
    newSocket.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [numericGroupId]);

  const handleDropdownClick = (e, miembro) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === miembro.id ? null : miembro.id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.btn-dropdown')
      ) {
        setOpenDropdownId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setMessageType("");
  };

  useEffect(() => {
    if (activeBubble === "editar-grupo" && selectedGroup) {
      setFormData({
        nombre: selectedGroup.nombre || "",
        descripcion: selectedGroup.descripcion || "",
        tipo: selectedGroup.tipo || "publico"
      });
    }
  }, [activeBubble, selectedGroup]);
  
  const handleEditarGrupo = async () => {
    try {
      await customAxios.put(
        `http://localhost:5000/api/grupos/datos/${groupId}`,
        formData
      );
      await fetchGroupData();
      setActiveBubble(null);
    } catch (error) {
      console.error("Error editando grupo:", error);
      setConfirmationMessage(error.response.data.message);
      setMessageType("error");
    }
  };  

  const handleSalirGrupo = async () => {
    try {
      await customAxios.delete(
        `http://localhost:5000/api/grupos/salir/${groupId}`
      );
      setActiveBubble(null);
      setGroupData(null);
      setConfirmationMessage("Has salido del grupo correctamente.");
      setMessageType("success");
    } catch (error) {
      console.error("Error saliendo del grupo:", error);
      setConfirmationMessage(error.response.data.message);
      setMessageType("error");
    }
  };

  // Función para enviar el mensaje. Recibe el contenido como argumento.
  const handleSendMessage = useCallback(
    async (messageContent) => {
      if (!socket || !numericGroupId || !currentUser) return;
      try {
        const messageData = {
          contenido: messageContent,
          id_emisor: currentUser.id,
          id_grupo: numericGroupId,
          fecha_envio: new Date().toISOString(),
        };
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...messageData,
            emisor: { id: currentUser.id, username: currentUser.username },
          },
        ]);
        await customAxios.post(
          `http://localhost:5000/api/grupos/enviar/${numericGroupId}/mensajes`,
          messageData
        );
        socket.emit("sendMessage", {
          ...messageData,
          username: currentUser.username,
        });
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
      }
    },
    [socket, numericGroupId, currentUser]
  );

  function formatHourMinutes(fecha) {
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  function formatDateSeparator(fecha) {
    const date = new Date(fecha);
    const options = { day: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", options);
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  const renderMessagesWithSeparators = () => {
    const elements = [];
    let lastDateKey = "";
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.fecha_envio);
      let msgDateKey = "";
      if (isValidDate(msgDate)) {
        msgDateKey = msgDate.toISOString().split("T")[0];
        if (msgDateKey !== lastDateKey) {
          elements.push(
            <div key={`sep-${msgDateKey}`} className="date-separator">
              <p>{formatDateSeparator(msg.fecha_envio)}</p>
            </div>
          );
          lastDateKey = msgDateKey;
        }
      } else {
        console.error("Fecha inválida en mensaje:", msg.fecha_envio);
      }

      const isMyMessage = currentUser && msg.emisor.id === currentUser.id;
      let showHeader = true;
      if (!isMyMessage && index > 0) {
        const prevMsg = messages[index - 1];
        if (prevMsg.emisor.id === msg.emisor.id) {
          const prevDateKey = new Date(prevMsg.fecha_envio).toISOString().split("T")[0];
          if (prevDateKey === msgDateKey) {
            showHeader = false;
          }
        }
      }

      if (isMyMessage) {
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container my-message-container">
            <div className="message-content">
              <div className="chat-message my-message">
                <span className="contenido">{msg.contenido}</span>
                <span className="message-time" id="time">{formatHourMinutes(msg.fecha_envio)}</span>
              </div>
            </div>
          </div>
        );
      } else {
        const messageClass = showHeader ? "other-message" : "other-message consecutive-message";
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container other-message-container">
            {showHeader && (
              <div className="avatar-miembro">
                <img
                  src={msg.emisor.avatar || "/default-avatar.png"}
                  className="avatar-imagen"
                  alt="Avatar"
                />
              </div>
            )}
            <div className="message-content">
              {showHeader && <p className="username">{msg.emisor.username}</p>}
              <div className={`chat-message ${messageClass}`}>
                <span className="contenido">{msg.contenido}</span>
                <span className="message-time" id="time1">{formatHourMinutes(msg.fecha_envio)}</span>
              </div>
            </div>
          </div>
        );
      }
    });
    return elements;
  };

  return (
    <div className="chat-container">
      {!numericGroupId ? (
        <div className="contenido-vacio" id="vacio">
          <p>Selecciona un grupo para empezar a chatear.</p>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <div className="group-info">
              <div className="avatar1" aria-label="Avatar del grupo">
                <img
                  src={groupData?.avatar || "/group-default-avatar.png"}
                  alt="Avatar del grupo"
                />
              </div>
              <p className="nombre-grupo">{groupData ? groupData.nombre : "Cargando..."}</p>
            </div>
            <div className="header-icons">
              <div className="dropdown-ref" ref={dropdownRef}>
                <button
                  onClick={(e) => handleDropdownClick(e, groupData)}
                  className="iconos"
                >
                  <IconDotsVertical />
                </button>
                {openDropdownId && (
                  <div 
                    className="dropdown1" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCurrentUserAdmin() && (
                    <>
                      <button
                        className="btn-dropdown1"
                        id="ver-perfil1"
                        onClick={() => {
                          setSelectedGroup(groupData);
                          setActiveBubble("editar-grupo");
                        }}
                      >
                        <IconPencil />
                        <p>Editar</p>
                      </button>
                      <button
                        className="btn-dropdown1"
                        id="permisos1"
                        onClick={() => {
                          setSelectedGroup(groupData);
                          setActiveBubble("permisos");
                        }}
                      >
                        <IconUserShield />
                        <p>Permisos</p>
                      </button>
                    </>
                    )}                             
                    <button
                      className="btn-dropdown1"
                      id="eliminar1"
                      onClick={() => {
                        setActiveBubble("confirmacion");
                        setConfirmationMessage("¿Estás seguro de que deseas salir del grupo?");
                        setMessageType("neutral");
                      }}
                    >
                      <IconLogout2 />
                      <p>Salir</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="chat-messages" ref={chatContainerRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <img
                  src="/Logo.svg"
                  alt="Cargando..."
                  className="heartbeat"
                />
              </div>
            ) : (
              <>
                {renderMessagesWithSeparators()}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <Input onSendMessage={handleSendMessage} groupId={groupId} />
        </>
      )}

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "editar-grupo" && selectedGroup && (
          <div className="crear-grupo-container">
            <h2>Editar Grupo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditarGrupo();
              }}
              className="crear-grupo-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                  placeholder="Descripción del grupo"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <div className="tipo-opciones">
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="publico"
                      checked={formData.tipo === "publico"}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={formData.tipo === "privado"}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    />
                    <p className="text-label">Privado</p>
                  </label>
                </div>
              </div>
              <div className="contendor-botn-grupo">
                <button
                  type="button"
                  className="botn-eventos"
                  onClick={closeBubble}
                >
                  <p>Cancelar</p>
                </button>
                <button type="submit" className="botn-eventos enviar">
                  <p>Guardar</p>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeBubble === "confirmacion" && (
          <div className="confirmacion-container">
            <div className="botones-confirmacion">
              <button
                className="botn-confirmar"
                onClick={() => {
                  setActiveBubble(null);
                  setConfirmationMessage("");
                  setMessageType("");
                }}
              >
                Cancelar
              </button>
              <button
                className="botn-confirmar"
                id="salir"
                onClick={handleSalirGrupo}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "permisos" && selectedGroup && (
          <div className="permisos-container">
            <h2>Configurar permisos</h2>

            <ul className="lista-permisos">
              {permisos.map((permisoObj) => {
                const nombreVisible = {
                  invitar_miembros: "Invitar nuevos miembros",
                  crear_ofertas: "Publicar ofertas",
                  subir_documentos: "Subir documentos",
                }[permisoObj.permiso] || permisoObj.permiso;

                const acceso = permisoObj.abierto ? "Todos los miembros" : "Solo administradores";

                return (
                  <li key={permisoObj.permiso} className="permiso-item">
                    <div style={{ flex: 1 }}>
                      <div className="permiso-nombre">{nombreVisible}</div>
                      <div className="admins">{acceso}</div>
                    </div>

                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={!permisoObj.abierto}
                        onChange={() => togglePermiso(permisoObj.permiso)}
                      />
                      <span className="slider"></span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default ChatGroup;
