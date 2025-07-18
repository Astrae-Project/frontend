import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import './grafica-startup-style.css';
import MovimientosRecientesSinEventosOtro from '../movimientos-recientes/movimientos-recientes-sin-eventos-otro';

// Registrar las escalas y otros componentes necesarios
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaStartupOtro = ({ username }) => {
  const [data, setData] = useState({
    labels: [], // Fechas
    datasets: [
      {
        label: 'Valor de la startup', // Etiqueta de la línea
        data: [], // Valores de las valoraciones
        borderColor: 'rgb(142, 110, 190)', // Color de la línea
        backgroundColor: 'rgba(110, 75, 163, 0.1)', // Color de fondo debajo de la línea
        fill: true, // Rellenar debajo de la línea
        tension: 0.4, // Suaviza la curva de la línea (opcional)
      },
    ],
  });
  const [totalStartupValue, setTotalStartupValue] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  // Función para obtener los datos históricos de valoraciones basadas en el username
  const fetchValorStartup = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
        withCredentials: true, // Enviar cookies con la solicitud
      });

      // Verificamos si los datos existen en la clave 'startup.valoracion_historica' de la respuesta
      if (response.data && Array.isArray(response.data.startup.valoracion_historica)) {
        const labels = response.data.startup.valoracion_historica.map((item) =>
          new Date(item.fecha).toLocaleDateString()
        );
        const dataValues = response.data.startup.valoracion_historica.map((item) => item.valoracion);

        setData({
          labels,
          datasets: [
            {
              label: 'Valor de la startup',
              data: dataValues,
              borderColor: 'rgb(142, 110, 190)', // Color de la línea
              backgroundColor: 'rgba(144, 113, 190, 0.1)', // Color de fondo debajo de la línea
              fill: true,
              tension: 0.4, // Curva de la línea más suave
            },
          ],
        });
        
        // Calcular el valor total y el cambio porcentual
        const total = dataValues[dataValues.length - 1] || 0;
        const previous = dataValues[dataValues.length - 2] || total;
        const change = previous ? ((total - previous) / previous) * 100 : 0;

        setTotalStartupValue(total);
        setPercentageChange(change);
      } else {
        console.error('Datos no válidos en la respuesta de la API', response.data.startup.valoracion_historica);
      }
    } catch (error) {
      console.error('Error fetching historics:', error);
    }
  };

  useEffect(() => {
    fetchValorStartup(); // Poblar gráfica al cargar el componente
  }, [username]);

  const formatInversionRaw = (monto) => {
    if (monto == null) return 'N/A';
    const value = Number(monto);
    if (isNaN(value)) return 'N/A';
    return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`;
  };

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
          {formatInversionRaw(totalStartupValue)}
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
      <MovimientosRecientesSinEventosOtro username={username}></MovimientosRecientesSinEventosOtro>
    </div>
  );
};

export default GraficaStartupOtro;
