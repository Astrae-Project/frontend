'use client';

import React, { useState, useEffect } from "react";
import { Botones } from "../boton/boton-demo";
import { Chips } from "../chip/chip-demo";
import { MiniChips } from "../mini-chips/mini-chips";
import './bento-perfil-style.css';

export function BentoGridPerfil() {
  const [inversor, setInversor] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [inversionesPrevias, setInversionesPrevias] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [suscriptores, setSuscriptores] = useState(0);
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [eventos, setEventos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [contacto, setContacto] = useState(null);

  // Función para hacer fetch de todos los datos del inversor
  const fetchDatosInversor = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setInversor(data.inversor);
      setSeguidores(data.seguidores);
      setSuscriptores(data.suscriptores);
      setInversionesRealizadas(data.inversionesRealizadas);
    } catch (error) {
      console.error("Error fetching inversor data:", error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/portfolio", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPortfolio(data.inversiones);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const fetchMovimientosRecientes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/movimientos-recientes", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setInversionesPrevias(data);
    } catch (error) {
      console.error("Error fetching inversiones previas:", error);
    }
  };

  const fetchEventos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/eventos", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error("Error fetching eventos:", error);
    }
  };

  const fetchGrupos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/grupos", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error("Error fetching grupos:", error);
    }
  };

  const fetchContacto = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/contacto", {
        credentials: 'include', // Incluye cookies en la solicitud
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setContacto(data);
    } catch (error) {
      console.error("Error fetching contacto:", error);
    }
  };

  // useEffect para llamar a las funciones de fetch cuando se cargue el componente
  useEffect(() => {
    fetchDatosInversor();
    fetchPortfolio();
    fetchMovimientosRecientes();
    fetchEventos();
    fetchGrupos();
    fetchContacto();
  }, []);

  // Renderizar los datos del perfil del inversor
  return (
    <div className="contenedor4">
      <div className="grid">
        <div className="seccion">
          <Chips />
          <span className="avatar"></span>
          <p id="nombre">{inversor?.nombre || "Nombre del inversor"}</p>
          <p id="creacion">
            Invirtiendo en Astrae desde{" "}
            <span className="morado">{inversor?.usuario.fecha_creacion || "Fecha"}</span>
          </p>
          <span className="rankear"></span>
          <span className="contenedor-ancho">
            <MiniChips label={`Ubicación: ${inversor?.ubicacion || "Desconocida"}`} />
            <MiniChips label={`Tipo: ${inversor?.perfil_inversion || "Desconocido"}`} />
            <MiniChips label={`Sector: ${inversor?.sector_favorito || "Desconocido"}`} />
            <MiniChips label={`Reseñas: ${inversor?.reseñas || 0}`} />
            <MiniChips label={`Inversiones Exitosas: ${inversor?.inversionesExitosas || 0}`} />
            <MiniChips label={`Retorno Promedio: ${inversor?.retornoPromedio || 0}%`} />
          </span>
          <Botones />
        </div>

        <div className="seccion">
          <p>Portfolio</p>
          {portfolio.length > 0 ? (
            <ul>
              {portfolio.map((inversion, index) => (
                <li key={index}>
                  {inversion.startup.nombre}: {inversion.porcentaje_adquirido}% - ${inversion.valor_real}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay inversiones en el portfolio.</p>
          )}
        </div>

        <div className="seccion">
          <p>Inversiones Previas</p>
          {inversionesPrevias.length > 0 ? (
            <ul>
              {inversionesPrevias.map((inversion, index) => (
                <li key={index}>
                  {inversion.startup.nombre} - ${inversion.monto_invertido} - {inversion.fecha}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay inversiones previas.</p>
          )}
        </div>

        <div className="seccion" id="grid1">
          <section className="datos">
            <p>Seguidores: {seguidores}</p>
          </section>
        </div>

        <div className="seccion" id="grid2">
          <section className="datos">
            <p>Suscriptores: {suscriptores}</p>
          </section>
        </div>

        <div className="seccion" id="grid3">
          <section className="datos">
            <p>Inversiones Realizadas: {inversionesRealizadas}</p>
          </section>
        </div>

        <div className="seccion">
          <p>Eventos</p>
          {eventos.length > 0 ? (
            <ul>
              {eventos.map((evento, index) => (
                <li key={index}>
                  {evento.descripcion} - {evento.fecha_evento}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay eventos recientes.</p>
          )}
        </div>

        <div className="seccion">
          <p>Grupos</p>
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

        <div className="seccion">
          <p>Contacto</p>
          {contacto ? (
            <div>
              <p>Email: {contacto.email}</p>
              <p>Teléfono: {contacto.telefono}</p>
            </div>
          ) : (
            <p>No hay información de contacto.</p>
          )}
        </div>
      </div>
    </div>
  );
}
