'use client'

import { useRef, useEffect } from "react";
import { IconPaperclip, IconAt, IconStar } from "@tabler/icons-react"
import "./textarea-style.css";

export function Input() {
  const textArea = useRef(null);

  const autoResize = () => {
    // Restablecer la altura mínima
    textArea.current.style.height = "118px"; // Altura mínima
    // Ajustar la altura al contenido
    textArea.current.style.height = `${textArea.current.scrollHeight}px`;
  };

  useEffect(() => {
    autoResize(); // Asegura que el tamaño se ajuste al cargar
  }, []);

  return (
    <div className="contenedor-mensajes">
      <textarea
        ref={textArea}
        rows={1}
        placeholder="Envía tu mensaje..."
        className="mensajes"
        onInput={autoResize}>
       </textarea>
       <div className="contenedor-social">
          <button className="btn-social"><IconAt className="icon2" size={16}></IconAt></button>
          <button className="btn-social"><IconPaperclip className="icon2" size={16}></IconPaperclip></button>
          <button className="btn-social"><IconStar className="icon2" size={16}></IconStar></button>
       </div>
       <div className="contenedor-enviar">
          <button className="btn-enviar" id="borrar">Borrar</button>
          <button className="btn-enviar" id="enviar">Enviar</button>
       </div>
    </div>
  );
}
