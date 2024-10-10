"use client";

import { IconArrowRight } from "@tabler/icons-react";
import "./placeholder-style.css"

export function Placeholder() {
return(
  <main>
    <div className="placeholder-container">
      <input className="placeholder" type="text" placeholder="Hola"></input>
      <button className="submit-btn" type="submit"><IconArrowRight className="icono1"></IconArrowRight></button>
    </div>
  </main>

)
}