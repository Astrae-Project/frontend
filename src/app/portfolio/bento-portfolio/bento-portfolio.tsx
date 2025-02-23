import React, { useEffect, useState } from "react";
import "./bento-portfolio-style.css"
import { StartupsSeguidas } from "../startups-seguidas/startups-seguidas";
import TablaPortfolio from "@/app/ui/components/tabla-portfolio/tabla-portfolio";
import Bubble from "@/app/ui/components/bubble/bubble";
import { IconPlus } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";
import GraficaInversorPortfolio from "@/app/ui/components/grafica-inversor/grafica-inversor-portfolio";

export function BentoGridPortfolio() {
  const [activeBubble, setActiveBubble] = useState(null); // Estado para mostrar el mensaje de confirmación
  const [rawAmount, setRawAmount] = useState(""); // Cantidad sin formato
  const [selectedAmount, setSelectedAmount] = useState(0); // Cantidad formateada
  const [selectedPercentage, setSelectedPercentage] = useState(0); // Porcentaje seleccionado
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado del formulario
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState(""); // Tipo de mensaje de confirmación
  const [selectedStartup, setSelectedStartup] = useState(null); // Startup seleccionada
  const [startups, setStartups] = useState([]);
  const [step, setStep] = useState(1); // Paso actual (1 = seleccionar evento, 2 = editar evento)
  const [loading, setLoading] = useState(false)
  
  
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
    fetchStartups();
  }, []);

  const handleInvestClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await customAxios.post(
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



  return (
    <div className="contenedor3">
        <div className="bento3">
            <div className="apartado3">
                <p>1</p>
            </div>
            <div className="apartado3">
                <button className="boton-invertir" onClick={() => setActiveBubble("crear-inversion")}><IconPlus></IconPlus></button>
            </div>
            <StartupsSeguidas></StartupsSeguidas>
            
            <GraficaInversorPortfolio></GraficaInversorPortfolio>
            <div className="apartado3">
                <TablaPortfolio></TablaPortfolio>
            </div>
            <div className="apartado3">
                <p>6</p>
            </div>
        </div>

        <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
        >
        {activeBubble === "crear-inversion" && step === 1 && !formSubmitted && (
          <div>
            <p>Selecciona un startup para invertir</p>
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
                          src={startup.usuario?.avatar || "/placeholder-avatar.png"}
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
                onClick={goToInvestForm}
                disabled={!selectedStartup}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "crear-inversion" && step === 2 && selectedStartup && (
          <div>
            <p>Haciendo oferta a {selectedStartup.usuario?.username || "Startup Desconocida"}</p>
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
  </div>
  )
};
