'use client'

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import { BentoGridAjustes } from "./bento-ajustes/bento-ajustes";

export default function Ajustes() {

  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        await customAxios.post("/auth/refrescar-token");
        setIsLoading(false);
      } catch (error: any) {
        if (error.response?.status === 403) {
          setSessionExpired(true);
        } else {
          console.error("Error inesperado al refrescar token:", error);
        }
        setIsLoading(false);
      }
    };

    verificarSesion();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="/Logo.svg"
          alt="Cargando..."
          className="heartbeat"
        />
      </div>
    );
  }
  

  // Si detectamos sesión expirada (403), mostramos el aviso
  if (sessionExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-semibold mb-4">Sesión expirada</h1>
        <p className="mb-6 text-center">Para continuar, inicia sesión de nuevo.</p>
        <button
          onClick={() => window.location.href = 'http://localhost:4321/inicio-sesion'}
          className="relative w-auto h-[35px] bg-[#6e4ba3] border border-[#1E202F] rounded-[7px] text-[13.5px] px-[25px]"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <main>
      <div>
        <BentoGridAjustes></BentoGridAjustes>
      </div>   
    </main>      
  );
}