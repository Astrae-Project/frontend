"use client"

import {Chip} from "@heroui/react";
import './mini-chips-style.modules.css'

interface MiniChipsProps {
  label: string;
  tooltipText: string; // Información para la burbuja
}

export function MiniChipsOtro({ label, tooltipText }: MiniChipsProps) {
return (
  <Chip className="mini-chip-otro">
    {label}
    {tooltipText && (
        <span className="tooltip">{tooltipText}</span>
      )}
  </Chip>
);
}
