import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Input from "../textarea/textarea-demo"; // Asegúrate de que la ruta sea correcta
import "./chat-style.css"; // Opcional: estilos específicos para el chat

const SOCKET_SERVER_URL = "http://localhost:5000"; // Ajusta según tu servidor

const ChatGroup = ({ groupId, user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Crear conexión al servidor de websockets
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", groupId);
      console.log(`Socket ${newSocket.id} se ha unido a la sala ${groupId}`);
    });

    // Escuchar nuevos mensajes emitidos por el servidor
    newSocket.on("newMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Desconectar al desmontar el componente
    return () => {
      newSocket.disconnect();
    };
  }, [groupId]);

  // Función para enviar mensaje, se la pasamos al componente Input
  const handleSendMessage = (messageContent) => {
    if (socket) {
      const messageData = {
        roomId: groupId,
        contenido: messageContent,
        id_usuario: user.id,
        username: user.username,
        // Puedes agregar otros campos como fecha, etc.
      };
      socket.emit("sendMessage", messageData);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.username}: </strong>
            <span>{msg.contenido}</span>
          </div>
        ))}
      </div>
      {/* Se utiliza el componente Input y se le pasa la función para enviar mensajes */}
      <Input onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatGroup;
