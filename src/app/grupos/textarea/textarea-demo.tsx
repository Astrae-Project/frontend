'use client'

import { useRef, useEffect, useState } from "react";
import { IconPaperclip, IconAt, IconStar } from "@tabler/icons-react";
import "./textarea-style.css";

const Input = ({ onSendMessage }) => {
  const textArea = useRef(null);
  const [message, setMessage] = useState("");

  const autoResize = () => {
    if (textArea.current) {
      // Restablecer la altura mínima
      textArea.current.style.height = "118px";
      // Ajustar la altura al contenido
      textArea.current.style.height = `${textArea.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize(); // Asegura que el tamaño se ajuste al cargar
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return; // No enviar mensajes vacíos
    if (onSendMessage) {
      onSendMessage(message.trim());
    }
    setMessage("");
    if (textArea.current) {
      textArea.current.style.height = "118px"; // Reinicia la altura
    }
  };

  const handleClear = () => {
    setMessage("");
    if (textArea.current) {
      textArea.current.style.height = "118px";
    }
  };

  return (
    <div className="contenedor-mensajes">
      <textarea
        ref={textArea}
        rows={1}
        placeholder="Envía tu mensaje..."
        className="mensajes"
        value={message}
        onInput={(e) => {
          setMessage(e.target.value);
          autoResize();
        }}
      ></textarea>
      <div className="contenedor-social">
        <button className="btn-social">
          <IconAt className="icon2" size={16} />
        </button>
        <button className="btn-social">
          <IconPaperclip className="icon2" size={16} />
        </button>
        <button className="btn-social">
          <IconStar className="icon2" size={16} />
        </button>
      </div>
      <div className="contenedor-enviar">
        <button className="btn-enviar" id="borrar" onClick={handleClear}>Borrar</button>
        <button className="btn-enviar" id="enviar" onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};

export default Input;
