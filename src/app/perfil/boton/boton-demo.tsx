"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Importa Axios para hacer la solicitud al backend
import './boton-style.css';
import customAxios from "@/service/api.mjs";

export function Botones() {
  const [isFollowing, setIsFollowing] = useState(false); // Estado para saber si el usuario ya sigue o no
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [usuario, setUsuario] = useState(null); // Estado para almacenar la información del usuario

  const fetchUsuario = async () => {
    try {
      const response = await customAxios.get("http://localhost:5000/api/data/usuario", {
        withCredentials: true,
      });
      
      setUsuario(response.data); // Almacena la información del usuario
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  const handleFollowClick = async () => {
    if (loading) return; // Si ya está en carga, evitar más clics
    setLoading(true);

    try {
      // Suponiendo que tienes el ID del usuario al que se va a seguir
      const id_seguido = 5; // Aquí se debería obtener el ID del usuario al que se quiere seguir
      const response = await axios.post('http://localhost:5000/api/follow/seguir', { id_seguido }, {
        withCredentials: true, // Asegura que se envíen las cookies (si usas sesiones)
      });

      if (response.status === 201) {
        setIsFollowing(true); // Cambia el estado a "siguiendo"
      }
    } catch (error) {
      console.error('Error al seguir al usuario:', error);
    } finally {
      setLoading(false); // Restablece el estado de carga
    }
  };

  const handleInvestClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const id_startup = 5; // Aquí se debería obtener el ID de la startup en la que se quiere invertir
      const response = await axios.post('http://localhost:5000/api/inversion/invertir', { id_startup }, {
        withCredentials: true, 
      });

      if (response.status === 201) {
        // Aquí podrías actualizar el estado o manejar la respuesta
        alert('Inversión realizada');
      }
    } catch (error) {
      console.error('Error al invertir en la startup:', error);
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
      
      {/* Aquí mostramos "Invertir" si es una startup, o "Suscribir" si no lo es */}
      <button
        className="custom-button"
        id="suscribir"
        onClick={usuario?.startup ? handleInvestClick : undefined} // Solo ejecuta la función si es startup
      >
        <p className="text">{usuario?.startup ? "Invertir" : "Suscribir"}</p>
      </button>
    </span>
  );
}
