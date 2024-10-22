import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const TablaGrupos = () => {
  const [grupos, setGrupos] = useState([]);

  const fetchGrupos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/grupos", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error("Error fetching grupos:", error);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  return (
    <div className="seccion">
    {grupos.length > 0 ? (
      <ul>
        {grupos.map((grupo, index) => (
          <li key={index}>{grupo.grupo.nombre}</li>
        ))}
      </ul>
    ) : (
      <p>No estás en ningún grupo.</p>
    )}
  </div>
  );
};

export default TablaGrupos;
