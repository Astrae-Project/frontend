"use client";

import React, { useState, useEffect } from "react";
import "./boton-style.css";
import customAxios from "@/service/api.mjs";
import Bubble from "@/app/ui/components/bubble/bubble";

export function Botones() {
  const [loading, setLoading] = useState(false); // Estado de carga
  const [usuario, setUsuario] = useState(null); // Información del usuario
  const [activeBubble, setActiveBubble] = useState(null); // Estado para mostrar el mensaje de confirmación
  const [rawAmount, setRawAmount] = useState(""); // Cantidad sin formato
  const [selectedAmount, setSelectedAmount] = useState(0); // Cantidad formateada
  const [selectedPercentage, setSelectedPercentage] = useState(0); // Porcentaje seleccionado
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado del formulario
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState("success"); // Tipo de mensaje de confirmación
  const [selectedStartup, setSelectedStartup] = useState(null); // Startup seleccionada
  const [startups, setStartups] = useState([]);
  const [step, setStep] = useState(1); // Paso actual (1 = seleccionar evento, 2 = editar evento)

  // Obtener datos del usuario
  const fetchUsuario = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, {
        withCredentials: true,
      });
      setUsuario(response.data); // Almacenar la información del usuario
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  // Obtener startups de la API
  const fetchStartups = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/startup`);
      setStartups(response.data.startups); // Almacenar las startups
    } catch (error) {
      console.error("Error fetching startups:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
    fetchStartups();
  }, []);

  const handleInvestClick = async () => {
    if (loading || !usuario?.startup) return;
    setLoading(true);

    try {
      const response = await customAxios.post(
        `http://localhost:5000/api/invest/oferta`,
        {
          id_startup: selectedStartup.id,
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

  const formatInversion = (monto) => {
    if (monto === null) {
      return "N/A";
    }

    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M €`;
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K €`;
    } else {
      return `${monto} €`;
    }
  };

  const handleSelectStartup = (startup) => {
    setSelectedStartup((prevSelected) => (prevSelected?.id === startup.id ? null : startup));
  };

  const goToInvestForm = () => {
    setStep(2); // Pasar al paso 2
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setMessageType("");
    setStep(1);
    setSelectedStartup(null);
    setSelectedAmount(0);
    setSelectedPercentage(0);
    setRawAmount("");
  };

  const renderBotonAccion = () => {
    if (usuario) {
      if (usuario.startup) {
        return (
          <button className="custom-button" id="compartir">
            <p className="text">Compartir</p>
          </button>
        );
      } else {
        return (
          <button
            className="custom-button boton-morado"
            id="suscribir"
            onClick={() => setActiveBubble("crear-inversion")}
            disabled={loading}
          >
            <p className="text">Invertir</p>
          </button>
        );
      }
    }
  };

  return (
    <span className="contenedor-botones1">
      <button className="custom-button" id="editar-perfil" disabled={loading}>
        <p className="text">{"Editar Perfil"}</p>
      </button>

      {renderBotonAccion()}

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "crear-inversion" && step === 1 && !formSubmitted && (
          <div>
            <p>Selecciona una startup para invertir</p>
            <div className="contenedor-eventos">
              <ul>
                {startups.length > 0 ? (
                  startups.map((startup) => (
                    <li
                      key={startup.id}
                      className={selectedStartup?.id === startup.id ? "selected" : ""}
                      onClick={() => handleSelectStartup(startup)}
                    >
                      <div className="portfolio-icono">
                        <img
                          src={startup.usuario?.avatar}
                          className="avatar-imagen"
                          alt="Avatar"
                        />
                      </div>
                      <div className="startup-lista">
                        <p className="nombre-startup">{startup.nombre}</p>
                        <p className="username-startup">{startup.usuario?.username || "Desconocido"}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No hay startups disponibles.</p>
                )}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={
                  
                }
                disabled={!selectedStartup}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "crear-inversion" && step === 2 && selectedStartup && (
          <div>
            <p className="titulo">Haciendo oferta a {selectedStartup.usuario?.username || "Startup Desconocida"}</p>
            <div className="formulario-inversion">
              <div className="campo-inversion">
                <label className="form-label" htmlFor="cantidad">Selecciona la cantidad de dinero:</label>
                <input
                  id="cantidad"
                  className="select-inversion"
                  value={rawAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, "");
                    setRawAmount(inputValue);
                    setSelectedAmount(Number(inputValue));
                  }}
                  onBlur={() => setRawAmount(formatInversion(selectedAmount))}
                  onFocus={() => setRawAmount(selectedAmount.toString())}
                />
              </div>
              <div className="campo-inversion">
                <label className="form-label" htmlFor="porcentaje">Selecciona el porcentaje:</label>
                <div className="campo-porcentaje">
                  <button className="selector-btn" onClick={() => setSelectedPercentage(selectedPercentage - 1)}>-</button>
                  <input
                    id="porcentaje"
                    className="input-inversion"
                    value={selectedPercentage}
                    onChange={(e) => setSelectedPercentage(Number(e.target.value))}
                  />
                  <button className="selector-btn" onClick={() => setSelectedPercentage(selectedPercentage + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="contendor-botn-invertir">
              <button className="botn-invertir" onClick={closeBubble}>
                Cancelar
              </button>
              <button className="botn-invertir enviar" type="submit" onClick={handleInvestClick}>
                Hacer Oferta
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </span>
  );
}
