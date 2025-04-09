import React from "react";
import "./bubble-style.css"; // Archivo CSS para el diseño y animaciones
import { IconCircleCheck, IconCircleX, IconHelp } from "@tabler/icons-react";

const Bubble = ({ show, onClose, children, message, type }) => {
  if (!show) return null; // No renderiza nada si `show` es false

  return (
    <div className="bubble-overlay" onClick={onClose}>
      <div className="bubble-content" onClick={(e) => e.stopPropagation()}>
        {message && (
          <div className={`mensaje-confirmacion ${type}`}>
            {type === "success" ? (
              <IconCircleCheck id="check" />
            ) : type === "neutral" ? (
              <IconHelp id="neutral" />
            ) : (
              <IconCircleX id="error" />
            )}
            <h2>{message}</h2>
          </div>
        )}
        {children} {/* Aquí van los contenidos dinámicos */}
      </div>
    </div>
  );
};

export default Bubble;
