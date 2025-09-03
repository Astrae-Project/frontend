import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import './grafica-startup-style.css';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaStartupOtroSimple = ({ username }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Valor de la startup',
        data: [],
        borderColor: 'rgb(142, 110, 190)',
        backgroundColor: 'rgba(110, 75, 163, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0, // 👈 Eliminar puntos
      },
    ],
  });

  const [totalStartupValue, setTotalStartupValue] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  const fetchValorStartup = async () => {
    try {
      const response = await customAxios.get(`/data/usuario/${username}`, {
        withCredentials: true,
      });

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
              borderColor: 'rgb(142, 110, 190)',
              backgroundColor: 'rgba(144, 113, 190, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 0, // 👈 Sin puntos
            },
          ],
        });

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
    fetchValorStartup();
  }, [username]);

  return (
    <div style={{width: '100%'}}>
      <div style={{ width: '100px' }}>
        <Line
          data={data}
          style={{ height: '75px', width: '100px' }} // Ajusta aquí la altura
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: false },
              legend: { display: false },
            },
            scales: {
              x: {
                ticks: {
                  display: false, // 👈 quitar números eje X
                },
                grid: {
                  display: false, // 👈 quitar rejilla fondo eje X
                },
              },
              y: {
                ticks: {
                  display: false, // 👈 quitar números eje Y
                },
                grid: {
                  display: false, // 👈 quitar rejilla fondo eje Y
                },
              },
            },
          }}
        />
      </div>
      <div className="valor-portfolio">
        <p className='cambio-valor' style={{ display: 'flex', alignItems: 'end' }}>
          <span style={{
            color: percentageChange === 0
              ? "rgba(255, 255, 255, 0.6)"
              : percentageChange > 0
              ? "rgb(67, 222, 67)"
              : "rgba(222, 67, 67)",
            fontWeight: 400,
            fontSize: '10px',
            display: 'flex',
            gap: '3px',
          }}>
            {percentageChange === 0 ? '0%' : `${percentageChange.toFixed(2)}%`}
            {percentageChange > 0 && <IconTriangleFilled className='icono-valor' />}
            {percentageChange < 0 && <IconTriangleInvertedFilled className='icono-valor' />}
          </span>
        </p>
      </div>
    </div>
  );
};

export default GraficaStartupOtroSimple;
