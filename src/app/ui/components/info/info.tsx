'use client';

import React, { useState, useEffect } from "react";
import { IconBriefcaseFilled, IconBulbFilled, IconChartPieFilled, IconCurrencyEuro, IconFileDownloadFilled, IconMapPinFilled, IconMedal, IconPercentage, IconUserFilled} from "@tabler/icons-react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { Botones } from "../../../perfil/boton/boton-demo";
import { Chips } from "../../../perfil/chip/chip-demo";
import StarRating from "../../../perfil/estrellas/estrellas";
import { MiniChips } from "../../../perfil/mini-chips/mini-chips";
import { useRef } from "react";

// Asumiendo que customAxios está configurado adecuadamente en otro archivo
import customAxios from "@/service/api.mjs"; 
import Bubble from "../bubble/bubble";

const Info = () => {
  const [user, setUser] = useState(null);
  const [perfilTipo, setPerfilTipo] = useState(""); // Nuevo estado para almacenar el tipo de perfil
  const [sectorFavorito, setSectorFavorito] = useState("Desconocido");
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [inversionesExitosas, setInversionesExitosas] = useState(0);
  const [roiPromedio, setRoiPromedio] = useState(0);
  const [puntuacionMedia, setPuntuacionMedia] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success o error
  const [tipo, setTipo] = useState(""); // Estado para el tipo de documento
  const [archivo, setArchivo] = useState(null); // Estado para el archivo seleccionado
  const fileInputRef = useRef(null); // Referencia para el input de archivo
  
  const handleSubirDocumento = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert("Debes seleccionar un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id_usuario", user.id); // Usa el ID del usuario autenticado

    // Detectar tipo por extensión del archivo
    const extension = archivo.name.split('.').pop().toLowerCase();

    let tipoDetectado = "";
    if (extension === "pdf") tipoDetectado = "pdf";
    else if (["doc", "docx"].includes(extension)) tipoDetectado = "word";
    else if (["jpg", "jpeg", "png", "webp"].includes(extension)) tipoDetectado = "imagen";
    else tipoDetectado = "otro";

    formData.append("tipo", tipoDetectado);

    try {
      const res = await customAxios.post(`http://localhost:5000/api/perfil/documento/${startup.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      alert("Documento subido correctamente");
      closeBubble();
      // Puedes actualizar aquí el estado con la nueva lista si lo necesitas
    } catch (err) {
      console.error("Error al subir:", err);
      const mensaje = err.response?.data?.message || "Error al subir documento";
      alert(mensaje);
    }
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage(""); // Limpiar el mensaje de confirmación al cerrar
    setMessageType("success"); // Resetear el tipo de mensaje al cerrar
  }

  const fetchDatos = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, {
        withCredentials: true, // Asegúrate de que la configuración se mantenga
      });
      
      // Verifica la respuesta
      if (!response || !response.data) {
        throw new Error("No data received from the API");
      }

      const data = response.data;

      setUser(data.inversor || data.startup); // Establecer el usuario con la respuesta
      setPerfilTipo(data.inversor ? "inversor" : "startup"); // Determinar el tipo de perfil
      setSectorFavorito(data.sectorFavorito || "Desconocido");
      setInversionesRealizadas(data.inversor ? data.inversionesRealizadas : data.startup.inversiones.length);
      setRoiPromedio(data.roiPromedio || 0);
      setPuntuacionMedia(data.puntuacionMedia || 0);
      setRecaudacionTotal(data.recaudacionTotal || 0);

      if (data.inversor) {
        const exitosas = data.inversor.inversiones.filter(inv => inv.esExitosa).length;
        setInversionesExitosas(exitosas);
      } else if (data.startup) {
        setInversionesExitosas(data.startup.inversiones.filter(inv => inv.monto_invertido > 0).length);
      }
    } catch (error) {
      console.error("Error fetching usuario data:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []); // Solo se ejecuta una vez al montar el componente

  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A';
    }
  
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M€`; // Para millones
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K€`; // Para miles
    } else {
      return `${monto}€`; // Para cantidades menores a mil
    }
  };


  return (
    <div className="seccion">
      <Chips />
      <span className="avatar">
        <img
          src={user?.usuario?.avatar || "/default-avatar.png"} // Asegurarse de que haya una imagen por defecto
          alt={`${user?.nombre} avatar`}
          className="avatar-imagen"
        />
      </span>
      <p id="nombre">{perfilTipo === "inversor" ? user?.nombre : user?.usuario?.username || "Nombre del usuario"}</p>
      <p id="creacion">
        {perfilTipo === "inversor" ? "Invirtiendo en Astrae desde" : "En Astrae desde"}{" "}
        <span className="morado">{user?.usuario?.fecha_creacion ? new Date(user.usuario.fecha_creacion).getFullYear() : "Fecha"}</span>
      </p>

      {/* Renderizado condicional para perfil inversor */}
      {perfilTipo === "inversor" ? (
        <>
          <span className="contenedor-ancho">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{user?.usuario?.ciudad && user?.usuario?.pais ? `${user.usuario.ciudad}, ${user.usuario.pais}` : "Sin ubicación"}</div>} tooltipText="Ubicación" />
            <MiniChips label={<div className="icon-text"><IconBriefcaseFilled className="icono2"/> {user?.perfil_inversion || "Desconocido"} </div>} tooltipText="Perfil de inversión" />
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {sectorFavorito}</div>} tooltipText="Sector favorito"/>
            <MiniChips label={<StarRating puntuacionMedia={puntuacionMedia} />} tooltipText={`${puntuacionMedia}`} />
            <MiniChips label={<div className="icon-text"><IconMedal id="icono-pequeño" className="icono2"/> Inversiones Exitosas: {inversionesExitosas}</div>} tooltipText={null}/>
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> ROI Promedio: {roiPromedio}%</div>} tooltipText={null}/>
          </span>
        </>
      ) : (
        <>
          <button className="rankear" onClick={() => setActiveBubble("subir-documento")}>
            <IconFileDownloadFilled id="descarga" />
          </button>
          <span className="contenedor-ancho1">
            <MiniChips label={<div className="icon-text"><IconMapPinFilled className="icono2"/>{user?.usuario?.ciudad && user?.usuario?.pais ? `${user.usuario.ciudad}, ${user.usuario.pais}` : "Sin ubicación"}</div>} tooltipText="Ubicación"/>
            <MiniChips label={<div className="icon-text"><IconBulbFilled className="icono2"/> {user?.sector || "Desconocido"}</div>} tooltipText="Sector"/>
            <MiniChips label={<div className="icon-text"><IconChartPieFilled className="icono2"/> {user?.estado_financiacion || "Desconocido"}</div>} tooltipText="Ronda de Financiación"/>
            <MiniChips label={<div className="icon-text"><IconUserFilled  className="icono2"/> {user?.plantilla || "Desconocida"}</div>} tooltipText="Plantilla"/>
            <MiniChips label={<div className="icon-text"><IconCurrencyEuro id="icono-pequeño" className="icono2"/> Recaudación Total: {formatInversion(recaudacionTotal ?? "0")} </div>} tooltipText={null}/>
            <MiniChips label={<div className="icon-text"><IconPercentage id="icono-pequeño2" className="icono2"/> Porcentaje Disponible: {user?.porcentaje_disponible || "0"}%</div>} tooltipText={null}/>
          </span>
        </>
      )}

      <Botones />

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage} // Pasar el mensaje de confirmación
        type={messageType} // Pasar el tipo de mensaje (success o error)
      >
        {activeBubble === "subir-documento" && (
          <div className="document-upload-container">
            <h4>Subir nuevo documento</h4>

            <form onSubmit={handleSubirDocumento}>
              <div
                className="dropzone"
                onClick={() => fileInputRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setArchivo(e.dataTransfer.files[0]);
                  }
                }}
              >
                {archivo
                  ? <span className="dropzone-filename">{archivo.name}</span>
                  : <span className="dropzone-text">Haz click o arrastra el archivo aquí</span>
                }
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="dropzone-input"
                  onChange={e => setArchivo(e.target.files[0])}
                />
              </div>

              <div className="contendor-botn-evento">
                <button type="button" className="botn-eventos" onClick={closeBubble}>
                  Cancelar
                </button>
                <button type="submit" className="botn-eventos enviar">
                  Subir
                </button>
              </div>
            </form>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default Info; 
