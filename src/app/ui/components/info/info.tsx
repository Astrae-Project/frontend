'use client';

import React, { useState, useEffect } from "react";
import { IconBriefcaseFilled, IconBulbFilled, IconMapPinFilled, IconMedal, IconPercentage, IconStarFilled } from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Chips } from "@/app/perfil/chip/chip-demo";
import { MiniChips } from "@/app/perfil/mini-chips/mini-chips";
import { Botones } from "@/app/perfil/boton/boton-demo";
import StarRating from "@/app/perfil/estrellas/estrellas";
import { id } from "date-fns/locale";

const InversorInfo = () => {
  const [inversor, setInversor] = useState(null);
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);

  const fetchDatosInversor = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      setInversor(data.inversor);
      setInversionesRealizadas(data.inversionesRealizadas);
      setSectorFavorito(data.inversor.sector_favorito);
      setRoiPromedio(data.roiPromedio);
      setPuntuacionMedia(data.puntuacionMedia);

      const exitosas = data.inversor.inversiones.filter(inv => inv.esExitosa).length;
      setInversionesExitosas(exitosas);

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
          <img
            src={inversor?.usuario.avatar}
            alt={`${inversor?.nombre} avatar`}
            className="avatar-imagen"
          />
      </span>
      <p id="nombre">{inversor?.nombre || "Nombre del inversor"}</p>
      <p id="creacion">
        Invirtiendo en Astrae desde{" "}
        <span className="morado">{inversor?.usuario.fecha_creacion ? new Date(inversor.usuario.fecha_creacion).getFullYear() : "Fecha"}</span>
      </p>
      <button className="rankear"><IconStarFilled id="estrella" /></button>
      <span className="contenedor-ancho">
        <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{inversor?.usuario?.ciudad && inversor?.usuario?.pais? `${inversor.usuario.ciudad}, ${inversor.usuario.pais}`: "Sin ubicación"}</div>} />
        <MiniChips label={<div className="icon-text"><IconBriefcaseFilled className="icono2"/> {inversor?.perfil_inversion || "Desconocido"}</div>} />
        <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {sectorFavorito}</div>} />
        <MiniChips label={<StarRating  puntuacionMedia={puntuacionMedia} />} />
        <MiniChips label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2"/> Inversiones Exitosas: {inversionesExitosas}</div>} />
        <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> ROI Promedio: {roiPromedio}%</div>} />
      </span>
      <Botones />
    </div>
  );
};

export default InversorInfo;
