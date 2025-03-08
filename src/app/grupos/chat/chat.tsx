'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import Input from "../textarea/textarea-demo";
import "./chat-style.css";
import { IconPin, IconDots } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

const SOCKET_SERVER_URL = "http://localhost:5000";

const ChatGroup = ({ groupId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupData, setGroupData] = useState(null);

  // Crear referencia para el contenedor de mensajes
  const messagesEndRef = useRef(null);

  // Convertir groupId a número limpiando espacios
  const numericGroupId = groupId ? parseInt(String(groupId).trim(), 10) : null;

  const fetchRol = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, {
        withCredentials: true, // Enviar cookies con la solicitud
      });
      setCurrentUser(response.data.inversor?.usuario || response.data.startup?.usuario);
    }
    catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchRol();
  }, []);

  useEffect(() => {
    if (!numericGroupId) return;
    const fetchGroupData = async () => {
      try {
        const response = await customAxios.get(`http://localhost:5000/api/grupos/data/${numericGroupId}`);
        setGroupData(response.data);
      } catch (error) {
        console.error("Error obteniendo datos del grupo:", error);
      }
    };
    fetchGroupData();
  }, [numericGroupId]);

  useEffect(() => {
    if (!numericGroupId) return;
    const fetchMessages = async () => {
      try {
        const response = await customAxios.get(`http://localhost:5000/api/grupos/ver/${numericGroupId}/mensajes`);
        setMessages(response.data.mensajes); // O ajusta según lo que retorne la API
      } catch (error) {
        console.error("Error obteniendo mensajes:", error);
      }
    };
    fetchMessages();
  }, [numericGroupId]);

  useEffect(() => {
    if (!numericGroupId) return;
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });
    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", numericGroupId);
      console.log(`Socket ${newSocket.id} unido a la sala ${numericGroupId}`);
    });
    newSocket.on("newMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    newSocket.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [numericGroupId]);

  const handleSendMessage = useCallback(async (messageContent) => {
    if (!socket || !numericGroupId) return;
    try {
      const messageData = {
        contenido: messageContent,
        id_emisor: currentUser.id,
        id_grupo: numericGroupId,
      };
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, emisor: { id: currentUser.id, username: currentUser.username } },
      ]);
      await customAxios.post(`http://localhost:5000/api/grupos/enviar/${numericGroupId}/mensajes`, messageData);
      socket.emit("sendMessage", { ...messageData, username: currentUser.username });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  }, [socket, numericGroupId, currentUser]);

  // Desplazar al último mensaje solo cuando el chat se abre
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [numericGroupId]); // Ejecutar solo cuando se cambia el grupo (es decir, al abrir un grupo diferente)

  return (
    <div className="chat-container">
      { !numericGroupId ? (
        <div className="contenido-vacio" id="vacio">
          <p>Selecciona un grupo para empezar a chatear.</p>
        </div>
      ) : (
        <>
          <div className="divisor">
            <div className="avatar1" aria-label="Avatar del grupo" />
            <p className="nombre-grupo">{groupData ? groupData.nombre : "Cargando..."}</p>
            <div className="contenedor-iconos">
              <button type="button" aria-label="Fijar grupo">
                <IconPin className="iconos" />
              </button>
              <button type="button" aria-label="Más opciones">
                <IconDots className="iconos" />
              </button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                <strong>{msg.emisor.username}: </strong>
                <span>{msg.contenido}</span>
              </div>
            ))}
            {/* Referencia para el último mensaje */}
            <div ref={messagesEndRef} />
          </div>
          <Input onSendMessage={handleSendMessage} />
        </>
      )}
    </div>
  );
};

export default ChatGroup;
