'use client';

import React, { useState, useEffect } from "react";
import {
  IconBriefcaseFilled,
  IconBulbFilled,
  IconChartPieFilled,
  IconCurrencyEuro,
  IconMapPinFilled,
  IconMedal,
  IconPercentage,
  IconStarFilled,
  IconUserFilled,
  IconUsersGroup
} from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import customAxios from "@/service/api.mjs";
import { BotonesOtro } from "@/app/perfil-otro/boton/boton-otro";
import { ChipsOtro } from "@/app/perfil-otro/chip/chip-otro";
import StarRatingOtro from "../../../perfil/estrellas/estrellas";
import { MiniChipsOtro } from "@/app/perfil-otro/mini-chips/mini-chips";

interface InfoOtroProps {
  username: string; // Define el tipo para la prop `username`
}

const InfoOtro = ({ username }: InfoOtroProps) => {
  const [usuario, setUsuario] = useState(null);
  const [perfilTipo, setPerfilTipo] = useState(""); // Tipo de perfil: inversor o startup
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);

  const fetchDatos = async () => {
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/data/usuario/${username}`,
        { withCredentials: true }
      );

      if (!response || !response.data) {
        throw new Error("No data received from the API");
      }

      const data = response.data;

      setUsuario(data.inversor || data.startup);
      setPerfilTipo(data.inversor ? "inversor" : "startup");
      setSectorFavorito(data.sectorFavorito || "Desconocido");
      setInversionesRealizadas(
        data.inversor
          ? data.inversionesRealizadas
          : data.startup?.inversiones?.length || 0
      );
      setRoiPromedio(data.roiPromedio || 0);
      setPuntuacionMedia(data.puntuacionMedia || 0);
      setRecaudacionTotal(data.recaudacionTotal || 0);

      if (data.inversor) {
        const exitosas = data.inversor.inversiones.filter((inv) => inv.esExitosa).length;
        setInversionesExitosas(exitosas);
      } else if (data.startup) {
        setInversionesExitosas(
          data.startup.inversiones.filter((inv) => inv.monto_invertido > 0).length
        );
      }
    } catch (error) {
      console.error("Error fetching usuario data:", error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchDatos();
    }
  }, [username]);

  return (
    <div className="seccion">
      <ChipsOtro username={username} />
      <span className="avatar">
        <img
          src={usuario?.usuario?.avatar}
          alt={`${usuario?.nombre || "Usuario"} avatar`}
          className="avatar-imagen"
        />
      </span>
      <p id="nombre">
        {perfilTipo === "inversor" ? usuario?.nombre : usuario?.usuario?.username || "Nombre del usuario"}
      </p>
      <p id="creacion">
        {perfilTipo === "inversor" ? "Invirtiendo en Astrae desde" : "En Astrae desde"}{" "}
        <span className="morado">
          {usuario?.usuario?.fecha_creacion ? new Date(usuario.usuario.fecha_creacion).getFullYear() : "Fecha"}
        </span>
      </p>

      {perfilTipo === "inversor" ? (
        <>
          <button className="rankear">
            <IconStarFilled id="estrella" />
          </button>
          <span className="contenedor-ancho">
            <MiniChipsOtro label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconBriefcaseFilled className="icono2"/> {usuario?.perfil_inversion || "Desconocido"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconBulbFilled className="icono2"/> {sectorFavorito}</div>}/>
            <MiniChipsOtro label={<StarRatingOtro puntuacionMedia={puntuacionMedia} />} />
            <MiniChipsOtro label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2"/> Inversiones Exitosas: {inversionesExitosas}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> ROI Promedio: {roiPromedio}%</div>} />
          </span>
        </>
      ) : (
        <>
          <span className="contenedor-ancho1">
            <MiniChipsOtro label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconBulbFilled className="icono2"/> {usuario?.sector || "Desconocido"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconChartPieFilled className="icono2"/> {usuario?.estado_financiacion || "Desconocido"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconUserFilled  className="icono2"/> {usuario?.plantilla || "Desconocida"}</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconCurrencyEuro id="icono-pequeño" className="icono2"/> Recaudación Total: {recaudacionTotal ?? "0"} €</div>} />
            <MiniChipsOtro label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> Porcentaje Disponible: {usuario?.porcentaje_disponible || "0"}%</div>} />
          </span>
        </>
      )}
      <BotonesOtro username={username} />
    </div>
  );
};

export default InfoOtro;
