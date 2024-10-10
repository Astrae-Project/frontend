"use client"

import {Chip} from "@nextui-org/react";
import './chip-style.css'

export function Chips() {
  return (
    <Chip startContent={<span className="status-dot"></span>} className="custom-chip"><p className="chip">Inversor</p></Chip>
  );
} 