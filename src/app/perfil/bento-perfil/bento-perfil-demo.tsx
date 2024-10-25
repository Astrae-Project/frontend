'use client';

import React from "react";

import './bento-perfil-style.css';
import Contacto from "@/app/ui/components/contacto/contacto";
import Eventos from "@/app/ui/components/eventos/eventos";
import InversorInfo from "@/app/ui/components/info/info";
import MovimientosRecientes from "@/app/ui/components/movimientos-recientes/movimientos-recientes";
import TablaGrupos from "@/app/ui/components/tabla-grupos/tabla-grupos";
import TablaPortfolio from "@/app/ui/components/tabla-portfolio/tabla-portfolio";
import Seguidores from "@/app/ui/components/seguidores/seguidores";
import Suscriptores from "@/app/ui/components/suscriptores/suscriptores";
import InversionesRealizadas from "@/app/ui/components/inversiones-realizadas/inversiones-realizadas";

export function BentoGridPerfil() {
  return (
    <div className="contenedor4">
      <div className="grid">
        <InversorInfo />
        <TablaPortfolio />
        <MovimientosRecientes />
        <Seguidores />
        <Suscriptores />
        <InversionesRealizadas />
        <Eventos />
        <TablaGrupos />
        <Contacto />
      </div>
    </div>
  );
}
