'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import Input from "../textarea/textarea-demo";
import "./chat-style.css";
import { IconDotsVertical, IconPin } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

const SOCKET_SERVER_URL = "http://localhost:5000";

const ChatGroup = ({ groupId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Referencias para el scroll
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Convertir groupId a número
  const numericGroupId = groupId ? parseInt(String(groupId).trim(), 10) : null;

  // Obtener datos del usuario
  const fetchRol = async () => {
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/data/usuario`,
        { withCredentials: true }
      );
      setCurrentUser(response.data.inversor?.usuario || response.data.startup?.usuario);
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

  // Al enviar un mensaje, se genera fecha en el frontend
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
          { ...messageData, emisor: { id: currentUser.id, username: currentUser.username } },
        ]);
        await customAxios.post(
          `http://localhost:5000/api/grupos/enviar/${numericGroupId}/mensajes`,
          messageData
        );
        socket.emit("sendMessage", { ...messageData, username: currentUser.username });
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
      }
    },
    [socket, numericGroupId, currentUser]
  );

  // Función para formatear la hora y los minutos (HH:mm)
  function formatHourMinutes(fecha) {
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  // Función para formatear la fecha del separador (ej: "18 de noviembre")
  function formatDateSeparator(fecha) {
    const date = new Date(fecha);
    const options = { day: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", options);
  }

  // Función auxiliar para validar la fecha
  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Renderiza los mensajes con separadores de fecha
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
              {formatDateSeparator(msg.fecha_envio)}
            </div>
          );
          lastDateKey = msgDateKey;
        }
      } else {
        console.error("Fecha inválida en mensaje:", msg.fecha_envio);
      }
      
      const isMyMessage = currentUser && msg.emisor.id === currentUser.id;
      if (isMyMessage) {
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container my-message-container">
            <div className="message-content">
              <div className="chat-message my-message">
                <span>{msg.contenido}</span>
                <span className="message-time">{formatHourMinutes(msg.fecha_envio)}</span>
              </div>
            </div>
          </div>
        );
      } else {
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container other-message-container">
            <div className="avatar">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${msg.emisor.username}`}
                alt="Avatar"
              />
            </div>
            <div className="message-content">
              <p className="username">{msg.emisor.username}</p>
              <div className="chat-message other-message">
                <span>{msg.contenido}</span>
                <span className="message-time">{formatHourMinutes(msg.fecha_envio)}</span>
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
      { !numericGroupId ? (
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
              <button type="button" aria-label="Más opciones">
                <IconDotsVertical className="iconos" />
              </button>
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
    </div>
  );
};

export default ChatGroup;
