'use client';

import React, { useRef, useEffect, useState } from "react";
import { IconPaperclip, IconAt, IconStar } from "@tabler/icons-react";
import "./textarea-style.css";

const MIN_HEIGHT = 152;

const Input = ({ onSendMessage }) => {
  const textAreaRef = useRef(null);
  const [message, setMessage] = useState("");

  // Ajusta la altura del textarea dinámicamente
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

  // Enviar mensaje cuando se presiona el botón
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Evita mensajes vacíos

    onSendMessage?.(trimmedMessage); // Llama a la función de envío
    setMessage(""); // Limpia el textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`; // Restaura la altura mínima
    }
  };

  // Enviar mensaje con "Enter" + evitar salto de línea innecesario
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Evita el salto de línea
      handleSend();
    }
  };

  // Limpiar el mensaje
  const handleClear = () => {
    setMessage("");
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
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
        onKeyDown={handleKeyDown} // Permite enviar con Enter
      ></textarea>
      <div className="contenedor-social">
        <button className="btn-social" type="button">
          <IconAt className="icon2" size={16} />
        </button>
        <button className="btn-social" type="button">
          <IconPaperclip className="icon2" size={16} />
        </button>
        <button className="btn-social" type="button">
          <IconStar className="icon2" size={16} />
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
    </div>
  );
};

export default Input;
