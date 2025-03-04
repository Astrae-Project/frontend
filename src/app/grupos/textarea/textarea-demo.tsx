'use client';

import React, { useRef, useEffect, useState } from "react";
import { IconPaperclip, IconAt, IconStar } from "@tabler/icons-react";
import "./textarea-style.css";

const MIN_HEIGHT = 118;

const Input = ({ onSendMessage }) => {
  const textAreaRef = useRef(null);
  const [message, setMessage] = useState("");

  const autoResize = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      // Reinicia la altura al mínimo y luego la ajusta al contenido
      textarea.style.height = `${MIN_HEIGHT}px`;
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, []);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // No enviar mensajes vacíos
    onSendMessage?.(trimmedMessage);
    setMessage("");
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
  };

  const handleClear = () => {
    setMessage("");
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
  };

  return (
    <div className="contenedor-mensajes">
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
