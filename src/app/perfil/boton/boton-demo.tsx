"use client";

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";
import Bubble from "@/app/ui/components/bubble/bubble";
import FormularioInversion from "@/app/ui/components/stripe-form/stripe-form";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import './boton-style.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function Botones() {
  const [loading, setLoading] = useState(false); // Estado de carga
  const [user, setUser] = useState(null); // Información del usuario
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
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    avatar: "",
    ciudad: "",
    pais: "",
    perfil_inversion: "",
    sector: "",
    estado_financiacion: "",
    plantilla: "",
  });

  // Obtener datos del usuario
  const fetchUsuario = async () => {
    try {
      const response = await customAxios.get(`/data/usuario`, {
        withCredentials: true,
      });
      setUser(response.data); // Almacenar la información del usuario
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  // Obtener startups de la API
  const fetchStartups = async () => {
    try {
      const response = await customAxios.get(`/data/startup`);
      setStartups(response.data.startups); // Almacenar las startups
    } catch (error) {
      console.error("Error fetching startups:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
    fetchStartups();
  }, []);

    // 2) Cada vez que 'usuario' cambia, rellenamos formData
  useEffect(() => {
    if (!user) return;

    setFormData({
      nombre: user?.inversor?.nombre || user?.startup?.nombre || "",
      username: user?.inversor?.usuario?.username || user?.startup?.usuario?.username || "",
      avatar: user?.usuario?.avatar || "",
      ciudad: user?.inversor?.usuario?.ciudad || user?.startup?.usuario?.ciudad || "",
      pais: user?.inversor?.usuario?.pais || user?.startup?.usuario?.pais || "",
      perfil_inversion: user?.inversor?.perfil_inversion || "",
      sector: user?.startup?.sector || "",
      estado_financiacion: user?.startup?.estado_financiacion || "",
      plantilla: user?.startup?.plantilla || "",
    });
  }, [user]);

  const handleEditarPerfil = async () => {
    try {
      await customAxios.put(
        `/perfil/editar-perfil`,
        formData
      );
      await fetchUsuario();
      setActiveBubble(null);
    } catch (error) {
      console.error("Error editando grupo:", error);
      setConfirmationMessage(error.response.data.message);
      setMessageType("error");
    }
  }

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
    if (user) {
      if (user.startup) {
        return (
          <button className="custom-button boton-morado" id="compartir">
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
    <div className="contenedor-botones1">
      {user && user.startup ? (
        // Si el usuario es una startup, solo se muestra el botón de editar perfil al 100%
        <button
          className="custom-button"
          id="editar-perfil"
          disabled={loading}
          onClick={() => setActiveBubble("editar-perfil")}
          style={{ width: '100%' }} // Estilo en línea para el ancho
        >
          <p className="text">{"Editar Perfil"}</p>
        </button>
      ) : (
        // Si es inversor u otro, se muestran ambos botones
        <>
          <button className="custom-button" id="editar-perfil" disabled={loading} onClick={() => setActiveBubble("editar-perfil")}>
            <p className="text">{"Editar Perfil"}</p>
          </button>
          {renderBotonAccion()}
        </>
      )}
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
                      className={selectedStartup?.id === startup.id ? "inversion-item selected" : "inversion-item"}
                      onClick={() => handleSelectStartup(startup)}
                    >
                      <div className="portfolio-icono">
                        <img
                          src={startup.usuario?.avatar || "/default-avatar.png"}
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
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={
                  selectedStartup
                    ? goToInvestForm
                    : () => alert("Por favor, selecciona una startup.")
                }
                disabled={!selectedStartup}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "crear-inversion" && step === 2 && selectedStartup && (
          /*<Elements stripe={stripePromise}>*/
            <FormularioInversion selectedStartup={selectedStartup}  onClose={() => setActiveBubble(false)}/>
          /*</Elements>*/
        )}

        {activeBubble === "editar-perfil" && (
          <div>
            <div className="crear-grupo-container">
              <h2 className ='texto-titulo'>Editar Perfil</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditarPerfil();
                }}
                className="crear-grupo-form"
              >
              <div className ='seccion-form'>
              <div className="form-profile">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    placeholder="Nombre"
                    id="nombre1"
                  />
                </div>

                <div className="form-profile">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    placeholder="Nombre de usuario"
                    id="username1"
                  />
                </div>
              </div>

              <div className ='seccion-form'>
                <div className="form-profile">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    placeholder="Ciudad"
                  />
                </div>

                <div className="form-profile">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pais}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                    placeholder="País"
                  />
                </div>
              </div>

                {user.inversor && (
                  <>
                    <div className="form-profile">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.perfil_inversion}
                        onChange={(e) =>
                          setFormData({ ...formData, perfil_inversion: e.target.value })
                        }
                        placeholder="Perfil de inversión"
                      />
                    </div>
                  </>
                )}

                {user.startup && (
                  <>
                    <div className="form-profile">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sector}
                        onChange={(e) =>
                          setFormData({ ...formData, sector: e.target.value })
                        }
                        placeholder="Sector"
                      />
                    </div>

                    <div className="form-profile">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.estado_financiacion}
                        onChange={(e) =>
                          setFormData({ ...formData, estado_financiacion: e.target.value })
                        }
                        placeholder="Ronda de financiación"
                      />
                    </div>

                    <div className="form-profile">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.plantilla}
                        onChange={(e) =>
                          setFormData({ ...formData, plantilla: e.target.value })
                        }
                        placeholder="Número de empleados"
                      />
                    </div>
                  </>
                )}

                <div className="contenedor-botn-invertir">
                  <button className="botn-invertir" onClick={closeBubble}>
                    Cancelar
                  </button>
                  <button
                    className="botn-invertir enviar"
                    type="submit"
                    onClick={handleEditarPerfil}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}
