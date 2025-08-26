'use client'

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import { BentoGridPerfilOtro } from "./bento-perfil-otro/bento-perfil-otro";

export default function PerfilOtro() {
  
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Llama al endpoint relativo; customAxios ya apunta a /api con withCredentials
        await customAxios.post("/auth/refrescar-token");
        // Token renovado → podemos mostrar la página
        setIsLoading(false);
      } catch (error: any) {
        if (error.response?.status === 403) {
          // No hay refresh token → sesión expirada
          setSessionExpired(true);
        } else {
          // Cualquier otro error de red/servidor
          console.error("Error inesperado al refrescar token:", error);
        }
        // ¡Muy importante! Quitamos el loading en todos los casos
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
          onClick={() => window.location.href = 'http://https://landing-fu62u3718-astraes-projects-b730cac9.vercel.app/inicio-sesion'}
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
        <BentoGridPerfilOtro username={username} />
      </div>
    </main>
  );
}
