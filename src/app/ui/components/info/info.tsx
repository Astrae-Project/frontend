'use client';

import React, { useState, useEffect } from "react";
import { IconBriefcaseFilled, IconBulbFilled, IconChartPieFilled, IconCurrencyEuro, IconMapPinFilled, IconMedal, IconPercentage, IconStarFilled, IconUserFilled} from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Chips } from "@/app/perfil/chip/chip-demo";
import { MiniChips } from "@/app/perfil/mini-chips/mini-chips";
import { Botones } from "@/app/perfil/boton/boton-demo";
import StarRating from "@/app/perfil/estrellas/estrellas";

const Info = () => {
  const [usuario, setUsuario] = useState(null);
  const [perfilTipo, setPerfilTipo] = useState(""); // Nuevo estado para almacenar el tipo de perfil
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0)
  
  const fetchDatos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/usuario", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      setUsuario(data.inversor || data.startup); // Establecer el usuario con la respuesta
      setPerfilTipo(data.inversor ? "inversor" : "startup"); // Determinar el tipo de perfil
      setSectorFavorito(data.sectorFavorito);
      setInversionesRealizadas(data.inversor ? data.inversionesRealizadas : data.startup.inversiones.length);
      setRoiPromedio(data.roiPromedio);
      setPuntuacionMedia(data.puntuacionMedia);
      setRecaudacionTotal(data.recaudacionTotal)

      if (data.inversor) {
        const exitosas = data.inversor.inversiones.filter(inv => inv.esExitosa).length;
        setInversionesExitosas(exitosas);
      } else if (data.startup) {
        // Si es una startup, puedes contar los inversores o hacer algún cálculo relacionado
        setInversionesExitosas(data.startup.inversiones.filter(inv => inv.monto_invertido > 0).length); // Ejemplo de cómo contar las inversiones exitosas
      }
    } catch (error) {
      console.error("Error fetching usuario data:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="seccion">
      <Chips />
      <span className="avatar">
        <img
          src={usuario?.usuario?.avatar || "/default-avatar.png"} // Asegurarse de que haya una imagen por defecto
          alt={`${usuario?.nombre} avatar`}
          className="avatar-imagen"
        />
      </span>
      <p id="nombre">{perfilTipo === "inversor" ? usuario?.nombre : usuario?.usuario?.username || "Nombre del usuario"}</p>
      <p id="creacion">
        {perfilTipo === "inversor" ? "Invirtiendo en Astrae desde" : "En Astrae desde"}{" "}
        <span className="morado">{usuario?.usuario?.fecha_creacion ? new Date(usuario.usuario.fecha_creacion).getFullYear() : "Fecha"}</span>
      </p>

      {/* Renderizado condicional para perfil inversor */}
      {perfilTipo === "inversor" ? (
        <>
          <button className="rankear"><IconStarFilled id="estrella" /></button>
          <span className="contenedor-ancho">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} />
            <MiniChips label={<div className="icon-text"><IconBriefcaseFilled className="icono2"/> {usuario?.perfil_inversion || "Desconocido"}</div>} />
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {sectorFavorito}</div>}/>
            <MiniChips label={<StarRating puntuacionMedia={puntuacionMedia} />} />
            <MiniChips label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2"/> Inversiones Exitosas: {inversionesExitosas}</div>} />
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> ROI Promedio: {roiPromedio}%</div>} />
          </span>
        </>
      ) : (
        <>
          <span className="contenedor-ancho1">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} />
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {usuario?.sector || "Desconocido"}</div>} />
            <MiniChips label={<div className="icon-text"><IconChartPieFilled className="icono2"/> {usuario?.estado_financiacion || "Desconocido"}</div>} />
            <MiniChips label={<div className="icon-text"><IconUserFilled  className="icono2"/> {usuario?.plantilla || "Desconocida"}</div>} />
            <MiniChips label={<div className="icon-text"><IconCurrencyEuro id="icono-pequeño" className="icono2"/> Recaudación Total: {recaudacionTotal ?? "0"} €</div>} />
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> Porcentaje Disponible: {usuario?.porcentaje_disponible || "0"}%</div>} />
          </span>
        </>
      )}

      <Botones />
    </div>
  );
};

export default Info;
