'use client';

import { useEffect, useState, useRef } from 'react';
import './timeline-startup-style.css';
import customAxios from '@/service/api.mjs';

const STATUS_COLORS = {
  cumplido: '#00d26a',
  fallado: '#e53935',
  actual: '#9b59b6',
};

export default function TimelineStartup() {
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    async function fetchHitos() {
      try {
        const { data } = await customAxios.get(
          'https://api.astraesystem.com/api/data/usuario',
          { withCredentials: true }
        );
        setHitos(data.startup.hitos);
      } catch (err) {
        console.error('Error al cargar los hitos', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHitos();
  }, []);

  useEffect(() => {
    if (!loading && timelineRef.current) {
      const container = timelineRef.current;
      const actualEl = container.querySelector('.punto.morado');
      if (actualEl instanceof HTMLElement) {
        const containerRect = container.getBoundingClientRect();
        const actualRect = actualEl.getBoundingClientRect();
        const scrollTop =
          container.scrollTop +
          (actualRect.top - containerRect.top) -
          container.clientHeight * 0.2;
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [loading, hitos]);

  function getQuarter(dateStr: string) {
    const d = new Date(dateStr);
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  }

  function getStatusClass(estado: string) {
    if (estado === 'cumplido') return 'verde';
    if (estado === 'fallado') return 'rojo';
    if (estado === 'actual') return 'morado';
    return '';
  }

  if (loading) {
    return (
      <div className="seccion">
        <p>Cargando roadmap…</p>
      </div>
    );
  }

  if (!hitos.length) {
    return (
      <div className="seccion">
        <p>No hay roadmap</p>
      </div>
    );
  }

  return (
    <div className="seccion" id="timeline">
      <div className="titulo-principal">
        <p className="titulo-contacto">Hitos</p>
      </div>
      <div className="contenido-scrollable">
        <ul className="timeline" ref={timelineRef}>
          {hitos.map((hito, idx) => {
            const esApagado = hito.estado !== 'actual';
            return (
              <li
                key={hito.id}
                className={`timeline-item ${esApagado ? 'apagado' : ''}`}
              >
                <span className={`punto ${getStatusClass(hito.estado)}`} />
                {idx < hitos.length - 1 && (
                  <span
                    className="conector"
                    style={{
                      '--current-color': STATUS_COLORS[hito.estado] || 'gray',
                      '--next-color': STATUS_COLORS[hitos[idx + 1].estado] || 'gray',
                    } as React.CSSProperties}
                  />
                )}
                <div className="contenido-hito">
                  <p className="titulo-hito">{hito.titulo}</p>
                  <p className="fecha-hito">{getQuarter(hito.fechaObjetivo)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
