import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';

// Registrar las escalas y otros componentes necesarios
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaStartup = () => {
  const [data, setData] = useState({
    labels: [], // Fechas
    datasets: [
      {
        label: 'Valor de la startup',
        data: [], // Valores de las valoraciones
        borderColor: 'rgba(75,192,192,1)', // Color de la línea
        backgroundColor: 'rgba(75,192,192,0.2)', // Color de fondo debajo de la línea
        fill: true, // Rellenar debajo de la línea
        tension: 0.4, // Suaviza la curva de la línea (opcional)
      },
    ],
  });

  // Función para obtener los datos históricos de valoraciones
  const fetchValorStartup = async () => {
    try {
      const response = await customAxios.get('http://localhost:5000/api/data/historicos', {
        withCredentials: true, // Enviar cookies con la solicitud
      });

      console.log('Respuesta de la API:', response);

    
      // Verificamos si los datos existen en la clave 'historico' de la respuesta
      if (response.data && Array.isArray(response.data.historico)) {
        const labels = response.data.historico.map((item) =>
          new Date(item.fecha).toLocaleDateString()
        );
        const dataValues = response.data.historico.map((item) => item.valoracion);

        setData({
          labels,
          datasets: [
            {
              label: 'Valor de la startup',
              data: dataValues,
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: true,
              tension: 0.4, // Curva de la línea más suave
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
    fetchValorStartup(); // Poblar gráfica al cargar el componente
  }, []);

  return (
    <div className="seccion" id="grupos-perfil">
      <div className="titulo-principal">
        <p className="titulo-contacto">Gráfica</p>
      </div>
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Valor de la Startup a lo largo del tiempo',
            },
          },
          scales: {
            x: {
              type: 'category', // Usamos 'category' para etiquetas
              title: {
                display: true,
                text: 'Fecha',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Valor',
              },
              beginAtZero: false,
            },
          },
        }}
      />
    </div>
  );
};

export default GraficaStartup;
