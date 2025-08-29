'use client';

import React from "react";
import { Chip } from "@heroui/react";
import './mini-chips-style.modules.css';

interface MiniChipsProps {
  label: React.ReactNode;           // acepta JSX, string, number...
  tooltipText?: string | null;      // opcional
  className?: string;
  id?: string;
  isStars?: boolean; // nuevo prop opcional
}

export function MiniChipsOtro({ label, tooltipText, className, id, isStars }: MiniChipsProps) {
  return (
    <div className={`mini-chips-wrapper ${className ?? ""}`} id={id}>
      <Chip className={`mini-chip ${isStars ? "chip-estrellas" : ""}`}>
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
export default MiniChipsOtro;
