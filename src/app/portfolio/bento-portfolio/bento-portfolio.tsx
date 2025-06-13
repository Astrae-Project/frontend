import React, { useEffect, useState } from "react";
import "./bento-portfolio-style.css"
import StartupsSeguidas from "../startups-seguidas/startups-seguidas";
import TablaPortfolio from "@/app/ui/components/tabla-portfolio/tabla-portfolio";
import Bubble from "@/app/ui/components/bubble/bubble";
import { IconPlus } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";
import GraficaInversorPortfolio from "@/app/ui/components/grafica-inversor/grafica-inversor-portfolio";
import ResumenPortfolio from "@/app/ui/components/resumen/resumen";
import TablaInversiones from "@/app/ui/components/tabla-inversiones/tabla-inversiones";
import { Elements } from "@stripe/react-stripe-js";
import FormularioInversion from "@/app/ui/components/stripe-form/stripe-form";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


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
            <ResumenPortfolio></ResumenPortfolio>
            <div className="apartado3">
                <button className="boton-invertir" onClick={() => setActiveBubble("crear-inversion")}><IconPlus></IconPlus></button>
            </div>
            <StartupsSeguidas></StartupsSeguidas>
  
            <GraficaInversorPortfolio></GraficaInversorPortfolio>
            <div className="apartado3">
                <TablaPortfolio></TablaPortfolio>
            </div>
            
            <TablaInversiones></TablaInversiones>
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
          <Elements stripe={stripePromise}>
            <FormularioInversion selectedStartup={selectedStartup}  onClose={() => setActiveBubble(false)}/>
          </Elements>
        )}
        </Bubble>
  </div>
  )
};
