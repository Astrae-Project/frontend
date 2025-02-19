import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import './grafica-startup-style.css';
import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import MovimientosRecientesInversion from '../movimientos-recientes/movimientos-recientes-inversion';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaStartup = () => {
  const [data, setData] = useState({
    labels: [], // Fechas
    datasets: [
      {
        label: 'Valor de la startup', // Etiqueta de la línea
        data: [], // Valores de las valoraciones
        borderColor: 'rgb(142, 110, 190)', // Color de la línea
        backgroundColor: 'rgba(110, 75, 163, 0.1)', // Color de fondo debajo de la línea
        fill: true, // Rellenar debajo de la línea
        tension: 0.4, // Curva suave de la línea
      },
    ],
  });

  const [totalStartupValue, setTotalStartupValue] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  // Función para formatear los números (miles con puntos y decimales con coma)
  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Función para obtener los datos históricos de valoraciones
  const fetchValorStartup = async () => {
    try {
      const response = await customAxios.get('http://localhost:5000/api/data/historicos', {
        withCredentials: true, // Enviar cookies con la solicitud
      });

      // Verificamos si los datos existen en la clave 'historico' de la respuesta
      if (response.data && Array.isArray(response.data.historico)) {
        const labels = response.data.historico.map((item) =>
          new Date(item.fecha).toLocaleDateString('es-ES') // Formatear la fecha en formato español
        );
        const dataValues = response.data.historico.map((item) => item.valoracion);

        // Establecer datos para la gráfica
        setData({
          labels,
          datasets: [
            {
              label: 'Valor de la startup',
              data: dataValues,
              borderColor: 'rgb(142, 110, 190)',
              backgroundColor: 'rgba(144, 113, 190, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Calcular el valor total y el cambio porcentual
        const total = dataValues[dataValues.length - 1] || 0;
        const previous = dataValues[dataValues.length - 2] || total;
        const change = previous ? ((total - previous) / previous) * 100 : 0;

        // Formatear los valores antes de establecerlos en el estado
        setTotalStartupValue(formatNumber(total));
        setPercentageChange(Number(change));
      } else {
        console.error('Datos no válidos en la respuesta de la API', response.data.historico);
      }
    } catch (error) {
      console.error('Error al obtener los históricos:', error);
    }
  };

  useEffect(() => {
    fetchValorStartup(); // Llamar la función cuando el componente se monta
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
          {totalStartupValue.toLocaleString('es-ES')}€ 
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
                  size: 12,
                },
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                font: {
                  family: 'Arial',
                  size: 10,
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
                  size: 12,
                },
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                font: {
                  family: 'Arial',
                  size: 10,
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
      <MovimientosRecientesInversion></MovimientosRecientesInversion>
    </div>
  );
};

export default GraficaStartup;
