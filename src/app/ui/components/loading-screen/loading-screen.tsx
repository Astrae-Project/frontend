import React from "react";
import "./loading-screen-style.css";

const LoadingScreen = ({ message = "Cargando...", show = false }) => {
  if (!show) return null; // Si no está activo, no mostrar nada.

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mb-4"></div>
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
