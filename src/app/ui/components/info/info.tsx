'use client';

import React, { useState, useEffect } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Chips } from "@/app/perfil/chip/chip-demo";
import { MiniChips } from "@/app/perfil/mini-chips/mini-chips";
import { Botones } from "@/app/perfil/boton/boton-demo";


const InversorInfo = () => {
  const [inversor, setInversor] = useState(null);
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);

  const fetchDatosInversor = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setInversor(data.inversor);
      setInversionesRealizadas(data.inversionesRealizadas);
    } catch (error) {
      console.error("Error fetching inversor data:", error);
    }
  };

  useEffect(() => {
    fetchDatosInversor();
  }, []);

  return (
    <div className="seccion">
      <Chips />
      <span className="avatar">
        {inversor?.usuario?.avatar && (
          <img
            src={inversor.usuario.avatar}
            alt={`${inversor.nombre} avatar`}
            className="avatar-imagen"
          />
        )}
      </span>
      <p id="nombre">{inversor?.nombre || "Nombre del inversor"}</p>
      <p id="creacion">
        Invirtiendo en Astrae desde{" "}
        <span className="morado">{inversor?.usuario.fecha_creacion ? new Date(inversor.usuario.fecha_creacion).getFullYear() : "Fecha"}</span>
      </p>
      <button className="rankear"><IconStarFilled id="estrella"></IconStarFilled></button>
      <span className="contenedor-ancho">
        <MiniChips label={`${inversor?.ubicacion || "Desconocida"}`} />
        <MiniChips label={`${inversor?.perfil_inversion || "Desconocido"}`} />
        <MiniChips label={`${inversor?.sector_favorito || "Desconocido"}`} />
        <MiniChips label={`${inversor?.reseñas || 0}`} />
        <MiniChips label={`Inversiones Existosas: ${inversor?.inversionesExitosas || 0}`} />
        <MiniChips label={`Retorno Promedio: ${inversor?.retornoPromedio || 0}%`} />
      </span>
      <Botones />
    </div>

  );
};

export default InversorInfo;
