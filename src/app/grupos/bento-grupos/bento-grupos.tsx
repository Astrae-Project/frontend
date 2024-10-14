import React from "react";
import { IconDots, IconPin } from "@tabler/icons-react";
import "./bento-grupos-style.css"
import { Input } from "../textarea/textarea-demo";

export function BentoGridGrupos() {
  return (
    <div className="contenedor2">
      <div className="bento2">
        <div className="apartado2">
        </div>
        <div className="apartado2">
          <div className="divisor">
            <div className="avatar1"></div>
            <p className="nombre-grupo">Nombre Grupo</p>
            <div className="contenedor-iconos">
              <button><IconPin className="iconos"></IconPin></button>
              <button><IconDots className="iconos"></IconDots></button>
            </div>
          </div>
          <Input />
        </div>
        <div className="apartado2">
        </div>
      </div>
    </div>
  );
}
