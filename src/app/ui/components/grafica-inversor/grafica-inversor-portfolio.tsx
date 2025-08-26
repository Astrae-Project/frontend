import React, { useEffect, useState } from 'react';
import customAxios from '@/service/api.mjs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
  LineElement,
} from 'chart.js';
import './grafica-inversor-style.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
  LineElement
);

const rangosDisponibles = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
  { label: 'Todo', value: Infinity },
];

const GraficaInversorPortfolio = () => {
  const [fullData, setFullData] = useState<{ labels: string[]; values: number[]; dates: number[] }>({ labels: [], values: [], dates: [] });
  const [chartData, setChartData] = useState<any>(null);
  const [rango, setRango] = useState<number>(Infinity);
  const [loading, setLoading] = useState(true);
  const [lastPoint, setLastPoint] = useState<{ label?: string; value?: number }>({});

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await customAxios.get(
          'https://backend-l3s8.onrender.com/api/data/historicos',
          { withCredentials: true }
        );
        const historico = Array.isArray(response.data.historico)
          ? response.data.historico
          : [];
        if (!historico.length) {
          setFullData({ labels: [], values: [] });
          return;
        }
        const sorted = historico
          .map(r => ({
            fecha: new Date(r.fecha),
            valor: Number(r.valoracion)
          }))
          .sort((a, b) => a.fecha - b.fecha);

        const labels = sorted.map(r =>
          r.fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        );
        const values = sorted.map(r => r.valor);
        const dates = sorted.map(r => r.fecha.getTime());
        setFullData({ labels, values, dates });
      } catch (err) {
        console.error('Error fetching historico:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, []);

  useEffect(() => {
    if (!fullData.labels.length || !fullData.dates.length) {
      setChartData(null);
      return;
    }
    const total = fullData.dates.length;
    const lastTimestamp = fullData.dates[total - 1];
    let startIndex = 0;
    if (rango === Infinity) {
      startIndex = 0;
    } else {
      const msPerDay = 24 * 60 * 60 * 1000;
      const cutoff = lastTimestamp - rango * msPerDay;
      startIndex = fullData.dates.findIndex(ts => ts >= cutoff);
      if (startIndex === -1) {
        // if no point meets the cutoff, show the last available point
        startIndex = total - 1;
      }
    }
    const labels = fullData.labels.slice(startIndex);
    const dataSet = fullData.values.slice(startIndex);
    const lastLabel = labels.length ? labels[labels.length - 1] : undefined;
    const lastValue = dataSet.length ? dataSet[dataSet.length - 1] : undefined;
    setLastPoint({ label: lastLabel, value: lastValue });
    setChartData({
      labels,
      datasets: [
        {
          label: 'Valor del portfolio',
          data: dataSet,
          borderColor: '#8E6EBE',
          backgroundColor: 'rgba(144,113,190,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    });
  }, [fullData, rango]);

  if (loading) {
    return <div className="grafica-empty">Cargando datos del portfolio…</div>;
  }
  if (!chartData) {
    return <div className="grafica-empty">No hay datos históricos para mostrar</div>;
  }

  return (
    <div className="grafica-wrapper">
      <div className="grafica-header">
        <h3 className="grafica-titulo">Evolución de portfolio</h3>
          <div className="selector-rango">
          {rangosDisponibles.map(({ label, value }) => (
            <button
              key={value}
              className={rango === value ? 'activo' : ''}
              onClick={() => setRango(value)}
              aria-label={`Últimos ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#222',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 8,
                cornerRadius: 4,
              },
            },
            scales: {
              x: {
                ticks: { color: '#ccc', maxRotation: 0, minRotation: 0 },
                grid: { color: 'rgba(255,255,255,0.05)' },
              },
              y: {
                ticks: { color: '#ccc' },
                grid: { color: 'rgba(255,255,255,0.05)' },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default GraficaInversorPortfolio;
