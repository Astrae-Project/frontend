'use client';

import React from "react";
import { Chip } from "@heroui/react";
import './mini-chips-style.modules.css';

interface MiniChipsProps {
  label: React.ReactNode;
  tooltipText?: string | null;
  className?: string;
  id?: string;
  isStars?: boolean; // nuevo prop opcional
}

export function MiniChips({ label, tooltipText, className, id, isStars }: MiniChipsProps) {
  const extraClass = isStars ? "chip-estrellas" : "";

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
