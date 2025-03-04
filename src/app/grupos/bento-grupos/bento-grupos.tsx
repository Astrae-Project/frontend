// BentoGridGrupos.js
import React from "react";
import { IconDots, IconPin } from "@tabler/icons-react";
import "./bento-grupos-style.css";
import ChatGroup from "../chat/chat";

const BentoGridGrupos = ({ groupId, user }) => {
  return (
    <div className="contenedor2">
      <div className="bento2">
        <div className="apartado2">
          {/* Espacio para información adicional o herramientas */}
        </div>
        <div className="apartado2">
          <div className="divisor">
            <div className="avatar1" aria-label="Avatar del grupo" />
            <p className="nombre-grupo">Nombre Grupo</p>
            <div className="contenedor-iconos">
              <button type="button" aria-label="Fijar grupo">
                <IconPin className="iconos" />
              </button>
              <button type="button" aria-label="Más opciones">
                <IconDots className="iconos" />
              </button>
            </div>
          </div>
          {/* Aquí se muestra el componente de chat en tiempo real */}
          <ChatGroup groupId={groupId} user={user} />
        </div>
        <div className="apartado2">
          {/* Espacio para otras herramientas o estadísticas */}
        </div>
      </div>
    </div>
  );
};

export default BentoGridGrupos;
