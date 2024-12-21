"use client";

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs"; // Usa tu instancia de Axios personalizada
import './boton-style.css';

export function BotonesOtro() {
  const [isFollowing, setIsFollowing] = useState(false); // Estado para saber si el usuario ya sigue o no
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [usuario, setUsuario] = useState(null); // Estado para almacenar la información del usuario
  
  const fetchUsuario = async () => {
    if (!username) {
      console.error("No se encontró el username.");
      return;
    }

    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
        withCredentials: true,
      });

      setUsuario(response.data); // Almacena la información del usuario
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  const handleFollowClick = async () => {
    if (loading) return; // Evitar múltiples clics
    setLoading(true);

    try {
      // Supón que tienes el ID del usuario que se va a seguir
      const id_seguido = usuario?.id; // Usar el ID del usuario obtenido
      if (!id_seguido) throw new Error("ID del usuario no disponible.");

      const response = await customAxios.post(
        "http://localhost:5000/api/follow/seguir",
        { id_seguido },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setIsFollowing(true); // Cambia el estado a "siguiendo"
      }
    } catch (error) {
      console.error("Error al seguir al usuario:", error);
    } finally {
      setLoading(false); // Restablece el estado de carga
    }
  };

  const handleInvestClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const id_startup = usuario?.id; // Usar el ID del startup asociado al usuario
      if (!id_startup) throw new Error("ID de la startup no disponible.");

      const response = await customAxios.post(
        "http://localhost:5000/api/inversion/invertir",
        { id_startup },
        { withCredentials: true }
      );

      if (response.status === 201) {
        alert("Inversión realizada");
      }
    } catch (error) {
      console.error("Error al invertir en la startup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="contenedor-botones1">
      <button
        className="custom-button"
        id="seguir"
        onClick={handleFollowClick}
        disabled={loading} // Desactiva el botón mientras se está cargando
      >
        <p className="text">{isFollowing ? "Siguiendo" : "Seguir"}</p>
      </button>

      {/* Cambiar "Invertir" o "Suscribir" según el rol del usuario */}
      <button
        className="custom-button"
        id="suscribir"
        onClick={usuario?.startup ? handleInvestClick : undefined} // Solo ejecuta la función si es startup
        disabled={loading} // Desactiva el botón mientras se está cargando
      >
        <p className="text">{usuario?.startup ? "Invertir" : "Suscribir"}</p>
      </button>
    </span>
  );
}
