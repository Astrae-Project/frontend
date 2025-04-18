'use client';

import React, { useState, useEffect } from "react";
import { IconBriefcaseFilled, IconBulbFilled, IconChartPieFilled, IconCurrencyEuro, IconMapPinFilled, IconMedal, IconPercentage, IconStarFilled, IconUserFilled} from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Botones } from "../../../perfil/boton/boton-demo";
import { Chips } from "../../../perfil/chip/chip-demo";
import StarRating from "../../../perfil/estrellas/estrellas";
import { MiniChips } from "../../../perfil/mini-chips/mini-chips";

// Asumiendo que customAxios está configurado adecuadamente en otro archivo
import customAxios from "@/service/api.mjs"; 

const Info = () => {
  const [usuario, setUsuario] = useState(null);
  const [perfilTipo, setPerfilTipo] = useState(""); // Nuevo estado para almacenar el tipo de perfil
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);

  const fetchDatos = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, {
        withCredentials: true, // Asegúrate de que la configuración se mantenga
      });
      
      // Verifica la respuesta
      if (!response || !response.data) {
        throw new Error("No data received from the API");
      }

      const data = response.data;

      setUsuario(data.inversor || data.startup); // Establecer el usuario con la respuesta
      setPerfilTipo(data.inversor ? "inversor" : "startup"); // Determinar el tipo de perfil
      setSectorFavorito(data.sectorFavorito || "Desconocido");
      setInversionesRealizadas(data.inversor ? data.inversionesRealizadas : data.startup.inversiones.length);
      setRoiPromedio(data.roiPromedio || 0);
      setPuntuacionMedia(data.puntuacionMedia || 0);
      setRecaudacionTotal(data.recaudacionTotal || 0);

      if (data.inversor) {
        const exitosas = data.inversor.inversiones.filter(inv => inv.esExitosa).length;
        setInversionesExitosas(exitosas);
      } else if (data.startup) {
        setInversionesExitosas(data.startup.inversiones.filter(inv => inv.monto_invertido > 0).length);
      }
    } catch (error) {
      console.error("Error fetching usuario data:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []); // Solo se ejecuta una vez al montar el componente

  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A';
    }
  
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M€`; // Para millones
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K€`; // Para miles
    } else {
      return `${monto}€`; // Para cantidades menores a mil
    }
  };


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
          <span className="contenedor-ancho">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} tooltipText="Ubicación" />
            <MiniChips label={<div className="icon-text"><IconBriefcaseFilled className="icono2"/> {usuario?.perfil_inversion || "Desconocido"} </div>} tooltipText="Perfil de inversión" />
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {sectorFavorito}</div>} tooltipText="Sector favorito"/>
            <MiniChips label={<StarRating puntuacionMedia={puntuacionMedia} />} tooltipText={`${puntuacionMedia}`} />
            <MiniChips label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2"/> Inversiones Exitosas: {inversionesExitosas}</div>} tooltipText={null}/>
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> ROI Promedio: {roiPromedio}%</div>} tooltipText={null}/>
          </span>
        </>
      ) : (
        <>
          <span className="contenedor-ancho1">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} tooltipText="Ubicación"/>
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {usuario?.sector || "Desconocido"}</div>} tooltipText="Sector"/>
            <MiniChips label={<div className="icon-text"><IconChartPieFilled className="icono2"/> {usuario?.estado_financiacion || "Desconocido"}</div>} tooltipText="Ronda de Financiación"/>
            <MiniChips label={<div className="icon-text"><IconUserFilled  className="icono2"/> {usuario?.plantilla || "Desconocida"}</div>} tooltipText="Plantilla"/>
            <MiniChips label={<div className="icon-text"><IconCurrencyEuro id="icono-pequeño" className="icono2"/> Recaudación Total: {formatInversion(recaudacionTotal ?? "0")} </div>} tooltipText={null}/>
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> Porcentaje Disponible: {usuario?.porcentaje_disponible || "0"}%</div>} tooltipText={null}/>
          </span>
        </>
      )}

      <Botones />
    </div>
  );
};

export default Info; 
