import customAxios from '@/service/api.mjs';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import '../grafica-startup/grafica-startup-style.css';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

const GraficaInversorPortfolio = () => {
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
        const labels = response.data.historico.map((item) =>
          new Date(item.fecha).toLocaleDateString()
        );
        const dataValues = response.data.historico.map((item) => Number(item.valoracion)); // Convertir a número
  
        const latestValue = dataValues[dataValues.length - 1] || 0; // Asegurar número
        const previousValue = dataValues[dataValues.length - 2] || 0; // Asegurar número
        const change = previousValue
          ? ((latestValue - previousValue) / previousValue) * 100
          : 0;
  
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
    <div className="apartado3">
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
    </div>
  );
};

export default GraficaInversorPortfolio;
