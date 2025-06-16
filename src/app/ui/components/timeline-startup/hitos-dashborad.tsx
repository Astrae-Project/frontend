'use client';

import React, { useEffect, useState } from "react";
import Bubble from "../bubble/bubble"; 
import "../calendario1/calendario-style.css";
import "../bento-inicio/bento-inicio-style.css";
import "../eventos/evento-style.css";
import './timeline-startup-style.css';
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconShare3,
} from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

export default function HitosDashboard() {
  const [hitos, setHitos] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHito, setSelectedHito] = useState(null);
  const [editFormData, setEditFormData] = useState({
    titulo: "",
    fechaObjetivo: "",
    descripcion: ""
  });
  const [step, setStep] = useState(1);

  // Carga inicial de hitos
  useEffect(() => {
    async function fetchHitos() {
      try {
        const { data } = await customAxios.get(
          `http://localhost:5000/api/data/usuario`,
          { withCredentials: true }
        );
        setHitos(data.startup.hitos || []);
      } catch (err) {
        console.error("Error al cargar los hitos", err);
        setHitos([]);
      }
    }
    fetchHitos();
  }, []);

  // Utilidades de Q
  const getQuarter = iso => {
    const d = new Date(iso);
    return `Q${Math.floor(d.getMonth()/3)+1} ${d.getFullYear()}`;
  };
  const groupByQ = (arr) => {
    return arr.reduce((acc, h) => {
      const q = getQuarter(h.fechaObjetivo);
      (acc[q] = acc[q]||[]).push(h);
      return acc;
    }, {});
  };
  const calcProgress = group => {
    const tot = group.length,
          done = group.filter(h=>h.estado==="cumplido").length;
    return tot? Math.round(done/tot*100):0;
  };

  // Acciones sobre hito
  const handleSelectHito = h => setSelectedHito(prev=> prev?.id===h.id? null: h);
  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setSelectedHito(null);
    setStep(1);
    setEditFormData({ titulo:"", fechaObjetivo:"", descripcion:"" });
  };
  const handleCrear = async e => {
    e.preventDefault();
    try {
      await customAxios.post(
        `/api/perfil/startups/${hitos[0]?.id_startup}/hitos`,
        editFormData,
        { withCredentials:true }
      );
      setConfirmationMessage("Hito creado");
      setMessageType("success");
      setFormSubmitted(true);
    } catch {
      setConfirmationMessage("Error al crear");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };
  const handleEliminar = async () => {
    if(!selectedHito) return;
    try {
      await customAxios.delete(
        `/api/perfil/hitos/${selectedHito.id}`,
        { withCredentials:true }
      );
      setConfirmationMessage("Hito eliminado");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedHito(null);
    } catch {
      setConfirmationMessage("Error al eliminar");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };
  const prepareEdit = () => {
    setEditFormData({
      titulo: selectedHito.titulo,
      fechaObjetivo: selectedHito.fechaObjetivo.split("T")[0],
      descripcion: selectedHito.descripcion||""
    });
    setStep(2);
  };
  const handleEditar = async e => {
    e.preventDefault();
    try {
      await customAxios.put(
        `/api/perfil/hitos/${selectedHito.id}`,
        editFormData,
        { withCredentials:true }
      );
      setConfirmationMessage("Hito editado");
      setMessageType("success");
      setFormSubmitted(true);
    } catch {
      setConfirmationMessage("Error al editar");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  // Filtrado de búsqueda
  const filtered = searchQuery 
    ? hitos.filter(h=>
        h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.fechaObjetivo.includes(searchQuery)
      )
    : hitos;

  // Agrupar por Q
  const grupos = groupByQ(filtered);

  // Formatea fecha
  const fmt = iso => new Date(iso).toLocaleDateString("es-ES");

  return (
  <div className="seccion" id="hitos-dashboard">
    <div className="titulo-principal">
      <p className="titulo-contacto">Hitos</p>
    </div>

    <div className="hitos-dashboard">
      <div className="contenido-scrollable">
        <div className="listado-quarters">
          {Object.entries(grupos).map(([q, arr]) => (
            <section className="grupo-quarter" key={q}>
              <div className="header-quarter">
                <h2 className="titulo-quarter">{q}</h2>
                <div className="barra-progreso">
                  <div
                    className="relleno"
                    style={{ width: `${calcProgress(arr)}%` }}
                  />
                </div>
              </div>
              <div className="lista-hitos">
                {arr.map(h => (
                  <div
                    key={h.id}
                    className={`hito-card ${
                      selectedHito?.id === h.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectHito(h)}
                  >
                    <div className="info">
                      <h3>{h.titulo}</h3>
                      <span className={`badge ${h.estado}`}>{h.estado}</span>
                      <p>{fmt(h.fechaObjetivo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="contenedor-botones" id="contenedor-botones-hitos">
        <button
          className="apartado botones"
          id="pequeño-arriba"
        >
          <p className="texto-boton">Volver a Actual</p>
        </button>
        
        <button
          className="apartado botones"
          id="pequeño3"
          onClick={() => setActiveBubble("crear")}
        >
          <IconPlus className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño4"
          onClick={() => setActiveBubble("eliminar")}
          disabled={!selectedHito}
        >
          <IconTrash className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño5"
          onClick={() => {
            prepareEdit();
            setActiveBubble("editar");
          }}
          disabled={!selectedHito}
        >
          <IconPencil className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño6"
          onClick={() => setActiveBubble("buscar")}
        >
          <IconSearch className="iconos-calendar" />
        </button>
      </div>

      <Bubble show={!!activeBubble} onClose={closeBubble} message={confirmationMessage} type={messageType}>

        {activeBubble==="crear" && !formSubmitted && (
          <div>
            <p>Crear hito</p>
            <form onSubmit={handleCrear} className="crear-evento-form">
              <input
                name="titulo"
                placeholder="Título"
                className="form-control"
                onChange={e=>setEditFormData({...editFormData,titulo:e.target.value})}
                required
              />
              <input
                type="date"
                name="fechaObjetivo"
                className="form-control date-input"
                onChange={e=>setEditFormData({...editFormData,fechaObjetivo:e.target.value})}
                required
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                className="form-control"
                onChange={e=>setEditFormData({...editFormData,descripcion:e.target.value})}
              />
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button className="botn-eventos enviar" type="submit">Crear</button>
              </div>
            </form>
          </div>
        )}


        {activeBubble === "eliminar" && (
          <div>
            <p>¿Eliminar hito?</p>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cancelar</button>
              <button className="botn-eventos enviar" onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        )}

        {/* Editar */}
        {activeBubble==="editar" && step===2 && !formSubmitted && (
          <div className="edit-form-container">
            <p>Editar hito</p>
            <form onSubmit={handleEditar} className="edit-event-form">
              <input
                name="titulo"
                className="form-control"
                value={editFormData.titulo}
                onChange={e=>setEditFormData({...editFormData,titulo:e.target.value})}
                required
              />
              <input
                type="date"
                name="fechaObjetivo"
                className="form-control date-input"
                value={editFormData.fechaObjetivo}
                onChange={e=>setEditFormData({...editFormData,fechaObjetivo:e.target.value})}
                required
              />
              <textarea
                name="descripcion"
                className="form-control"
                value={editFormData.descripcion}
                onChange={e=>setEditFormData({...editFormData,descripcion:e.target.value})}
              />
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Atrás</button>
                <button className="botn-eventos enviar" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        )}

        {/* Buscar */}
        {activeBubble==="buscar" && !formSubmitted && (
          <div className="contenedor-buscar">
            <p>Buscar hito</p>
            <input
              className="buscador"
              type="text"
              placeholder="Título o fecha"
              value={searchQuery}
              onChange={e=>setSearchQuery(e.target.value)}
            />
            <div className="contenedor-eventos">
              <ul>
                {filtered.length
                  ? filtered.map(h=>(
                      <li
                        key={h.id}
                        className={selectedHito?.id===h.id?'evento-item selected':'evento-item'}
                        onClick={()=>handleSelectHito(h)}
                      >
                        <div className="portfolio-icono"><IconPlus/></div>
                        <div className="evento-detalles1">
                          <p className="evento-creador">{h.titulo}</p>
                          <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
                      </li>
                    ))
                  : <p>No hay resultados</p>}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble} disabled={!selectedHito}>Seleccionar</button>
            </div>
          </div>
        )}

        {/* Compartir */}
        {activeBubble==="compartir" && (
          <div>
            <p>Compartir hito</p>
            <div className="contenedor-eventos">
              <ul>
                {hitos.map(h=>(
                  <li
                    key={h.id}
                    className={`evento-item ${selectedHito?.id===h.id?'selected':''}`}
                    onClick={()=>handleSelectHito(h)}
                  >
                    <div className="portfolio-icono"><IconPlus/></div>
                    <div className="evento-detalles1">
                      <p className="evento-creador">{h.titulo}</p>
                      <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble} disabled={!selectedHito}>Enviar</button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
    </div>
  );
}
