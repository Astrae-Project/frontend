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
} from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Botones } from "../../../perfil/boton/boton-demo";
import { Chips } from "../../../perfil/chip/chip-demo";
import StarRating from "../../../perfil/estrellas/estrellas";
import { MiniChips } from "../../../perfil/mini-chips/mini-chips";

// Asumiendo que customAxios está configurado adecuadamente en otro archivo
import customAxios from "@/service/api.mjs";

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
      <Chips />
      <span className="avatar">
        <img
          src={usuario?.usuario?.avatar || "/default-avatar.png"}
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
          {usuario?.usuario?.fecha_creacion
            ? new Date(usuario.usuario.fecha_creacion).getFullYear()
            : "Fecha"}
        </span>
      </p>

      {perfilTipo === "inversor" ? (
        <>
          <button className="rankear">
            <IconStarFilled id="estrella" />
          </button>
          <span className="contenedor-ancho">
            <MiniChips
              label={
                <div className="icon-text">
                  <IconMapPinFilled className="icono2" />
                  {usuario?.usuario?.ciudad && usuario?.usuario?.pais
                    ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}`
                    : "Sin ubicación"}
                </div>
              }
            />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconBriefcaseFilled className="icono2" />
                  {usuario?.perfil_inversion || "Desconocido"}
                </div>
              }
            />
            <MiniChips label={<StarRating puntuacionMedia={puntuacionMedia} />} />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconMedal id="icono-pequeño" className="icono2" />
                  Inversiones Exitosas: {inversionesExitosas}
                </div>
              }
            />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconPercentage id="icono-pequeño2" className="icono2" />
                  ROI Promedio: {roiPromedio}%
                </div>
              }
            />
          </span>
        </>
      ) : (
        <>
          <span className="contenedor-ancho1">
            <MiniChips
              label={
                <div className="icon-text">
                  <IconMapPinFilled className="icono2" />
                  {usuario?.usuario?.ciudad && usuario?.usuario?.pais
                    ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}`
                    : "Sin ubicación"}
                </div>
              }
            />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconBulbFilled className="icono2" />
                  {usuario?.sector || "Desconocido"}
                </div>
              }
            />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconChartPieFilled className="icono2" />
                  {usuario?.estado_financiacion || "Desconocido"}
                </div>
              }
            />
            <MiniChips
              label={
                <div className="icon-text">
                  <IconCurrencyEuro id="icono-pequeño" className="icono2" />
                  Recaudación Total: {recaudacionTotal ?? "0"} €
                </div>
              }
            />
          </span>
        </>
      )}
      <Botones />
    </div>
  );
};

export default InfoOtro;
