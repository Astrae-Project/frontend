"use client"

import { Chip } from "@heroui/react";
import './chip-style.css';
import { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";

export function ChipsOtro({username}) {
  const [usuario, setUsuario] = useState(null);

  const fetchUsuario = async () => {
    try {
      const response = await customAxios.get(`/data/usuario/${username}`, {
        withCredentials: true, // Cambiado a 'true' (booleano)
      });
      setUsuario(response.data); // Asumiendo que los datos contienen información sobre si es inversor o startup
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, [username]);

  // Determinar el color del dot dependiendo del rol
  const getDotClass = () => {
    if (!usuario) return 'status-dot-gray'; // Mientras carga, el dot será gris
    return usuario.startup ? 'status-dot-purple' : 'status-dot-green'; // Verde para startup, azul para inversor
  };

  return (
    <Chip startContent={<span className={`status-dot ${getDotClass()}`}></span>} className="custom-chip">
      <p className="chip">
        {usuario ? (usuario.startup ? "Startup" : "Inversor") : "Cargando..."}
      </p>
    </Chip>
  );
}
