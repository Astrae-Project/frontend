"use client"

import {Button} from "@nextui-org/react";
import './boton-style.css'

export function Botones() {
  return (
    <span className="contenedor-botones">
      <Button className="custom-button" id="seguir">
        <p className="text">Seguir</p>
      </Button>    
      <Button className="custom-button" id="suscribir">
        <p className="text">Suscribir</p>
      </Button>
    </span>
  );
}