import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import '../grafica-startup/grafica-startup-style.css';

ChartJS.register(CategoryScale, LinearScale, Tooltip, LineElement, PointElement, Filler);

const GraficaInversorPortfolio = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchValorPortfolio = async () => {
    try {
      const response = await customAxios.get('/api/data/historicos', { withCredentials: true });
      const historico = response.data.historico || [];

      const labels = historico.map(item => new Date(item.fecha).toLocaleDateString());
      const values = historico.map(item => Number(item.valoracion));

      setData({
        labels,
        datasets: [
          {
            label: 'Valor del portfolio',
            data: values,
            borderColor: 'rgb(142, 110, 190)',
            backgroundColor: 'rgba(144, 113, 190, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10,
            borderWidth: 2,
          },
        ],
      });
    } catch (err) {
      console.error('Error fetching historics:', err);
      setData({ labels: [], datasets: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValorPortfolio();
  }, []);

  if (isLoading) {
    return <div className="grafica-loading">Cargando evolución…</div>;
  }

  if (data.labels.length === 0) {
    return <div className='apartado3'><div className="grafica-empty">Sin datos para mostrar</div></div>
  }

  return (
    <div className="apartado3">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 800,
            easing: 'easeOutQuart',
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              callbacks: {
                label: ctx =>
                  `${ctx.parsed.y.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}`,
              },
              backgroundColor: 'rgba(20,20,25,0.9)',
              titleFont: { size: 11 },
              bodyFont: { size: 12 },
              padding: 8,
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 9 } },
              grid: { color: 'rgba(220,220,220,0.03)' },
            },
            y: {
              ticks: {
                color: 'rgba(255,255,255,0.6)',
                font: { size: 9 },
                callback: value => `${value / 1000}k`,
              },
              grid: { color: 'rgba(220,220,220,0.03)' },
              beginAtZero: false,
            },
          },
        }}
      />
    </div>
  );
};

export default GraficaInversorPortfolio;
