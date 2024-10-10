"use client"

import {Chip} from "@nextui-org/react";
import './mini-chips-style.css'

interface MiniChipsProps {
    label: string;
  }

export function MiniChips({ label }: MiniChipsProps) {
  return (
    <Chip className="mini-chip"> {label}</Chip>
 
  );
}