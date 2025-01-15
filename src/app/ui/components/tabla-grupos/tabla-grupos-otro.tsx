import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { IconLockFilled } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

const TablaGruposOtro = ({ username }) => {
  const [grupos, setGrupos] = useState([]);
  const [error, setError] = useState(null);

  const fetchGrupos = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
        withCredentials: true,
      });

      const grupos = response.data?.grupos || []; // Extraer grupos, si existen
      setGrupos(grupos);
      setError(null); // Limpiar errores si la solicitud fue exitosa
    } catch (error) {
      console.error("Error al obtener grupos:", error);
      setError("Ocurrió un error al obtener los grupos. Por favor, intenta nuevamente.");
    }
  };

  useEffect(() => {
    if (username) {
      fetchGrupos();
    }
  }, [username]);

  return (
    <div className="seccion" id="grupos-perfil">
      <div className="titulo-principal">
        <p className="titulo-contacto">Grupos</p>
      </div>
      {error && <p className="error">{error}</p>}
      {grupos.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="grupos-lista">
            {grupos.map((grupo) => (
              <li key={grupo.id} className="grupo-item">
                <div className="grupo-icono">
                  <img
                    src={grupo.grupo?.foto_grupo}
                    alt={`Avatar del grupo ${grupo.grupo?.nombre}`}
                    className="grupo-avatar"
                  />
                </div>
                <div className="grupo-info">
                  <p id="nombre-grupo">{grupo.grupo?.nombre || "Grupo sin nombre"}</p>
                  {grupo.grupo?.tipo === "privado" && (
                    <IconLockFilled className="icono-candado" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No estás en ningún grupo.</p>
      )}
    </div>
  );
};

export default TablaGruposOtro;
