'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import "./info-grupos-style.css";
import { IconArrowsDiagonal, IconArrowsDiagonal2, IconArrowsDiagonalMinimize2, IconDotsVertical } from "@tabler/icons-react";

const InfoGrupos = ({ groupId }) => {
  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false); // Estado para controlar la vista expandida

  useEffect(() => {
    // Si no hay grupo seleccionado, reseteamos y salimos
    if (!groupId) {
      setGrupo(null);
      return;
    }
    setLoading(true);
    const fetchGrupo = async () => {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/grupos/data/${groupId}`,
          { withCredentials: true }
        );
        setGrupo(response.data);
      } catch (error) {
        console.error("Error al obtener la información del grupo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrupo();
  }, [groupId]);

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const opcionesMes = { month: 'long' };
    const nombreMes = new Intl.DateTimeFormat('es-ES', opcionesMes).format(date);
    return `${date.getDate()} de ${nombreMes} de ${date.getFullYear()}`;
  };

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <>
      {!groupId ? (
        <div className="contenido-vacio" id="info-vacio">
          <p>Selecciona un grupo para ver la información.</p>
        </div>
      ) : loading ? (
        <p>Cargando información del grupo...</p>
      ) : !grupo ? (
        <p>No se encontró información del grupo.</p>
      ) : (
        <div className="info-grupo">
          <p>{grupo.descripcion}</p>
          <p>Fecha de creación: {formatFecha(grupo.fecha_creacion)}</p>
          <p>Tipo: {grupo.tipo}</p>
          <div className="miembros">
            <p className="titulo-miembros">
              Miembros <span className="contador-miembros">({grupo.miembros.length})</span>
            </p>
            <div className={`miembros-container ${expanded ? 'expanded' : ''}`}>
              {!expanded ? (
                <div className="miembros-resumen">
                  <button onClick={() => setExpanded(true)} className="collapse-button">
                    <IconArrowsDiagonal/>
                  </button>
                  {grupo.miembros.map((miembro) => (
                    <div key={miembro.id} className="avatar1">
                      {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                // Vista expandida: se muestran avatar, username, rol y botón de acciones
                <div className="miembros-expandido">
                  <button onClick={() => setExpanded(false)} className="collapse-button">
                    <IconArrowsDiagonalMinimize2/>
                  </button>
                  <ul>
                    {grupo.miembros.map((miembro) => (
                      <li key={miembro.id} className="miembro">
                        <div className="avatar1">
                          {miembro.avatar ? miembro.avatar : miembro.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="info-miembro">
                          <p>{miembro.username}</p> <div className="rol-grupos"><p>{capitalizeFirstLetter(miembro.rol)}</p></div>
                        </div>
                        <button className="btn-acciones"><IconDotsVertical /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoGrupos;