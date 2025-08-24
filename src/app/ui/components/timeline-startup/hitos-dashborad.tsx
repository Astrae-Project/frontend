'use client';

import React, { useEffect, useRef, useState } from "react";
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
    estado: "",
  });
  const [step, setStep] = useState(1);
  const [startupId, setStartupId] = useState(null);
  const quarterRefs = useRef({});

  // Carga inicial de hitos
  useEffect(() => {
    async function fetchHitos() {
      try {
        const { data } = await customAxios.get(
          `http://localhost:5000/api/data/usuario`,
          { withCredentials: true }
        );
        setHitos(data.startup.hitos || []);
        setStartupId(data.startup.id);
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

  const confirmarSeleccion = () => {
    if (selectedHito) setFormSubmitted(true);
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setSelectedHito(null);
    setStep(1);
    setEditFormData({ titulo:"", fechaObjetivo:"", estado:"" });
  };
  
const handleCrear = async e => {
  e.preventDefault();
  try {
    const response = await customAxios.post(
      `http://localhost:5000/api/perfil/startups/${startupId}/hitos`,
      editFormData,
      { withCredentials: true }
    );
    setConfirmationMessage("Hito creado");
    setMessageType("success");
    setFormSubmitted(true);
  } catch (error) {
    console.error("Error al crear hito:", error);
    setConfirmationMessage("Error al crear");
    setMessageType("error");
    setFormSubmitted(true);
  }
};

const handleEliminar = async () => {
  if (!selectedHito) {
    console.warn("No hay hito seleccionado para eliminar.");
    return;
  }
  try {
    const response = await customAxios.delete(
      `http://localhost:5000/api/perfil/hitos/${selectedHito.id}`,
      { withCredentials: true }
    );
    setConfirmationMessage("Hito eliminado");
    setMessageType("success");
    setFormSubmitted(true);
    setSelectedHito(null);
  } catch (error) {
    console.error("Error al eliminar hito:", error);
    setConfirmationMessage("Error al eliminar");
    setMessageType("error");
    setFormSubmitted(true);
  }
};

const prepareEdit = () => {
  if (!selectedHito) {
    console.warn("No hay hito seleccionado para editar.");
    return;
  }
  setEditFormData({
    titulo: selectedHito.titulo,
    fechaObjetivo: selectedHito.fechaObjetivo.split("T")[0],
    estado: selectedHito.estado || ""
  });
  setStep(2);
};

const handleEditar = async e => {
  e.preventDefault();
  try {
    const response = await customAxios.put(
      `http://localhost:5000/api/perfil/hitos/${selectedHito.id}`,
      editFormData,
      { withCredentials: true }
    );
    setConfirmationMessage("Hito editado");
    setMessageType("success");
    setFormSubmitted(true);
  } catch (error) {
    console.error("Error al editar hito:", error);
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

  const getCurrentQuarterKey = () => {
    const now = new Date();
    return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
  };

  useEffect(() => {
    if (!hitos.length) return;

    const currentQ = getCurrentQuarterKey();

    // Si existe exactamente ese quarter
    if (quarterRefs.current[currentQ]) {
      quarterRefs.current[currentQ].scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Si no, encuentra el más próximo (por fecha)
      const fechas = hitos.map(h => new Date(h.fechaObjetivo));
      const now = new Date();
      const difs = fechas.map(d => Math.abs(d - now));
      const idx = difs.indexOf(Math.min(...difs));
      const closestHito = hitos[idx];
      const qKey = getQuarter(closestHito.fechaObjetivo);
      if (quarterRefs.current[qKey]) {
        quarterRefs.current[qKey].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hitos]);


  return (
    <div className="seccion" id="hitos-dashboard">
      <div className="titulo-principal">
        <p className="titulo-contacto">Hitos</p>
      </div>

      <div className="hitos-dashboard">
        <div className="contenido-scrollable">
          <div className="listado-quarters">
            {Object.entries(grupos).map(([q, arr]) => (
              <section className="grupo-quarter" key={q} ref={el => { quarterRefs.current[q] = el; }}>
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
                      className={`hito-card`}
                    >
                      <div className="info">
                        <h3>{h.titulo}</h3>
                        <div className="info-footer">
                          <span className={`badge ${h.estado}`}>{h.estado}</span>
                          <p className="info-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
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
          id="pequeño3"
          onClick={() => setActiveBubble("crear")}
        >
          <IconPlus className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño4"
          onClick={() => setActiveBubble("eliminar")}
        >
          <IconTrash className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño5"
          onClick={() => {
            setActiveBubble("editar");
          }}
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

        {activeBubble === "crear" && !formSubmitted && (
          <div>
            <p>Crear hito</p>
            <form onSubmit={handleCrear} className="crear-evento-form">
              <input
                name="titulo"
                placeholder="Título"
                className="form-control titulo-input"
                onChange={e => setEditFormData({ ...editFormData, titulo: e.target.value })}
                required
              />

              <select
                name="estado"
                className="form-control select-custom"
                value={editFormData.estado || ""}
                onChange={e => setEditFormData({ ...editFormData, estado: e.target.value })}
                required
              >
                <option value="" disabled className="option-placeholder">Selecciona estado</option>
                <option value="actual" className="option-custom">Actual</option>
                <option value="cumplido" className="option-custom">Cumplido</option>
                <option value="fallido" className="option-custom">Fallido</option>
                <option value="futuro" className="option-custom">Futuro</option>
              </select>

              <input
                type="date"
                name="fechaObjetivo"
                className="form-control date-input"
                onChange={e => setEditFormData({ ...editFormData, fechaObjetivo: e.target.value })}
                required
              />

              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button className="botn-eventos enviar" type="submit">Crear</button>
              </div>
            </form>
          </div>
        )}

        {activeBubble === "eliminar" && (
          <div className="contenedor-buscar">
            <p>Eliminar hito</p>
            <input
              className="buscador"
              type="text"
              placeholder="Título o fecha"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="contenedor-eventos">
              <ul>
                {hitos.filter(h =>
                  h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      fmt(h.fechaObjetivo).includes(searchQuery)
                    )
                    .map(h => (
                      <li
                        key={h.id}
                        className={`evento-item ${selectedHito?.id === h.id ? 'selected' : ''}`}
                        onClick={() => handleSelectHito(h)}
                      >
                        <div className="portfolio-icono"><IconPlus /></div>
                        <div className="evento-detalles1">
                          <p className="evento-titulo">{h.titulo}</p>
                          <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
                      </li>
                    ))
                ) : <p>No hay resultados</p>}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={handleEliminar} disabled={!selectedHito}>Eliminar</button>
            </div>
          </div>
        )}

        {activeBubble === "editar" && step === 1 && (
          <div className="contenedor-buscar">
            <p>Editar hito</p>
            <input
              className="buscador"
              type="text"
              placeholder="Título o fecha"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="contenedor-eventos">
              <ul>
                {hitos.filter(h =>
                  h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      fmt(h.fechaObjetivo).includes(searchQuery)
                    )
                    .map(h => (
                      <li 
                        key={h.id}
                        className={`evento-item ${selectedHito?.id === h.id ? 'selected' : ''}`}
                        onClick={() => handleSelectHito(h)} 
                      >
                        <div className="portfolio-icono"><IconPlus /></div>
                        <div className="evento-detalles1">
                          <p className="evento-titulo">{h.titulo}</p>
                          <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
                      </li>
                    ))
                ) : <p>No hay resultados</p>}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={() => { setStep(2); prepareEdit(); }} disabled={!selectedHito}>Editar</button>
            </div>
          </div>
        )}


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
              <select
                name="estado"
                className="form-control select-custom"
                value={editFormData.estado || ""}
                onChange={e => setEditFormData({ ...editFormData, estado: e.target.value })}
                required
              >
                <option value="" disabled className="option-placeholder">Selecciona estado</option>
                <option value="actual" className="option-custom">Actual</option>
                <option value="cumplido" className="option-custom">Cumplido</option>
                <option value="fallido" className="option-custom">Fallido</option>
                <option value="futuro" className="option-custom">Futuro</option>
              </select>
              <input
                type="date"
                name="fechaObjetivo"
                className="form-control date-input"
                value={editFormData.fechaObjetivo}
                onChange={e=>setEditFormData({...editFormData,fechaObjetivo:e.target.value})}
                required
              />
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Atrás</button>
                <button className="botn-eventos enviar" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        )}

        {/* Buscar */}
        {activeBubble==="buscar" && !formSubmitted &&(
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
                          <p className="evento-titulo">{h.titulo}</p>
                          <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
                      </li>
                    ))
                  : <p>No hay resultados</p>}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button
                className="botn-eventos enviar"
                onClick={confirmarSeleccion}
                disabled={!selectedHito}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {activeBubble === 'buscar' && formSubmitted && selectedHito && (
          <div className="hito-tarjeta">
            <div className="hito-header">
              <h3>Hito</h3>
            </div>
            <div className="hito-body">
              <div className="hito-dato">
                <span className="dato-label">Título</span>
                <span className="dato-valor">{selectedHito.titulo}</span>
              </div>

              <div className="hito-dato">
                <span className="dato-label">Estado</span>
                <span className="dato-valor">{selectedHito.estado}</span>
              </div>

              <div className="hito-dato">
                <span className="dato-label">Fecha Objetivo</span>
                <span className="dato-valor">{new Date(selectedHito.fechaObjetivo).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="hito-footer">
              <button className="botn-eventos" onClick={() => setFormSubmitted(false)}>
                Volver
              </button>
            </div>
          </div>
        )}


        {/* Compartir */}
        {activeBubble === "compartir" && (
          <div className="contenedor-buscar">
            <p>Compartir hito</p>
            <input
              className="buscador"
              type="text"
              placeholder="Título o fecha"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="contenedor-eventos">
              <ul>
                {hitos.filter(h =>
                  h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      h.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      fmt(h.fechaObjetivo).includes(searchQuery)
                    )
                    .map(h => (
                      <li
                        key={h.id}
                        className={`evento-item ${selectedHito?.id === h.id ? 'selected' : ''}`}
                        onClick={() => handleSelectHito(h)}
                      >
                        <div className="portfolio-icono"><IconPlus /></div>
                        <div className="evento-detalles1">
                          <p className="evento-titulo">{h.titulo}</p>
                          <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                        </div>
                      </li>
                    ))
                ) : <p>No hay resultados</p>}
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
