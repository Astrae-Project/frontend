'use client'

import React, { useState, useEffect, Suspense } from "react";
import customAxios from "@/service/api.mjs";
import { BentoGridPerfilOtro } from "./bento-perfil-otro/bento-perfil-otro";
import { useSearchParams } from "next/navigation";

export default function PerfilOtro() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // useSearchParams() vive en un componente cliente — OK — pero debemos envolver la UI que lo usa en Suspense
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") ?? "";

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Llama al endpoint relativo; customAxios ya apunta a /api con withCredentials
        await customAxios.post("/auth/refrescar-token");
        // Token renovado → podemos mostrar la página
        setIsLoading(false);
      } catch (error: any) {
        if (error?.response?.status === 403) {
          // No hay refresh token → sesión expirada
          setSessionExpired(true);
        } else {
          // Cualquier otro error de red/servidor
          console.error("Error inesperado al refrescar token:", error);
        }
        // Quitamos el loading en todos los casos
        setIsLoading(false);
      }
    };

    verificarSesion();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/Logo.svg" alt="Cargando..." className="heartbeat" />
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-semibold mb-4">Sesión expirada</h1>
        <p className="mb-6 text-center">Para continuar, inicia sesión de nuevo.</p>
        <button
          onClick={() => window.location.href = 'https://landing-fu62u3718-astraes-projects-b730cac9.vercel.app/inicio-sesion'}
          className="relative w-auto h-[35px] bg-[#6e4ba3] border border-[#1E202F] rounded-[7px] text-[13.5px] px-[25px]"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Envuelve la parte que usa useSearchParams / renderiza la UI cliente en Suspense
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <img src="/Logo.svg" alt="Cargando..." className="heartbeat" />
          </div>
        }
      >
        {username ? (
          <div>
            <BentoGridPerfilOtro username={username} />
          </div>
        ) : (
          // Si entras sin username en query, evita render errors y muestra aviso (puedes personalizar)
          <div className="flex flex-col items-center justify-center h-48 p-4">
            <p className="mb-2">No se ha especificado el usuario en la URL.</p>
            <p className="text-sm text-muted">Accede desde la lista de usuarios o añade ?username=usuario</p>
          </div>
        )}
      </Suspense>
    </main>
  );
}