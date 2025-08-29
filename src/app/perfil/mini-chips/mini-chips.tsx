'use client';

import React from "react";
import { Chip } from "@heroui/react";
import './mini-chips-style.modules.css';

interface MiniChipsProps {
  label: React.ReactNode;           // acepta JSX, string, number...
  tooltipText?: string | null;      // opcional
  className?: string;
  id?: string;
}

export function MiniChips({ label, tooltipText, className, id }: MiniChipsProps) {

  let extraClass = "";

  // Si el tooltipText es dinámico (número, puntuación, etc.)
  if (tooltipText && !isNaN(Number(tooltipText))) {
    extraClass = "chip-rating";
  }

  return (
    <div className={`mini-chips-wrapper ${className ?? ""}`} id={id}>
      <Chip className="mini-chip" aria-label={typeof label === "string" ? String(label) : undefined}>
        {label}
        {tooltipText ? (
          <span className="tooltip" role="note" aria-hidden="true">
            {tooltipText}
          </span>
        ) : null}
      </Chip>
    </div>
  );
}

// Export por defecto también, por compatibilidad con imports default
export default MiniChips;
