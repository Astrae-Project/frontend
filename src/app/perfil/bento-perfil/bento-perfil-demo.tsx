import React from "react";
import "./bento-perfil-style.css";
import { Botones } from "../boton/boton-demo";
import { Chips } from "../chip/chip-demo";
import { MiniChips } from "../mini-chips/mini-chips";
 
export function BentoGridPerfil({ userData }) {
    const {
      name,
      createdAt,
      investor = {},
      startup = {},
      location = "No especificado",
      reviews = "Sin reseñas",
      successfulInvestments = 0,
      averageReturn = "N/A",
      favoriteSector = "No disponible",
    } = userData;
  
    const formattedDate = new Date(createdAt).getFullYear();
  
    return (
      <div className="contenedor4">
        <div className="grid">
          <div className="seccion">
            <Chips></Chips>
            <span className="avatar"></span>
                <p id="nombre">{userData.nombre}</p>
                <p id="creacion">Invirtiendo en Astrae desde <span className="morado">{new Date(userData.fecha_creacion).getFullYear()}</span></p>
                <span className="rankear"></span>
                <span className="contenedor-ancho">
            <MiniChips label={`Ubicación: ${userData.ubication || 'No disponible'}`}></MiniChips>
            <MiniChips label={`Tipo Inversor: ${userData.perfil_inversion}`}></MiniChips>
            <MiniChips label={`Sector favorito: ${userData.sector_favorito || 'No disponible'}`}></MiniChips>
            <MiniChips label={`Reseñas: ${userData.reseñas || 0}`}></MiniChips>
            <MiniChips label={`Inversiones Exitosas: ${userData.inversiones_exitosas || 0}`}></MiniChips>
            <MiniChips label={`Promedio Retorno: ${userData.promedio_retorno || 'No disponible'}`}></MiniChips>
          </span>
            <Botones></Botones>
          </div>
          <div className="seccion">
            <p>Portfolio</p>
          </div>
          <div className="seccion">
            <p>Inversiones Previas</p>
          </div>
          <div className="seccion" id="grid1">
            <section className="datos">
              <p>Seguidores</p>
            </section>
          </div>
          <div className="seccion" id="grid2">
            <section className="datos">
              <p>Suscriptores</p>
            </section>
          </div>
          <div className="seccion" id="grid3">
            <section className="datos">
              <p>Inversiones</p>
            </section>
          </div>
          <div className="seccion">
            <p>Eventos</p>
          </div>
          <div className="seccion">
            <p>Grupos</p>
          </div>
          <div className="seccion">
            <p>Contacto</p>
          </div>
        </div>
      </div>
    );
  };
  