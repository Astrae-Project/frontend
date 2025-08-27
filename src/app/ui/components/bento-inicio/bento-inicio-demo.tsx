import React, { useEffect, useState } from "react";
import "./bento-inicio-style.css";
import "../../../perfil/boton/boton-style.css";
import { Placeholder } from "../placeholder/placeholder-demo";
import { StartupsRecomendadas } from "../startups-recomendadas/startup-recomendadas-demo";
import EventosyCalendario from "../eventos-calendario/eventos-calendario";
import MovimientosRecientes1 from "../movimientos-recientes/movimientos-recientes";
import customAxios from "@/service/api.mjs";
import GraficaInversor from "../grafica-inversor/grafica-inversor";
import GraficaStartup from "../grafica-startup/grafica-startup";
import Bubble from "../bubble/bubble";
import { IconPlus, IconUsersPlus } from "@tabler/icons-react";
import MovimientosSeguidos from "../movimientos-recientes/movimientos-recientes-seguidos";
import Notificaciones from "../notificaciones/notificaciones";
import LoadingScreen from "../loading-screen/loading-screen";
import { OfertasPendientes } from "../ofertas-pendientes/ofertas-pendientes";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import FormularioInversion from "../stripe-form/stripe-form";
import HitosDashboard from "../timeline-startup/hitos-dashborad";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


export function BentoGridInicio({username}) {
  const [loading, setLoading] = useState(false); // Estado de carga
  const [rol, setRol] = useState(null); // Estado para el rol
  const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario
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
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "publico",
  });

  const fetchRol = async () => {
    try {
      const response = await customAxios.get(`https://api.astraesystem.com/api/data/usuario`, {
        withCredentials: true, // Enviar cookies con la solicitud
      });

      // Verificamos si es un inversor o una startup
      if (response.data.inversor) {
        setRol("inversor");
        setUsuario(response.data.inversor);
      } else if (response.data.startup) {
        setRol("startup");
        setUsuario(response.data.startup);
      } else {
        console.error("No se encontró un tipo de usuario válido");
        setRol(null);
      }
    } catch (error) {
      console.error("Error fetching rol:", error);
      setRol(null);
    }
  };

    // Obtener startups de la API
    const fetchStartups = async () => {
      try {
        const response = await customAxios.get(`https://api.astraesystem.com/api/data/startup`);
        setStartups(response.data.startups); // Almacenar las startups
      } catch (error) {
        console.error("Error fetching startups:", error);
      }
    };

  useEffect(() => {
    fetchRol(); // Llamada a la API cuando se monta el componente
    fetchStartups();
  }, []);

    // Maneja la creación de un nuevo grupo
    const handleCrearGrupo = async () => {
      try {
        const response = await customAxios.post(
          "https://api.astraesystem.com/api/grupos/crear",
          formData,
          { withCredentials: true }
        );
        setConfirmationMessage("Grupo creado con éxito!");
        setMessageType("success");
        setFormSubmitted(true);
        closeBubble();
      } catch (error) {
        console.error("Error al crear el grupo:", error);
        setConfirmationMessage("Hubo un error al crear el grupo.");
        setMessageType("error");
        setFormSubmitted(true);
      }
    };

  const handleInvestClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await customAxios.post(
        `https://api.astraesystem.com/api/invest/oferta`,
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

  if (rol === null) {
    return <LoadingScreen></LoadingScreen> // Puedes mostrar un mensaje de carga mientras esperas la respuesta
  }

  return (
    <div className="contenedor">
      <h1 className="hero">
        Hola {rol === "inversor" ? usuario?.nombre : usuario.usuario.username  }, bienvenido de nuevo
      </h1>
      <Placeholder />
      
      {rol === "inversor" ? (
        <>
        <button id="pequeño1" className="apartado" onClick={() => setActiveBubble("crear-inversion")}><IconPlus></IconPlus></button>
        <button id="pequeño2" className="apartado" onClick={() => setActiveBubble("crear-grupo")}><IconUsersPlus></IconUsersPlus></button>
  
        <div className="bento">
          <div className="apartado">
            <GraficaInversor />
          </div>
          <div className="apartado">
            <MovimientosRecientes1 />
          </div>
          <div className="apartado">
            <EventosyCalendario />
          </div>
          <div className="apartado">
            <Notificaciones></Notificaciones>
          </div>
          <div className="apartado">
            <MovimientosSeguidos />
          </div>
           <StartupsRecomendadas />

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

        {activeBubble === "crear-grupo" && !formSubmitted && (
          <div className="crear-grupo-container">
            <h2>Crear Grupo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCrearGrupo();
              }}
              className="crear-grupo-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                  placeholder="Descripción del grupo"
                />
              </div>
              <div className="form-group">
                <div className="tipo-opciones">
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="publico"
                      checked={formData.tipo === "publico"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={formData.tipo === "privado"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Privado</p>
                  </label>
                </div>
              </div>
              <div className="contendor-botn-grupo">
                <button
                  type="button"
                  className="botn-eventos"
                  onClick={closeBubble}
                >
                  Cancelar
                </button>
                <button type="submit" className="botn-eventos enviar">
                  Crear
                </button>
              </div>
            </form>
          </div>
        )}
      </Bubble>
      </div>
      </>
      ) : rol === "startup" ? (
        <>
        <button id="pequeño2" className="apartado" onClick={() => setActiveBubble("crear-grupo")}><IconUsersPlus></IconUsersPlus></button>

        <div className="bento">
          <div className="apartado">
            <GraficaStartup />
          </div>
          <div className="apartado">
            <HitosDashboard />
          </div>
          <div className="apartado">
            <EventosyCalendario />
          </div>
          <div className="apartado">
            <Notificaciones />
          </div>
          <div className="apartado">
            <MovimientosSeguidos />
          </div>
          <OfertasPendientes />

          <Bubble
            show={!!activeBubble}
            onClose={closeBubble}
            message={confirmationMessage}
            type={messageType}
          >
          {activeBubble === "crear-grupo" && !formSubmitted && (
          <div className="crear-grupo-container">
            <h2>Crear Grupo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCrearGrupo();
              }}
              className="crear-grupo-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                  placeholder="Descripción del grupo"
                />
              </div>
              <div className="form-group">
                <div className="tipo-opciones">
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="publico"
                      checked={formData.tipo === "publico"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={formData.tipo === "privado"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Privado</p>
                  </label>
                </div>
              </div>
              <div className="contendor-botn-grupo">
                <button
                  type="button"
                  className="botn-eventos"
                  onClick={closeBubble}
                >
                  Cancelar
                </button>
                <button type="submit" className="botn-eventos enviar">
                  Crear
                </button>
              </div>
            </form>
          </div>
        )}
      </Bubble>
        </div>
        </>
      ) : (
        <div>No se encontró un rol válido</div>
      )}
    </div>
  );
}
