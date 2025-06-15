'use client';

import { useEffect, useState } from 'react';
import './timeline-startup-style.css';
import customAxios from '@/service/api.mjs';

export default function HitosStartupOtro({ startupId }) {
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHitos() {
      try {
        const res = await customAxios.get(`http://localhost:5000/api/startups/${startupId}/hitos`, {
          withCredentials: true, // Enviar cookies con la solicitud
        });
        const data = res.data;
        setHitos(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar los hitos', err);
        setLoading(false);
      }
    }

    if (startupId) fetchHitos();
  }, [startupId]);

  function getQuarter(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const year = date.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  }

  function getStatusClass(estado) {
    switch (estado) {
      case 'cumplido':
        return 'punto verde';
      case 'fallado':
        return 'punto rojo';
      case 'actual':
        return 'punto morado';
      default:
        return 'punto';
    }
  }

  if (hitos.length === 0) return <p>Esta startup no ha definido aún su roadmap.</p>;

  return (
    <div className='seccion'>
      <div className="timeline-container">
        <h3 className="titulo-roadmap">Roadmap</h3>
        <ul className="timeline">
          {hitos.map((hito) => (
            <li key={hito.id} className="timeline-item">
              <span className={getStatusClass(hito.estado)} />
              <div className="contenido-hito">
                <h4 className="titulo-hito">{hito.titulo}</h4>
                <p className="fecha-hito">{getQuarter(hito.fechaObjetivo)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
