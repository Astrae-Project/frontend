"use client";

import { Chip } from "@heroui/react";
import './mini-chips-style.modules.css'

interface MiniChipsProps {
    label: string;
    tooltipText: string; // Información para la burbuja
}

export function MiniChips({ label, tooltipText }: MiniChipsProps) {
  return (
    <Chip className="mini-chip">
      {label}
      {tooltipText && (
        <span className="tooltip">{tooltipText}</span>
      )}
    </Chip>
  );
}
