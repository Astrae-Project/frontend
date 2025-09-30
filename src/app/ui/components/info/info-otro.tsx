'use client';

import React, { useState, useEffect } from "react";
import {
  IconBriefcaseFilled,
  IconBulbFilled,
  IconChartPieFilled,
  IconCurrencyEuro,
  IconFileDownloadFilled,
  IconMapPinFilled,
  IconMedal,
  IconPercentage,
  IconStar,
  IconStarFilled,
  IconUserFilled,
  IconFileTypeDocx,
  IconFileTypeDoc,
  IconFileTypePdf,
} from "@tabler/icons-react";

import "../../../perfil/bento-perfil/bento-perfil-style.css";
import "../../../perfil/estrellas/estrellas-style.modules.css";

import customAxios from "@/service/api.mjs";
import { BotonesOtro } from "@/app/perfil-otro/boton/boton-otro";
import { ChipsOtro } from "@/app/perfil-otro/chip/chip-otro";
import StarRating from "../../../perfil/estrellas/estrellas";
import { MiniChipsOtro } from "@/app/perfil-otro/mini-chips/mini-chips";
import Bubble from "../bubble/bubble";

interface InfoOtroProps {
  username: string;
}

const InfoOtro = ({ username }: InfoOtroProps) => {
  // Estados principales
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [perfilTipo, setPerfilTipo] = useState(""); // inversor o startup
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);

  // Otros estados
  const [activeBubble, setActiveBubble] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [hovered, setHovered] = useState(0);
  const [documentos, setDocumentos] = useState([]);
  const [selectedDocumento, setSelectedDocumento] = useState(null);

  // Fetch del rol del usuario
  const fetchRol = async () => {
    try {
      const response = await customAxios.get("/data/usuario", {
        withCredentials: true,
      });

      if (response.data.inversor) setRol("inversor");
      else if (response.data.startup) setRol("startup");
      else console.error("Tipo de usuario no válido");
    } catch (error) {
      console.error("Error fetching rol:", error);
    }
  };

  // Fetch de datos del usuario
  const fetchDatos = async () => {
    try {
      const response = await customAxios.get(
        `/data/usuario/${username}`,
        { withCredentials: true }
      );

      const data = response.data;
      if (!data) throw new Error("No data received from API");

      setUsuario(data.inversor || data.startup);
      setPerfilTipo(data.inversor ? "inversor" : "startup");
      setSectorFavorito(data.sectorFavorito || "Desconocido");
      setInversionesRealizadas(data.inversor ? data.inversionesRealizadas : data.startup?.inversiones?.length || 0);
      setRoiPromedio(data.roiPromedio || 0);
      setPuntuacionMedia(data.puntuacionMedia || 0);
      setRecaudacionTotal(data.recaudacionTotal || 0);

      if (data.inversor) {
        const exitosas = data.inversor.inversiones.filter((inv) => inv.esExitosa).length;
        setInversionesExitosas(exitosas);
      } else if (data.startup) {
        const exitosas = data.startup.inversiones.filter((inv) => inv.monto_invertido > 0).length;
        setInversionesExitosas(exitosas);
      }
    } catch (error) {
      console.error("Error fetching usuario data:", error);
    }
  };

  const fetchDocumentos = async () => {
    if (!usuario || !usuario.id) return;
    try {
      const response = await customAxios.get(
        `/perfil/documento/${usuario.id}`,
        { withCredentials: true }
      );
      setDocumentos(response.data);
    } catch (error) {
      console.error("Error fetching documentos:", error);
    }
  };
  useEffect(() => {
    if (usuario && perfilTipo === "startup") {
      fetchDocumentos();
    }
  }, [usuario, perfilTipo]);

  const handleDownloadDocument = async (documento) => {
    if (!documento?.id) {
      console.error("No document selected or invalid document ID");
      return;
    }

    try {
      const response = await customAxios.get(
        `/perfil/documento/download/${documento.id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", documento.nombre || "documento.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const renderIconByTipo = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "pdf":
        return <IconFileTypePdf className="documento-icono-img"/>;
      case "doc":
      case "docx":
        return <IconFileTypeDoc className="documento-icono-img" />;
      default:
        return <IconFileDownloadFilled className="documento-icono-img" />;
    }
  };


  // Formato para las inversiones
  const formatInversion = (monto) => {
    if (monto === null) return "N/A";
    if (monto >= 1e6) return `${(monto / 1e6).toFixed(1)}M€`;
    if (monto >= 1e3) return `${(monto / 1e3).toFixed(1)}K€`;
    return `${monto}€`;
  };

  // Función para manejar el clic en las estrellas
  const handleClick = (index) => {
    setPuntuacion(index);
  };

  // Función para manejar el hover sobre las estrellas
  const handleMouseEnter = (index) => {
    setHovered(index);
  };

  // Función para manejar el mouse fuera de las estrellas
  const handleMouseLeave = () => {
    setHovered(0); // Restauramos al estado inicial cuando el mouse se va
  };

  const totalStars = 5;
  const stars = [];

  // Generar las estrellas con el estado actual de puntuación y hover
  for (let i = 1; i <= totalStars; i++) {
    const isFilled = i <= puntuacion; // Verifica si la estrella debe estar llena
    const isHovered = i <= hovered; // Verifica si la estrella está siendo "hovered"

    stars.push(
      <span
        key={i}
        className="star-big"
        onClick={() => handleClick(i)} // Al hacer click se establece la puntuación
        onMouseEnter={() => handleMouseEnter(i)} // Al pasar el ratón se actualiza el estado de hover
        onMouseLeave={handleMouseLeave} // Cuando el ratón se va se restaura el estado
      >
        {isHovered || isFilled ? (
          <IconStarFilled className="big" /> // Si la estrella está llena o "hovered"
        ) : (
          <IconStar className="big" /> // Si la estrella está vacía
        )}
      </span>
    );
  }

    const handleEnviarResena = async () => {
      if (!puntuacion) {
        setConfirmationMessage("Por favor, completa todos los campos obligatorios.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }
    
      try {

        const startupResponse = await customAxios.get("/data/usuario", {
          withCredentials: true,
        });
  
        const inversorResponse = await customAxios.get(
          `/data/usuario/${username}`,
          { withCredentials: true }
        );
        
        // Obtener el id de la startup y el inversor desde las respuestas de las APIs
        const idStartup = startupResponse?.data?.startup?.id;
        const idInversor = inversorResponse?.data?.inversor?.id;
    
        // Verificar que ambos IDs estén presentes
        if (!idStartup || !idInversor) {
          setConfirmationMessage("Faltan datos importantes para enviar la reseña.");
          setMessageType("error");
          setFormSubmitted(true);
          return;
        }
    
        // Validar puntuación dentro del rango permitido
        if (puntuacion < 1 || puntuacion > 5) {
          setConfirmationMessage("La puntuación debe estar entre 1 y 5.");
          setMessageType("error");
          setFormSubmitted(true);
          return;
        }
    
    
        // Enviar los datos a la API de reseñas
        await customAxios.post(
          "/perfil/resena",
          {
            id_inversor: idInversor,
            id_startup: idStartup,
            puntuacion,
            comentario: comentario.trim() || "", // Si no hay comentario, enviar vacío
          },
          { withCredentials: true } // Incluir credenciales
        );
    
        setConfirmationMessage("¡Reseña realizada con éxito!"); // Mensaje de éxito
        setMessageType("success"); // Tipo de mensaje de éxito
        setFormSubmitted(true); // Ocultar el formulario
        setPuntuacion(0); // Reiniciar puntuación
        setComentario(""); // Reiniciar comentario
      } catch (error) {
        console.error("Error al enviar la reseña:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
        setConfirmationMessage(
          error.response?.data?.message || "Hubo un problema al enviar la reseña."
        );
        setMessageType("error"); // Tipo de mensaje de error
        setFormSubmitted(true); // Ocultar el formulario
      }
    };

  // Efectos
  useEffect(() => {
    fetchRol();
  }, []);

  useEffect(() => {
    if (username) fetchDatos();
  }, [username]);

  const handleSelectDocument = (documento) => {
    setSelectedDocumento((prevSelected) => (prevSelected?.id === documento.id ? null : documento));
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage(""); // Limpiar el mensaje de confirmación
    setFormSubmitted(false); // Reiniciar el estado del formulario
  };

  return (
    <div className="seccion">
      <ChipsOtro username={username} />
      <span className="avatar">
        <img
          src={usuario?.usuario?.avatar || "/default-avatar.png"}
          alt={`${usuario?.nombre || "Usuario"} avatar`}
          className="avatar-imagen"
        />
      </span>
      <p id="nombre">
        {perfilTipo === "inversor" ? usuario?.nombre : usuario?.usuario?.username || "Nombre del usuario"}
      </p>
      <p id="creacion">
        {perfilTipo === "inversor" ? "Invirtiendo en Astrae desde" : "En Astrae desde"}{" "}
        <span className="morado">
          {usuario?.usuario?.fecha_creacion ? new Date(usuario.usuario.fecha_creacion).getFullYear() : "Fecha"}
        </span>
      </p>
  
      {perfilTipo === "inversor" ? (
        <>
          {rol === "startup" && (
            <button className="rankear" onClick={() => setActiveBubble("rankear")}>
              <IconStarFilled id="estrella" />
            </button>
          )}
          {/* Renderizado condicional para perfil inversor */}
          <span className="contenedor-ancho">
            <MiniChipsOtro
              label={<div className="icon-text"><IconMapPinFilled className="icono2" /> {usuario?.usuario?.ciudad && usuario?.usuario?.pais ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}` : "Sin ubicación"}</div>}
              tooltipText="Ubicación"
            />
            <MiniChipsOtro
              label={<div className="icon-text"><IconBriefcaseFilled className="icono2" /> {usuario?.perfil_inversion || "Desconocido"}</div>}
              tooltipText="Perfil de inversión"
            />
            <MiniChipsOtro
              label={<div className="icon-text"><IconBulbFilled className="icono2" /> {sectorFavorito}</div>}
              tooltipText="Sector favorito"
            />
            <MiniChipsOtro
              isStars={true}
              label={<StarRating puntuacionMedia={puntuacionMedia} />}
              tooltipText={`Puntuación Media: ${puntuacionMedia}`}
            />
            <MiniChipsOtro
              label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2" /> Inversiones Exitosas: {inversionesExitosas}</div>}
              tooltipText={null}
            />
            <MiniChipsOtro
              label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2" /> ROI Promedio: {roiPromedio}%</div>}
              tooltipText={null}
            />
          </span>
        </>
      ) : (
        <>
          <button className="rankear" onClick={() => setActiveBubble("documentos")}>
            <IconFileDownloadFilled id="descarga" />
          </button>
          <span className="contenedor-ancho1">
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconMapPinFilled className="icono2" />{" "}
                  {usuario?.usuario?.ciudad && usuario?.usuario?.pais
                    ? `${usuario.usuario.ciudad}, ${usuario.usuario.pais}`
                    : "Sin ubicación"}
                </div>}
                tooltipText="Ubicación" />
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconBulbFilled className="icono2" /> {usuario?.sector || "Desconocido"}
                </div>}
                tooltipText="Sector" />
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconChartPieFilled className="icono2" />{" "}
                  {usuario?.estado_financiacion || "Desconocido"}
                </div>}
                tooltipText="Ronda de Financiación" />
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconUserFilled className="icono2" /> {usuario?.plantilla || "Desconocida"}
                </div>}
                tooltipText="Plantilla" />
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconCurrencyEuro id="icono-pequeño" className="icono2" />{" "}
                  Recaudación Total: {formatInversion(recaudacionTotal ?? "0")}
                </div>}
                tooltipText={null} />
              <MiniChipsOtro
                label={<div className="icon-text">
                  <IconPercentage id="icono-pequeño2" className="icono2" />{" "}
                  Porcentaje Disponible: {usuario?.porcentaje_disponible || "0"}%
                </div>}
                tooltipText={null} />
            </span>
          </>
      )}
  
      <BotonesOtro username={username} />
  
      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage} // Pasar el mensaje de confirmación
        type={messageType} // Pasar el tipo de mensaje (success o error)
      >
        {activeBubble === "rankear" && !formSubmitted && (
          <div>
            <p>Valora al inversor</p>
            <div className="star-rating-container">{stars}</div>
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={handleEnviarResena}>
                Valorar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "documentos" && (
          <div>
            <h4>Documentos subidos</h4>
            {documentos.length === 0 ? (
              <p>No hay documentos disponibles.</p>
            ) : (
              <ul className="lista-documentos">
                {documentos.map((doc) => (
                  <li
                    key={doc.id}
                    className={
                      selectedDocumento?.id === doc.id
                        ? "documento-item selected"
                        : "documento-item"
                    }
                    onClick={() => handleSelectDocument(doc)}
                  >
                    <div className="documento-icono">
                      {renderIconByTipo(doc.tipo)}
                    </div>
                    <div className="documento-lista">
                      <p className="nombre-documento">{doc.nombre}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleDownloadDocument(selectedDocumento);
                }}
                disabled={!selectedDocumento}
                rel="noopener noreferrer"
                className="botn-eventos enviar"
              >
                Descargar
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
};  

export default InfoOtro;