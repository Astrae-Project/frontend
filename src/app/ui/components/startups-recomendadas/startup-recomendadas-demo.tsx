"use client"

import {ScrollShadow} from "@nextui-org/react";
import "./startups-recomendadas-style.css";
import { Carta } from "../carta-startups/carta-startups";

export function StartupsRecomendadas() {
  return (
    <ScrollShadow size={1000} orientation="horizontal" className="contiene1" >
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
    </ScrollShadow>
  );
}