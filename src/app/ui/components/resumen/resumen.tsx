import customAxios from "@/service/api.mjs";
import { useEffect, useState } from "react";
import "./resumen-style.css";

const ResumenPortfolio = () => {
  const [portfolio, setPortfolio] = useState({});
  const [distribucionSectores, setDistribucionSectores] = useState([]);
  const [cambiosPorcentuales, setCambiosPorcentuales] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/data/portfolio",
        { withCredentials: true }
      );
      setPortfolio(response.data);
      setDistribucionSectores(
        calcularDistribucionPorSector(response.data?.inversiones || [])
      );

      // Obtener historial de valores y calcular cambios porcentuales
      const historialResponse = await customAxios.get(
        "http://localhost:5000/api/data/historicos",
        { withCredentials: true }
      );
      setCambiosPorcentuales(
        calcularCambioPorcentual(
          Number(response.data.valor_total),
          historialResponse.data.historico
        )
      );
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  function calcularDistribucionPorSector(inversiones) {
    const conteoSectores = {};
    inversiones.forEach((inversion) => {
      const sector = inversion.startup?.sector;
      if (sector) {
        conteoSectores[sector] = (conteoSectores[sector] || 0) + 1;
      }
    });

    const totalInversiones = inversiones.length;
    if (totalInversiones === 0) return [];

    return Object.keys(conteoSectores).map((sector) => {
      const count = conteoSectores[sector];
      const percentage = (count / totalInversiones) * 100;
      return { sector, count, percentage: Number(percentage.toFixed(2)) };
    });
  }

  function calcularCambioPorcentual(valorActual, historico) {
    if (!historico || historico.length === 0 || valorActual == null) return null;

    const historialOrdenado = historico
      .map((registro) => ({
        ...registro,
        fecha: new Date(registro.fecha),
        valoracion: Number(registro.valoracion),
      }))
      .sort((a, b) => b.fecha - a.fecha);

    if (historialOrdenado.length === 1) {
      return { semana: 0, mes: 0, año: 0 };
    }

    const obtenerCambio = (dias) => {
      const fechaObjetivo = new Date();
      fechaObjetivo.setDate(fechaObjetivo.getDate() - dias);
      const registroPasado = historialOrdenado.find(
        (registro) => registro.fecha <= fechaObjetivo
      );
      if (!registroPasado) return 0;
      const valorPasado = registroPasado.valoracion;
      if (valorPasado === 0) return 0;
      return ((valorActual - valorPasado) / valorPasado) * 100;
    };

    return {
      semana: obtenerCambio(7),
      mes: obtenerCambio(30),
      año: obtenerCambio(365),
    };
  }

  const formatoPorcentaje = (valor) => {
    if (valor == null || isNaN(Number(valor))) return "N/A";
    const num = Number(valor);
    const color = num > 0 ? "rgb(67, 222, 67)" : num < 0 ? "rgba(222, 67, 67)" : "#888888";
    return <span style={{ color, fontSize: "15px" }}>{num.toFixed(2).replace(/\.?0+$/, "")}%</span>;
  };

  const formatoValor = (valor) => {
    if (valor == null) return "N/A";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const defaultColors = ["#4caf50", "#2196f3", "#ff9800", "#e91e63", "#9c27b0", "#3f51b5"];
  const getColorForSector = (index) => defaultColors[index % defaultColors.length];

  return (
    <div className="apartado3" id="resumen">
      <div className="titulos">
        <h2 className="titulos-valor">Valor Total:</h2>
        <p className="valor-total">{formatoValor(portfolio?.valor_total)}</p>
      </div>

      {cambiosPorcentuales && (
        <div className="cambios-porcentuales">
          <p>7 dias: {formatoPorcentaje(cambiosPorcentuales.semana)}</p>
          <p>30 dias: {formatoPorcentaje(cambiosPorcentuales.mes)}</p>
          <p>1 año: {formatoPorcentaje(cambiosPorcentuales.año)}</p>
        </div>
      )}

      {distribucionSectores.length > 0 && (
        <div className="progress-container">
          <div className="sector-labels">
            {distribucionSectores.map((item) => (
              <span
                key={item.sector}
                className="sector-label"
                style={{ width: `${item.percentage}%` }}
              >
                {item.sector}
              </span>
            ))}
          </div>

          <div className="progress-bar">
            {distribucionSectores.map((item, index) => (
              <div
                key={item.sector}
                className="progress-segment"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: getColorForSector(index),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenPortfolio;
