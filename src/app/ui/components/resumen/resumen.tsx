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
      const data = response.data;
      setPortfolio(data);
      setDistribucionSectores(
        calcularDistribucionPorSector(data.inversiones || [])
      );

      const historialResponse = await customAxios.get(
        "http://localhost:5000/api/data/historicos",
        { withCredentials: true }
      );
      setCambiosPorcentuales(
        calcularCambioPorcentual(
          Number(data.valor_total),
          historialResponse.data.historico || []
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
    const conteo = {};
    inversiones.forEach(inv => {
      const sector = inv.startup?.sector;
      if (sector) conteo[sector] = (conteo[sector] || 0) + 1;
    });
    const total = inversiones.length;
    if (total === 0) return [];
    return Object.entries(conteo).map(([sector, count]) => ({
      sector,
      count,
      percentage: Number((count / total * 100).toFixed(2))
    }));
  }

  function calcularCambioPorcentual(valorActual, historico) {
    if (!historico || historico.length === 0 || valorActual == null) return null;
  
    const historialOrdenado = historico
      .map((registro) => ({
        ...registro,
        fecha: new Date(registro.fecha),
        valoracion: Number(registro.valoracion),
      }))
      .sort((a, b) => a.fecha - b.fecha); // ordenamos de más antiguo a más reciente
  
    const obtenerCambio = (dias) => {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);
  
      const registrosEnRango = historialOrdenado.filter(
        (registro) => registro.fecha >= fechaLimite
      );
  
      if (registrosEnRango.length === 0) return 0;
  
      const primerRegistro = registrosEnRango[0];
      const valorPasado = primerRegistro.valoracion;
      if (valorPasado === 0) return 0;
  
      return ((valorActual - valorPasado) / valorPasado) * 100;
    };
  
    return {
      semana: obtenerCambio(7),
      mes: obtenerCambio(30),
      año: obtenerCambio(365),
    };
  }  

  const formatoPorcentaje = v => {
    if (v == null) return "N/A";
    const num = Number(v);
    const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
    return <span style={{ color, fontSize: 15 }}>{num.toFixed(2)}%</span>;
  };

  const formatoValor = v => {
    if (v == null) return "N/A";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0
    }).format(v);
  };

  const defaultColors = ["#4caf50", "#2196f3", "#ff9800", "#e91e63", "#9c27b0", "#3f51b5"];
  const getColorForSector = i => defaultColors[i % defaultColors.length];

  return (
    <div className="apartado3" id="resumen">
      <div className="titulos">
        <h2 className="titulos-valor">Valor Total:</h2>
        <p className="valor-total">{formatoValor(portfolio.valor_total)}</p>
      </div>

      {cambiosPorcentuales && (
        <div className="cambios-porcentuales">
          <p>7 días: {formatoPorcentaje(cambiosPorcentuales.semana)}</p>
          <p>30 días: {formatoPorcentaje(cambiosPorcentuales.mes)}</p>
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
                style={{ width: `${item.percentage}%` }}>
                {item.sector} ({item.percentage}%)
              </span>
            ))}
          </div>
          <div className="progress-bar">
            {distribucionSectores.map((item, idx) => (
              <div
                key={item.sector}
                className="progress-segment"
                style={{ width: `${item.percentage}%`, backgroundColor: getColorForSector(idx) }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenPortfolio;
