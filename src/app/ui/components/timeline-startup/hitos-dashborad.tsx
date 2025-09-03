'use client';

import React, { JSX, useEffect, useRef, useState, useMemo } from "react";
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
} from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

interface Hito {
  id: string;
  titulo: string;
  fechaObjetivo: string; // ISO string esperado
  estado: "actual" | "cumplido" | "fallido" | "futuro" | string;
}

type Grupos = Record<string, Hito[]>;

export default function HitosDashboard(): JSX.Element {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHito, setSelectedHito] = useState<Hito | null>(null);
  const [editFormData, setEditFormData] = useState({
    titulo: "",
    fechaObjetivo: "",
    estado: "",
  });
  const [step, setStep] = useState(1);
  const [startupId, setStartupId] = useState<string | null>(null);
  const quarterRefs = useRef<Record<string, HTMLElement | null>>({});

  // --- Fetch inicial de hitos / startup id
  useEffect(() => {
    async function fetchHitos() {
      try {
        const { data } = await customAxios.get(
          `https://backend-l3s8.onrender.com/api/data/usuario`,
          { withCredentials: true }
        );
        const startup = data?.startup;
        setHitos(Array.isArray(startup?.hitos) ? startup.hitos as Hito[] : []);
        setStartupId(startup?.id ?? null);
      } catch (err) {
        console.error("Error al cargar los hitos", err);
        setHitos([]);
        setStartupId(null);
      }
    }
    fetchHitos();
  }, []);

  // --- Utilidades
  const getQuarter = (isoOrDate: string | Date): string => {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  };

  const getQuarterStartDate = (quarterKey: string): Date => {
    // quarterKey = "Q1 2025"
    const [qPart, yearPart] = quarterKey.split(" ");
    const qNum = parseInt(qPart.replace("Q", ""), 10);
    const year = parseInt(yearPart, 10);
    const month = (qNum - 1) * 3;
    return new Date(year, month, 1);
  };

  const addQuarters = (date: Date, n: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n * 3);
    return d;
  };

  const generateQuarterKeysBetween = (start: Date, end: Date): string[] => {
    const keys: string[] = [];
    let cur = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
    const last = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
    while (cur <= last) {
      keys.push(getQuarter(cur));
      cur = addQuarters(cur, 1);
    }
    return keys;
  };

  const getCurrentQuarterKey = (): string => {
    const now = new Date();
    return getQuarter(now);
  };

  const groupByQ = (arr: Hito[]): Grupos => {
    return arr.reduce((acc: Grupos, h: Hito) => {
      const q = getQuarter(h.fechaObjetivo);
      if (!acc[q]) acc[q] = [];
      acc[q].push(h);
      return acc;
    }, {});
  };

  const calcProgress = (group: Hito[]): number => {
    const tot = group.length;
    if (!tot) return 0;
    const done = group.filter(h => h.estado === "cumplido").length;
    return Math.round((done / tot) * 100);
  };

  // --- Acciones sobre hito (sin cambios)
  const handleSelectHito = (h: Hito) => setSelectedHito(prev => (prev?.id === h.id ? null : h));
  const confirmarSeleccion = () => { if (selectedHito) setFormSubmitted(true); };
  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setSelectedHito(null);
    setStep(1);
    setEditFormData({ titulo: "", fechaObjetivo: "", estado: "" });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) {
      console.warn("No startupId disponible.");
      setConfirmationMessage("No se puede crear: falta startupId");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }
    try {
      await customAxios.post(
        `https://backend-l3s8.onrender.com/api/perfil/startups/${startupId}/hitos`,
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
      await customAxios.delete(
        `https://backend-l3s8.onrender.com/api/perfil/hitos/${selectedHito.id}`,
        { withCredentials: true }
      );
      setConfirmationMessage("Hito eliminado");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedHito(null);
      setHitos(prev => prev.filter(h => h.id !== selectedHito.id));
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
      fechaObjetivo: selectedHito.fechaObjetivo.split("T")[0] ?? selectedHito.fechaObjetivo,
      estado: selectedHito.estado || ""
    });
    setStep(2);
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHito) return;
    try {
      await customAxios.put(
        `https://backend-l3s8.onrender.com/api/perfil/hitos/${selectedHito.id}`,
        editFormData,
        { withCredentials: true }
      );
      setConfirmationMessage("Hito editado");
      setMessageType("success");
      setFormSubmitted(true);
      setHitos(prev => prev.map(h => (h.id === selectedHito.id ? { ...h, ...editFormData } as Hito : h)));
    } catch (error) {
      console.error("Error al editar hito:", error);
      setConfirmationMessage("Error al editar");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  // --- Filtrado y agrupación
  const filtered: Hito[] = useMemo(() => (
    searchQuery
      ? hitos.filter(h =>
        (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.fechaObjetivo ?? "").includes(searchQuery)
      )
      : hitos
  ), [hitos, searchQuery]);

  const grupos = useMemo(() => groupByQ(filtered), [filtered]);

  // --- Asegurar que haya keys (quarters) aunque no haya hitos
  const orderedQuarterKeys = useMemo(() => {
    const now = new Date();
    const currentQ = getCurrentQuarterKey();

    if (filtered.length === 0) {
      // Si no hay hitos: mostrar current + siguientes 2 quarters (puedes cambiar 2 por más)
      const fallbackStart = getQuarterStartDate(currentQ);
      const fallbackEnd = addQuarters(fallbackStart, 2);
      return generateQuarterKeysBetween(fallbackStart, fallbackEnd);
    }

    // Si hay hitos: calcula min y max fecha y añade margen futuro (1 quarter)
    const fechas = filtered.map(h => new Date(h.fechaObjetivo));
    const minDate = new Date(Math.min(...fechas.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...fechas.map(d => d.getTime())));
    // garantizar inclusión del quarter actual y añadir 1 quarter futuro
    const start = minDate < now ? minDate : now;
    const end = addQuarters(maxDate > now ? maxDate : now, 1);
    return generateQuarterKeysBetween(start, end);
  }, [filtered]);

  const gruposCompleto: Grupos = useMemo(() => {
    const out: Grupos = {};
    for (const q of orderedQuarterKeys) {
      out[q] = grupos[q] ? grupos[q].slice().sort((a, b) => +new Date(a.fechaObjetivo) - +new Date(b.fechaObjetivo)) : [];
    }
    return out;
  }, [grupos, orderedQuarterKeys]);

  // --- Formato de fecha
  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES");
    } catch {
      return iso;
    }
  };

  // --- Auto-scroll al quarter actual (o al más cercano)
  useEffect(() => {
    // siempre intentamos scrollear al quarter actual si existe
    const currentQ = getCurrentQuarterKey();
    if (quarterRefs.current[currentQ]) {
      quarterRefs.current[currentQ]?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // sino, intenta con el primer quarter renderizado
    const firstKey = orderedQuarterKeys[0];
    if (firstKey && quarterRefs.current[firstKey]) {
      quarterRefs.current[firstKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedQuarterKeys]);

  return (
    <div className="seccion" id="hitos-dashboard">
      <div className="titulo-principal">
        <p className="titulo-contacto">Hitos</p>
      </div>

      <div className="hitos-dashboard">
        <div className="contenido-scrollable">
          <div className="listado-quarters">
            {Object.entries(gruposCompleto).map(([q, arr]) => (
              <section
                className="grupo-quarter"
                key={q}
                ref={el => { quarterRefs.current[q] = el; }}
              >
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
                  {arr.length > 0 ? (
                    arr.map(h => (
                      <div key={h.id} className={`hito-card`}>
                        <div className="info">
                          <h3>{h.titulo}</h3>
                          <div className="info-footer">
                            <span className={`badge ${h.estado}`}>{h.estado}</span>
                            <p className="info-fecha">{fmt(h.fechaObjetivo)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="hito-card placeholder">
                      <div className="info">
                        <h3 className="placeholder-title">Sin hitos</h3>
                        <div className="info-footer">
                          <span className="badge placeholder-badge">—</span>
                          <p className="info-fecha">Añade un hito para este quarter</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
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
        {/* Crear */}
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
                <button className="botn-eventos" onClick={closeBubble} type="button">Cerrar</button>
                <button className="botn-eventos enviar" type="submit">Crear</button>
              </div>
            </form>
          </div>
        )}

        {/* Eliminar */}
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
                  (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <button className="botn-eventos" onClick={closeBubble} type="button">Cerrar</button>
              <button className="botn-eventos enviar" onClick={handleEliminar} disabled={!selectedHito} type="button">Eliminar</button>
            </div>
          </div>
        )}

        {/* Editar paso 1 */}
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
                  (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <button className="botn-eventos" onClick={closeBubble} type="button">Cerrar</button>
              <button className="botn-eventos enviar" onClick={() => { setStep(2); prepareEdit(); }} disabled={!selectedHito} type="button">Editar</button>
            </div>
          </div>
        )}

        {/* Editar paso 2 */}
        {activeBubble === "editar" && step === 2 && !formSubmitted && (
          <div className="edit-form-container">
            <p>Editar hito</p>
            <form onSubmit={handleEditar} className="edit-event-form">
              <input
                name="titulo"
                className="form-control"
                value={editFormData.titulo}
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
                value={editFormData.fechaObjetivo}
                onChange={e => setEditFormData({ ...editFormData, fechaObjetivo: e.target.value })}
                required
              />
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble} type="button">Atrás</button>
                <button className="botn-eventos enviar" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        )}

        {/* Buscar */}
        {activeBubble === "buscar" && !formSubmitted && (
          <div className="contenedor-buscar">
            <p>Buscar hito</p>
            <input
              className="buscador"
              type="text"
              placeholder="Título o fecha"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="contenedor-eventos">
              <ul>
                {filtered.length ? filtered.map(h => (
                  <li
                    key={h.id}
                    className={selectedHito?.id === h.id ? 'evento-item selected' : 'evento-item'}
                    onClick={() => handleSelectHito(h)}
                  >
                    <div className="portfolio-icono"><IconPlus /></div>
                    <div className="evento-detalles1">
                      <p className="evento-titulo">{h.titulo}</p>
                      <p className="evento-fecha">{fmt(h.fechaObjetivo)}</p>
                    </div>
                  </li>
                )) : <p>No hay resultados</p>}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble} type="button">Cerrar</button>
              <button
                className="botn-eventos enviar"
                onClick={confirmarSeleccion}
                disabled={!selectedHito}
                type="button"
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {/* Detalle seleccionado (después de seleccionar en buscar) */}
        {activeBubble === 'buscar' && formSubmitted && selectedHito && (
          <div className="hito-tarjeta">
            <div className="hito-header"><h3>Hito</h3></div>
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
              <button className="botn-eventos" onClick={() => setFormSubmitted(false)} type="button">Volver</button>
            </div>
          </div>
        )}

        {/* Compartir (similar a eliminar/buscar) */}
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
                  (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fmt(h.fechaObjetivo).includes(searchQuery)
                ).length ? (
                  hitos
                    .filter(h =>
                      (h.titulo ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <button className="botn-eventos" onClick={closeBubble} type="button">Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble} disabled={!selectedHito} type="button">Enviar</button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}