"use client";

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs"; // Instancia personalizada de Axios
import "./boton-style.css";

export function BotonesOtro({ username }) {
  const [isFollowing, setIsFollowing] = useState(null); // Estado para saber si el usuario sigue o no
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [usuarioObservado, setUsuarioObservado] = useState(null); // Información del usuario observado
  const [idUsuarioAutenticado, setIdUsuarioAutenticado] = useState(null); // ID del usuario autenticado

  // Obtener datos del usuario autenticado
  const fetchUsuarioAutenticado = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, { withCredentials: true });
      console.log("Datos del usuario autenticado:", response.data);  // Ver los datos de la respuesta
      if (response.data) {
        const { inversor, startup } = response.data;
        const usuarioData = inversor || startup;
        if (usuarioData) {
          setIdUsuarioAutenticado(usuarioData.id_usuario);
        }
      }
    } catch (error) {
      console.error("Error al obtener la información del usuario autenticado:", error.message);
    }
  };

  // Obtener datos del usuario observado (por su username)
  const fetchUsuarioObservado = async () => {
    if (!username) return;

    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, { withCredentials: true });
      console.log("Datos del usuario observado:", response.data);  // Ver los datos de la respuesta
      if (response.data) {
        setUsuarioObservado(response.data);
      }
    } catch (error) {
      console.error("Error al obtener la información del usuario observado:", error.message);
    }
  };

  useEffect(() => {
    fetchUsuarioAutenticado();
    fetchUsuarioObservado();
  }, [username]); // Actualizar datos cuando cambie el username

  // Comprobar si el usuario autenticado sigue al observado
  useEffect(() => {
    if (usuarioObservado && idUsuarioAutenticado) {
      const usuarioData = usuarioObservado.startup || usuarioObservado.inversor;
      if (usuarioData && usuarioData.usuario) {
        const seguidores = usuarioData.usuario.seguidores || [];
        const isUserFollowing = seguidores.some((seguidor) => seguidor.id_seguidor === idUsuarioAutenticado);
        console.log("Comprobando seguidores:", seguidores, "Is Following:", isUserFollowing);  // Verificación de seguidores
        setIsFollowing(isUserFollowing);
      }
    }
  }, [usuarioObservado, idUsuarioAutenticado]);

  // Manejar el seguimiento
  const handleFollowClick = async () => {
    if (loading || !usuarioObservado) return;
    setLoading(true);

    try {
      const usuarioData = usuarioObservado.startup || usuarioObservado.inversor;
      const idSeGuido = usuarioData?.usuario?.id;
      if (!idSeGuido) {
        console.error("No se encontró el ID del usuario a seguir");
        return;
      }

      // Si ya está siguiendo, eliminar el seguimiento (hacer DELETE)
      if (isFollowing) {
        console.log("Eliminando seguimiento a:", idSeGuido);
        const response = await customAxios.delete(
          `http://localhost:5000/api/follow/seguir`,
          { data: { id_seguido: idSeGuido }, withCredentials: true }
        );

        if (response.status === 200) {
          setIsFollowing(false); // Cambiar estado a "no siguiendo"
        } else {
          throw new Error("No se pudo eliminar el seguimiento.");
        }
      } else {
        // Si no está siguiendo, agregar el seguimiento (hacer POST)
        console.log("Enviando solicitud de seguimiento a:", idSeGuido);
        const response = await customAxios.post(
          `http://localhost:5000/api/follow/seguir`,
          { id_seguido: idSeGuido },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setIsFollowing(true); // Cambiar estado a "siguiendo"
        } else {
          throw new Error("No se pudo completar la acción de seguir.");
        }
      }
    } catch (error) {
      console.error("Error al manejar el seguimiento:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar la inversión
  const handleInvestClick = async () => {
    if (loading || !usuarioObservado?.startup) return;
    setLoading(true);

    try {
      const response = await customAxios.post(
        `http://localhost:5000/api/inversion/invertir`,
        { id_startup: usuarioObservado.startup.id },
        { withCredentials: true }
      );

      if (response.status === 201) {
        alert("Inversión realizada con éxito.");
      } else {
        throw new Error("No se pudo realizar la inversión.");
      }
    } catch (error) {
      console.error("Error al invertir en la startup:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="contenedor-botones1">
      <button
        className={`custom-button ${isFollowing ? "following" : "not-following"}`}
        id="seguir"
        onClick={handleFollowClick}
        disabled={loading || !usuarioObservado} // Desactiva el botón si no hay usuario o está cargando
      >
        <p className="text">{isFollowing ? "Siguiendo" : "Seguir"}</p>
      </button>

      <button
        className="custom-button"
        id="suscribir"
        onClick={usuarioObservado?.startup ? handleInvestClick : undefined} // Solo ejecuta la función si es startup
        disabled={loading || !usuarioObservado?.startup} // Desactiva el botón si no es startup o está cargando
      >
        <p className="text">{usuarioObservado?.startup ? "Invertir" : "Suscribir"}</p>
      </button>
    </span>
  );
}
