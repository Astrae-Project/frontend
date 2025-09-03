'use client'

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";
import { BentoGridPerfilOtro } from "./bento-perfil-otro/bento-perfil-otro";

export default function PerfilOtro(props) {
  // Extrae username de múltiples formas que Next puede pasar (params, searchParams, props direct)
  const username = (() => {
    if (!props) return "";
    if (typeof props === "string") return props;
    if (typeof props.username === "string") return props.username;
    if (typeof props.params?.username === "string") return props.params.username;
    if (typeof props.route?.params?.username === "string") return props.route.params.username;
    if (typeof props.searchParams?.username === "string") return props.searchParams.username;
    return ""; // fallback
  })();

  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        await customAxios.post("/auth/refrescar-token");
        setIsLoading(false);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 403) {
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

  return (
    <main>
      <div>
        <BentoGridPerfilOtro username={username} />
      </div>
    </main>
  );
}