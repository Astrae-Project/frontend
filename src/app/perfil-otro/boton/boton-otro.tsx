"use client";

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs"; // Instancia personalizada de Axios
import "./boton-style.css";
import Bubble from "@/app/ui/components/bubble/bubble";
import FormularioInversion from "@/app/ui/components/stripe-form/stripe-form";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function BotonesOtro({ username }) {
  const [isFollowing, setIsFollowing] = useState(null); // Estado para saber si el usuario sigue o no
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [usuarioObservado, setUsuarioObservado] = useState(null); // Información del usuario observado
  const [idUsuarioAutenticado, setIdUsuarioAutenticado] = useState(null); // ID del usuario autenticado
  const [activeBubble, setActiveBubble] = useState(null); // Estado dinámico para burbujas
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado para manejar si el formulario ha sido enviado
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState(""); // Tipo de mensaje ("success" o "error")
  const [selectedPercentage, setSelectedPercentage] = useState(10); // Porcentaje seleccionado
  const [selectedAmount, setSelectedAmount] = useState(1000); // Cantidad seleccionada
  const [rawAmount, setRawAmount] = useState(""); // Estado para el valor sin formato

  
  
  // Función para cerrar la burbuja
  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false); // Reiniciar el estado del formulario
    setConfirmationMessage(""); // Limpiar el mensaje de confirmación
    setMessageType(""); // Limpiar el tipo de mensaje
  };

  // Obtener datos del usuario autenticado
  const fetchUsuarioAutenticado = async () => {
    try {
      const response = await customAxios.get(`/data/usuario`, { withCredentials: true });
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
      const response = await customAxios.get(`/data/usuario/${username}`, { withCredentials: true });
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
        const response = await customAxios.delete(
          `/follow/seguir`,
          { data: { id_seguido: idSeGuido }, withCredentials: true }
        );

        if (response.status === 200) {
          setIsFollowing(false); // Cambiar estado a "no siguiendo"
        } else {
          throw new Error("No se pudo eliminar el seguimiento.");
        }
      } else {
        const response = await customAxios.post(
          `/follow/seguir`,
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

  const handleInvestClick = async () => {
    if (loading || !usuarioObservado?.startup) return;
    setLoading(true);

    try {
      const response = await customAxios.post(
        `/invest/oferta`,
        {
          id_startup: usuarioObservado.startup.id,
          porcentaje_ofrecido: selectedPercentage,
          monto_ofrecido: selectedAmount,
        },
        { withCredentials: true }
      );
      setConfirmationMessage("Oferta realizada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al realizar la oferta:", error);
      setConfirmationMessage("Hubo un error al realizar la oferta.");
      setMessageType("error");
      setFormSubmitted(true);
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
        className="custom-button boton-morado"
        id="suscribir"
        onClick={usuarioObservado?.startup ? () => setActiveBubble("crear-inversion") : undefined} // Solo ejecuta la función si es startup
        disabled={loading || !usuarioObservado?.startup} // Desactiva el botón si no es startup o está cargando
      >
        <p className="text">{usuarioObservado?.startup ? "Invertir" : "Suscribir"}</p>
      </button>
  
      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "crear-inversion" && !formSubmitted && (
          /*<Elements stripe={stripePromise}>*/
            <FormularioInversion selectedStartup={usuarioObservado?.startup} onClose={() => setActiveBubble(false)}/>
          /*</Elements>*/
        )}
      </Bubble>
    </span>
  );  
}
