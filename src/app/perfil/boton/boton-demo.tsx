"use client"

import './boton-style.css'

export function Botones() {

  return (
    <span className="contenedor-botones">
      <button className="custom-button" id="seguir">
        <p className="text">Seguir</p>
      </button>    
      <button className="custom-button" id="suscribir">
        <p className="text">Suscribir</p>
      </button>
    </span>
  );
}