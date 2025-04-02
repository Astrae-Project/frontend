'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import Input from "../textarea/textarea-demo";
import "./chat-style.css";
import { IconDotsVertical, IconLogout2, IconPencil, IconPin } from "@tabler/icons-react";
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
  const [selectedGroup, setSelectedGroup] = useState(null); // Estado para el grupo seleccionado
  const [activeBubble, setActiveBubble] = useState(null); // Estado para el componente activo
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState(""); // Tipo de mensaje (info, error, etc.)
  const [formData, setFormData] = useState({
    nombre: groupData ? groupData.nombre : "",
    descripcion: groupData ? groupData.descripcion : "",
    tipo: groupData ? groupData.tipo : "privado",
  });
  const dropdownRef = useRef(null);
  

  // Referencias para el scroll
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Convertir groupId a número
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

  // Obtener datos del grupo
  useEffect(() => {
    if (!numericGroupId) return;
    const fetchGroupData = async () => {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/grupos/data/${numericGroupId}`
        );
        setGroupData(response.data);
      } catch (error) {
        console.error("Error obteniendo datos del grupo:", error);
      }
    };
    fetchGroupData();
  }, [numericGroupId]);

  // Obtener mensajes
  useEffect(() => {
    if (!numericGroupId) return;
    setIsLoading(true);
    const fetchMessages = async () => {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/grupos/ver/${numericGroupId}/mensajes`
        );
        console.log("Mensajes recibidos:", response.data.mensajes);
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
      console.log(`Socket ${newSocket.id} unido a la sala ${numericGroupId}`);
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
    e.stopPropagation(); // Evitar la propagación del clic
    setOpenDropdownId(openDropdownId === miembro.id ? null : miembro.id);
  };

    useEffect(() => {
      const handleClickOutside = (event) => {
        // Solo cerrar si el clic es fuera de todos los elementos relacionados al dropdown
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          // Verifica que el clic no sea en el botón del dropdown
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
  }

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
      const response = await customAxios.put(
        `http://localhost:5000/api/grupos/datos/${groupId}`,
        formData
      );
      setActiveBubble(null);
      setGroupData(response.data);
    }
    catch (error) {
      console.error("Error editando grupo:", error);
      setConfirmationMessage("Error editando grupo.");
      setMessageType("error");
    }
  }

  // Al enviar un mensaje se genera la fecha actual en el frontend
  const handleSendMessage = useCallback(
    async (messageContent) => {
      if (!socket || !numericGroupId || !currentUser) return;
      try {
        const messageData = {
          contenido: messageContent,
          id_emisor: currentUser.id,
          id_grupo: numericGroupId,
          fecha_envio: new Date().toISOString(), // Genera la fecha al enviar
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

  // Formatea la hora y minutos (HH:mm)
  function formatHourMinutes(fecha) {
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  // Formatea la fecha para el separador (ej. "18 de noviembre")
  function formatDateSeparator(fecha) {
    const date = new Date(fecha);
    const options = { day: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", options);
  }

  // Función auxiliar para validar fechas
  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Renderiza los mensajes con separadores de fecha y controla la repetición del header
  const renderMessagesWithSeparators = () => {
    const elements = [];
    let lastDateKey = "";
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.fecha_envio);
      let msgDateKey = "";
      if (isValidDate(msgDate)) {
        msgDateKey = msgDate.toISOString().split("T")[0]; // Formato: YYYY-MM-DD
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
      // Para mensajes de otros, si el mensaje anterior es del mismo usuario y en el mismo día, no se muestra el header
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
        // Para mensajes consecutivos sin header, agregamos la clase "consecutive-message"
        const messageClass = showHeader ? "other-message" : "other-message consecutive-message";
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container other-message-container">
            {showHeader && (
              <div className="avatar-miembro">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${msg.emisor.username}`}
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
              <div className="avatar1" aria-label="Avatar del grupo" />
              <p className="nombre-grupo">{groupData ? groupData.nombre : "Cargando..."}</p>
            </div>
            <div className="header-icons">
              <button type="button" aria-label="Fijar grupo">
                <IconPin className="iconos" />
              </button>
              <div ref={dropdownRef}>
                  <button
                    onClick={(e) => handleDropdownClick(e, groupData)}
                    className="btn-acciones"
                    >
                    <IconDotsVertical />
                  </button>
                {openDropdownId && (
                  <div 
                    className="dropdown1" 
                    onClick={(e) => e.stopPropagation()}
                  >
                  {isCurrentUserAdmin() && (
                    
                  <button
                    className="btn-dropdown1"
                    id="ver-perfil1"
                    onClick={() => {
                      setSelectedGroup(groupData); // Guardamos el miembro seleccionado
                      setActiveBubble("editar-grupo");
                    }}
                    >
                      <IconPencil/>
                      <p>Editar</p>
                    </button>)}                             
                    <button
                      className="btn-dropdown1"
                      id="eliminar1"
                      >
                      <IconLogout2/>
                      <p>Salir</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="chat-messages" ref={chatContainerRef}>
            {isLoading ? (
              <div className="loading-messages">Cargando mensajes...</div>
            ) : (
              <>
                {renderMessagesWithSeparators()}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <Input onSendMessage={handleSendMessage} />
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
                Cancelar
              </button>
              <button type="submit" className="botn-eventos enviar">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      </Bubble>
    </div>
  );
};

export default ChatGroup;
