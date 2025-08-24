import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import '../grafica-startup/grafica-startup-style.css';
import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import MovimientosRecientesSinEventos from '../movimientos-recientes/movimientos-recientes-sin-eventos';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaInversor = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Valor del portfolio',
        data: [],
        borderColor: 'rgb(142, 110, 190)',
        backgroundColor: 'rgba(110, 75, 163, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0); // Inicializar como 0
  const [percentageChange, setPercentageChange] = useState(0); // Inicializar como 0
  
  const fetchValorPortfolio = async () => {
    try {
      const response = await customAxios.get('http://localhost:5000/api/data/historicos', {
        withCredentials: true,
      });
  
      if (response.data && Array.isArray(response.data.historico)) {
        // Hacer una copia y ordenar por fecha (ascendente) para asegurar orden cronológico
        const historico = [...response.data.historico];
        const sortedHistorico = historico.sort((a, b) => {
          const ta = new Date(a.fecha).getTime() || 0;
          const tb = new Date(b.fecha).getTime() || 0;
          return ta - tb;
        });

        const labels = sortedHistorico.map((item) => {
          try {
            return new Date(item.fecha).toLocaleDateString('es-ES');
          } catch (e) {
            return String(item.fecha);
          }
        });

        const dataValues = sortedHistorico.map((item) => Number(item.valoracion) || 0); // Convertir a número

        const latestValue = dataValues[dataValues.length - 1] || 0; // Último (más reciente)
        const previousValue = dataValues[dataValues.length - 2] || 0; // Penúltimo
        const change = previousValue ? ((latestValue - previousValue) / previousValue) * 100 : 0;

        setTotalPortfolioValue(latestValue); // Actualizar con número válido
        setPercentageChange(Number(change.toFixed(2))); // Redondear a 2 decimales
        setData({
          labels,
          datasets: [
            {
              label: 'Valor del portfolio',
              data: dataValues,
              borderColor: 'rgb(142, 110, 190)',
              backgroundColor: 'rgba(144, 113, 190, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } else {
        console.error('Datos no válidos en la respuesta de la API', response.data.historico);
      }
    } catch (error) {
      console.error('Error fetching historics:', error);
    }
  };
  

  useEffect(() => {
    fetchValorPortfolio();
  }, []);

  return (
    <div className="seccion" id="grafica-startup">
      <div className="titulo-principal">
        <p className="titulo-contacto">Gráfica</p>
      </div>
      {/* Valor total de la startup */}
      <div className="valor-portfolio">
        <h2 className='titulo-valor'>
          Valor Total: 
        </h2>
        <span
        style={{
          fontSize: '13px', // Tamaño de fuente
          alignSelf: 'center', // Alinear al centro
          position: 'relative', // Posición relativa
          top: '1.5px', // Mover hacia abajo
        }
        }>
          {totalPortfolioValue.toLocaleString('es-ES')}€ 
        </span>
        <p className='cambio-valor'
        style={{
          display: 'flex', // Mostrar en línea
          alignItems: 'end', // Alinear verticalmente
        }}>
          <span
            style={{
              color:
                percentageChange === 0
                  ? "rgba(255, 255, 255, 0.6)" // Color gris si el cambio es 0
                  : percentageChange > 0
                  ? "rgb(67, 222, 67)" // Color verde si el cambio es positivo
                    // Icono de flecha hacia arriba
                  : "rgba(222, 67, 67)", // Color rojo si el cambio es negativo
              fontWeight: 400, // Fuente en negrita
              fontSize: '10px', // Tamaño de fuente
              display: 'flex', // Mostrar en línea
              gap: '3px', // Espacio entre elementos
            }}
          >
            {percentageChange === 0
              ? '0%'
              : `${percentageChange}%`} {/* Porcentaje con formato adecuado */}
            {percentageChange > 0 && <IconTriangleFilled className='icono-valor' />} {/* Icono de flecha hacia arriba */}
            {percentageChange < 0 && <IconTriangleInvertedFilled className='icono-valor' />} {/* Icono de flecha hacia arriba */}
          </span>
        </p>
      </div>

      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: false, // No mostrar título
            },
            legend: {
              display: false, // No mostrar leyenda
            },
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: false,
                text: 'Fecha',
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                  family: 'Arial',
                  size: 11,
                },
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                font: {
                  family: 'Arial',
                  size: 9.5,
                },
              },
              grid: {
                color: 'rgba(220, 220, 220, 0.03)',
              },
            },
            y: {
              title: {
                display: false,
                text: 'Valor (€)',
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                  family: 'Arial',
                  size: 11,
                },
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                font: {
                  family: 'Arial',
                  size: 9.5,
                },
              },
              beginAtZero: false,
              grid: {
                color: 'rgba(220, 220, 220, 0.03)',
              },
            },
          },
        }}
      />
      <MovimientosRecientesSinEventos></MovimientosRecientesSinEventos>
    </div>
  );
};

export default GraficaInversor;
