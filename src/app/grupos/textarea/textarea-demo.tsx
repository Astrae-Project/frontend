'use client';

import React, { useRef, useEffect, useState } from "react";
import { IconPaperclip, IconAt, IconStar } from "@tabler/icons-react";
import "./textarea-style.css";
import customAxios from "@/service/api.mjs";

const MIN_HEIGHT = 152;

const Input = ({ onSendMessage, groupId }) => {
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [showMentionList, setShowMentionList] = useState(false);
  const [starMessage, setStarMessage] = useState("");
  const [members, setMembers] = useState([]);

  const numericGroupId = groupId ? parseInt(String(groupId).trim(), 10) : null;
  if (isNaN(numericGroupId)) {
    console.error("El ID del grupo no es un número válido.");
  }
  
  const fetchGroupData = async () => {
    if (!numericGroupId) return;
    try {
      const response = await customAxios.get(
        `/grupos/data/${numericGroupId}`
      );
      setMembers(response.data.miembros || []);
    } catch (error) {
      console.error("Error obteniendo datos del grupo:", error);
    }
  };
  
  useEffect(() => {
    fetchGroupData();
  }, [numericGroupId]);

  const autoResize = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = `${MIN_HEIGHT}px`;
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  // Función para enviar mensaje
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !attachedFile) {
      return; // No enviar si no hay mensaje ni archivo adjunto
    }
    
    // Llama a la función del componente padre con el contenido del mensaje.
    onSendMessage(trimmedMessage);

    // Reinicia estados
    setMessage("");
    setAttachedFile(null);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
  };

  // Manejar envío con Enter (sin shift)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Limpiar el mensaje
  const handleClear = () => {
    setMessage("");
    setAttachedFile(null);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
  };

  // --- Funcionalidad Menciones (@) ---
  const handleMentionClick = () => {
    setShowMentionList((prev) => !prev);
  };

  const selectMention = (username) => {
    setMessage((prev) => prev + `@${username} `);
    setShowMentionList(false);
    textAreaRef.current.focus();
  };

  // --- Funcionalidad Adjuntar Archivo (clip) ---
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  // --- Funcionalidad Estrella (Placeholder) ---
  const handleStarClick = () => {
    setStarMessage("Función de favorito en desarrollo.");
    setTimeout(() => setStarMessage(""), 3000);
  };

  return (
    <div className="chat-input">
      <textarea
        ref={textAreaRef}
        rows={1}
        placeholder="Envía tu mensaje..."
        className="mensajes"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
      ></textarea>

      {/* Mostrar vista previa del archivo adjunto */}
      {attachedFile && (
        <div className="attached-file">
          <p>Archivo adjunto: {attachedFile.name}</p>
        </div>
      )}

      {/* Mostrar mensaje del icono estrella si procede */}
      {starMessage && (
        <div className="star-message">
          <p>{starMessage}</p>
        </div>
      )}

      {/* Lista de menciones */}
      {showMentionList && (
        <div className="mention-list">
          {members.map((candidate) => (
            <div
              key={candidate.id}
              className="mention-item"
              onClick={() => selectMention(candidate.username)}
            >
              {candidate.username}
            </div>
          ))}
        </div>
      )}

      <div className="contenedor-social" style={{ display: "none" }}>
        <button className="btn-social" type="button" onClick={handleMentionClick}>
          <IconAt className="icon2" />
        </button>
        <button className="btn-social" type="button" onClick={handleFileClick}>
          <IconPaperclip className="icon2" />
        </button>
        <button className="btn-social" type="button" onClick={handleStarClick}>
          <IconStar className="icon2" />
        </button>
      </div>
  
      <div className="contenedor-enviar">
        <button className="btn-enviar" id="borrar" onClick={handleClear}>
          Borrar
        </button>
        <button className="btn-enviar" id="enviar" onClick={handleSend}>
          Enviar
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Input;
