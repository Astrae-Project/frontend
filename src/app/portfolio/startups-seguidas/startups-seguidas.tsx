"use client"

import {ScrollShadow} from "@nextui-org/react";
import { Carta } from "../../ui/components/carta-startups/carta-startups";

import "./startups-seguidas-style.css";

export function StartupsSeguidas() {
  return (
    <ScrollShadow size={1000} orientation="horizontal" className="contiene" >
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
      <Carta/>
    </ScrollShadow>
  );
}
