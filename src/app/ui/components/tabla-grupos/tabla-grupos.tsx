import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { IconLockFilled } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

const TablaGrupos = () => {
  const [grupos, setGrupos] = useState([]);

  // Función para hacer fetch de los grupos
  const fetchGrupos = async () => {
    try {
      const response = await customAxios.get("http://localhost:5000/api/data/grupos", {
        withCredentials: true,
      });
  
      if (!response || !response.data) {
        throw new Error("No data received or response format is incorrect");
      }
  
      const data = response.data;
  
      // Verificar si el formato de los datos es el esperado
      if (!Array.isArray(data)) {
        throw new Error("Received data is not an array");
      }
  
      setGrupos(data); // Solo actualiza el estado si los datos son válidos
  
    } catch (error) {
      console.error("Error al obtener movimientos recientes:", error);
      }
  };

  // Llama a fetchGrupos cuando el componente se monta
  useEffect(() => {
    fetchGrupos();
  }, []);

  return (
    <div className="seccion" id="grupos-perfil">
      <div className="titulo-principal">
        <p className="titulo-contacto">Grupos</p>
      </div>
      {grupos.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="grupos-lista">
            {grupos.map((grupo, index) => (
            <li key={index} className="grupo-item">
              <div className="grupo-icono">
                <img src={grupo.grupo.foto_grupo} className="grupo-avatar"/>
              </div>
              <div className="grupo-info">
                <p id="nombre-grupo">{grupo.grupo.nombre}</p>
                {grupo.grupo.tipo === 'privado' && (
              <IconLockFilled className="icono-candado"></IconLockFilled>
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


export default TablaGrupos;
