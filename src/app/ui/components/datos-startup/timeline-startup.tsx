'use client';

import { useEffect, useState } from 'react';
import './timeline-startup-style.css';
import customAxios from '@/service/api.mjs';

const STATUS_COLORS = {
  cumplido: '#00d26a',
  fallado:  '#e53935',
  actual:   '#9b59b6'
};

export default function TimelineStartup() {
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHitos() {
      try {
        const response = await customAxios.get(
          `http://localhost:5000/api/data/usuario`,
          { withCredentials: true }
        );
        setHitos(response.data.startup.hitos);
      } catch (err) {
        console.error('Error al cargar los hitos', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHitos();
  }, []);

  function getQuarter(dateStr) {
    const d = new Date(dateStr);
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  }

  function getStatusClass(estado) {
    if (estado === 'cumplido') return 'verde';
    if (estado === 'fallado')  return 'rojo';
    if (estado === 'actual')   return 'morado';
    return '';
  }

  if (loading) {
    return <div className="seccion"><p>Cargando roadmap…</p></div>;
  }
  if (!hitos.length) {
    return <div className="seccion"><p>Esta startup no ha definido aún su roadmap.</p></div>;
  }

  return (
    <div className="seccion" id="timeline">
      <div className="titulo-principal">
        <p className="titulo-contacto">Hitos</p>
      </div>
      <ul className="timeline">
        {hitos.map((hito, idx) => (
          <li key={hito.id} className="timeline-item">
            <span className={`punto ${getStatusClass(hito.estado)}`} />
            {idx < hitos.length - 1 && (
              <span
                className="conector"
                style={{
                  '--current-color': STATUS_COLORS[hito.estado],
                  '--next-color':    STATUS_COLORS[hitos[idx + 1].estado]
                }}
              />
            )}
            <div className="contenido-hito">
              <p className="titulo-hito">{hito.titulo}</p>
              <p className="fecha-hito">{getQuarter(hito.fechaObjetivo)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
