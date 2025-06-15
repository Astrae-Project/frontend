import customAxios from "@/service/api.mjs";
import { useEffect, useState } from "react";
import "./resumen-style.css";

const ResumenPortfolio = () => {
  const [portfolio, setPortfolio] = useState({});
  const [distribucionSectores, setDistribucionSectores] = useState([]);
  const [cambiosPorcentuales, setCambiosPorcentuales] = useState(null);
  const [cambioUltimo, setCambioUltimo] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/data/portfolio",
        { withCredentials: true }
      );
      const data = response.data;
      setPortfolio(data);
      setDistribucionSectores(calcularDistribucionPorSector(data.inversiones || []));

      const historialResponse = await customAxios.get(
        "http://localhost:5000/api/data/historicos",
        { withCredentials: true }
      );
      const historico = historialResponse.data.historico || [];

      setCambiosPorcentuales(calcularCambioPorcentual(Number(data.valor_total), historico));
      setCambioUltimo(calcularCambioUltimo(Number(data.valor_total), historico));
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  function calcularDistribucionPorSector(inversiones) {
    const conteo = {};
    inversiones.forEach((inv) => {
      const sector = inv.startup?.sector;
      if (sector) conteo[sector] = (conteo[sector] || 0) + 1;
    });
    const total = inversiones.length;
    if (total === 0) return [];
    return Object.entries(conteo).map(([sector, count]) => ({
      sector,
      count,
      percentage: Number(((count / total) * 100).toFixed(2)),
    }));
  }

  function calcularCambioPorcentual(valorActual, historico) {
    if (!historico || valorActual == null) return null;

    const historialOrdenado = historico
      .map((registro) => ({
        ...registro,
        fecha: new Date(registro.fecha),
        valoracion: Number(registro.valoracion),
      }))
      .sort((a, b) => a.fecha - b.fecha);

    const ahora = new Date();

    const obtenerCambio = (dias) => {
      const fechaLimite = new Date();
      fechaLimite.setDate(ahora.getDate() - dias);

      const registrosPrevios = historialOrdenado.filter(
        (registro) => registro.fecha <= fechaLimite
      );

      if (registrosPrevios.length === 0) return null;

      const registroBase = registrosPrevios[registrosPrevios.length - 1];
      const valorPasado = registroBase.valoracion;
      if (valorPasado === 0) return null;

      return ((valorActual - valorPasado) / valorPasado) * 100;
    };

    return {
      semana: obtenerCambio(7),
      mes: obtenerCambio(30),
      año: obtenerCambio(365),
    };
  }

  // NUEVA función para calcular cambio % respecto al último valor histórico previo al actual
  function calcularCambioUltimo(valorActual, historico) {
    if (!historico || valorActual == null) return null;

    const historialOrdenado = historico
      .map((registro) => ({
        ...registro,
        fecha: new Date(registro.fecha),
        valoracion: Number(registro.valoracion),
      }))
      .sort((a, b) => a.fecha - b.fecha);

    // Buscar el último valor histórico anterior al actual
    // Suponemos que valorActual es el más reciente
    let ultimoValor = null;
    for (let i = historialOrdenado.length - 1; i >= 0; i--) {
      if (historialOrdenado[i].valoracion !== valorActual) {
        ultimoValor = historialOrdenado[i].valoracion;
        break;
      }
    }

    if (ultimoValor == null || ultimoValor === 0) return null;

    return ((valorActual - ultimoValor) / ultimoValor) * 100;
  }

  const formatoPorcentaje = (v) => {
    if (v == null) return "—";
    const num = Number(v);
    const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
    return <span style={{ color, fontSize: 15, marginLeft: 8 }}>{num.toFixed(2)}%</span>;
  };

  const formatoPorcentajeGrande = (v) => {
    if (v == null) return "—";
    const num = Number(v);
    const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
    return <span style={{ color, fontSize: 11 }}>{num.toFixed(2)}%</span>;
  };

  const formatoValor = (v) => {
    if (v == null) return "N/A";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(v);
  };

  const defaultColors = ["#5A6EEB","#8F44D6","#3BAE9D","#D98C5F","#6C6F93","#A25BCF" ];
  const getColorForSector = (i) => defaultColors[i % defaultColors.length];

  return (
    <div className="apartado3" id="resumen">
      <div className="titulos" style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 className="titulos-valor">Valor Total:</h2>
        <p className="valor-total" style={{ display: "flex", alignItems: "center" }}>
          {formatoValor(portfolio.valor_total)}
        </p>
        <p className="cambio-ultimo" style={{ display: "flex", alignItems: "center" }}>
          {formatoPorcentajeGrande(cambioUltimo)}
        </p>
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
                style={{ width: `${item.percentage}%` }}
              >
                {item.sector} ({item.percentage}%)
              </span>
            ))}
          </div>
          <div className="progress-bar">
            {distribucionSectores.map((item, idx) => (
              <div
                key={item.sector}
                className="progress-segment"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: getColorForSector(idx),
                  borderRadius:
                    idx === 0
                      ? "4px 0 0 4px"
                      : idx === distribucionSectores.length - 1
                      ? "0 4px 4px 0"
                      : "0",
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
