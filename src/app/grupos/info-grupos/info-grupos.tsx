'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import "./info-grupos-style.css";

const InfoGrupos = ({ groupId }) => {
  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(false);

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
          <h1>{grupo.nombre}</h1>
          <p>{grupo.descripcion}</p>
        </div>
      )}
    </>
  );
};

export default InfoGrupos;
