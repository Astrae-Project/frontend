'use client'

import React from "react";
import "./bento-perfil-style.css";
import { Botones } from "../boton/boton-demo";
import { Chips } from "../chip/chip-demo";
import { MiniChips } from "../mini-chips/mini-chips";
 
export function BentoGridPerfil() {
  return (
    <div className="contenedor4">
        <div className="grid">
            <div className="seccion">
                <Chips></Chips>
                <span className="avatar"></span>
                <p id="nombre">Raúl Arenas</p>
                <p id="creacion">Invirtiendo en Astrae desde <span className="morado">2024</span></p>
                <span className="rankear"></span>
                <span className="contenedor-ancho">
                    <MiniChips label="Ubicación"></MiniChips>
                    <MiniChips label="Tipo Inversor"></MiniChips>
                    <MiniChips label="Sector favorito"></MiniChips>
                    <MiniChips label="Reseñas"></MiniChips>
                    <MiniChips label="Inversiones Exitosas"></MiniChips>
                    <MiniChips label="Promedio Retorno"></MiniChips>                    
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
  )
};
