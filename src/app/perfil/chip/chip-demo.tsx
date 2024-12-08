"use client"

import { Chip } from "@nextui-org/react";
import './chip-style.css';
import { useState, useEffect } from "react";

export function Chips() {
  const [usuario, setUsuario] = useState(null);

  const fetchUsuario = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/usuario", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setUsuario(data); // Asumiendo que los datos contienen información sobre si es inversor o startup
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  // Determinar el color del dot dependiendo del rol
  const getDotClass = () => {
    if (!usuario) return 'status-dot-gray'; // Mientras carga, el dot será gris
    return usuario.startup ? 'status-dot-purple' : 'status-dot-blue'; // Verde para startup, azul para inversor
  };

  return (
    <Chip startContent={<span className={`status-dot ${getDotClass()}`}></span>} className="custom-chip">
      <p className="chip">
        {usuario ? (usuario.startup ? "Startup" : "Inversor") : "Cargando..."}
      </p>
    </Chip>
  );
}
