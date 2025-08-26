import customAxios from "@/service/api.mjs";
import { useEffect, useState } from "react";
import "./resumen-style.css";

const ResumenPortfolio = () => {
  const [portfolio, setPortfolio] = useState<any>({});
  const [distribucionSectores, setDistribucionSectores] = useState([]);
  const [cambiosPorcentuales, setCambiosPorcentuales] = useState(null);
  const [cambioUltimo, setCambioUltimo] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const response = await customAxios.get(
        "https://backend-l3s8.onrender.com/api/data/portfolio",
        { withCredentials: true }
      );
      const data = response.data;
      setPortfolio(data);
      setDistribucionSectores(calcularDistribucionPorSector(data.inversiones || []));

      const historialResponse = await customAxios.get(
        "https://backend-l3s8.onrender.com/api/data/historicos",
        { withCredentials: true }
      );
      const historicoRaw = historialResponse.data.historico || [];

      // Helper para parsear números que puedan venir como strings con comas/u otros símbolos
      const parseNumberSafe = (v: any) => {
        if (v == null) return null;
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          // eliminar espacios y símbolos comunes de moneda
          let s = v.replace(/\s+/g, "").replace(/[^0-9,\.\-]/g, "");
          // si viene con comas como separador decimal (p. ej. "1.234,56"), convertir a formato JS
          const hasComma = s.indexOf(",") !== -1;
          const hasDot = s.indexOf(".") !== -1;
          if (hasComma && hasDot) {
            // asumir que el punto es separador de miles y la coma decimal
            s = s.replace(/\./g, "").replace(/,/, ".");
          } else if (hasComma && !hasDot) {
            s = s.replace(/,/, ".");
          }
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      };

      const historialOrdenado = historicoRaw
        .map((registro: any) => ({
          ...registro,
          fecha: new Date(registro.fecha),
          valoracion: parseNumberSafe(registro.valoracion),
        }))
        .filter((r: any) => r.fecha && r.valoracion != null)
        .sort((a: any, b: any) => a.fecha.getTime() - b.fecha.getTime());

      const valorActualParsed = parseNumberSafe(data?.valor_total);

      setCambiosPorcentuales(calcularCambioPorcentual(valorActualParsed, historialOrdenado));
      setCambioUltimo(calcularCambioUltimo(historialOrdenado));

    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  function calcularDistribucionPorSector(inversiones: any[]) {
    const conteo: Record<string, number> = {};
    inversiones.forEach((inv) => {
      const sector = inv?.startup?.sector;
      if (sector) conteo[sector] = (conteo[sector] || 0) + 1;
    });
    const total: number = inversiones.length || 0;
    if (total === 0) return [];
    return Object.entries(conteo).map(([sector, count]) => {
      const pct = Math.round((Number(count) / total) * 10000) / 100; // dos decimales
      return {
        sector,
        count: Number(count),
        percentage: pct,
      };
    });
  }

  function calcularCambioPorcentual(valorActual: number, historico: any[]) {
  if (!historico || valorActual == null) return null;

  // `historico` ya viene ordenado cronológicamente y con campos procesados
  const historialOrdenado = historico;
  const ahora = new Date();

    const obtenerCambio = (dias: number) => {
      const fechaObjetivo = new Date(ahora);
      fechaObjetivo.setDate(ahora.getDate() - dias);

      // Preferir el registro más cercano anterior o igual a la fecha objetivo
      const registrosAntes = historialOrdenado.filter((r) => r.fecha <= fechaObjetivo);
      let registroBase = null;

      if (registrosAntes.length > 0) {
        registroBase = registrosAntes[registrosAntes.length - 1]; // más reciente antes de la fecha objetivo
      } else {
        // si no hay registros antes, tomar el primero después de la fecha objetivo
        const registrosDespues = historialOrdenado.filter((r) => r.fecha > fechaObjetivo);
        registroBase = registrosDespues.length > 0 ? registrosDespues[0] : null;
      }

      if (!registroBase) return null;

  const valorPasado = Number(registroBase.valoracion);
  if (!Number.isFinite(valorPasado) || valorPasado === 0) return null;
  const va = Number(valorActual);
  if (!Number.isFinite(va)) return null;
  return ((va - valorPasado) / valorPasado) * 100;
    };

    return {
      semana: obtenerCambio(7),
      mes: obtenerCambio(30),
      año: obtenerCambio(365),
    };
  }

  function calcularCambioUltimo(historico) {
    if (!historico || historico.length < 2) return null;

    // ya viene ordenado cronológicamente
    const ultimoHistorico = historico[historico.length - 1];
    const anteriorHistorico = historico[historico.length - 2];

    const valorUltimo = ultimoHistorico.valoracion;
    const valorAnterior = anteriorHistorico.valoracion;

    if (valorAnterior == null || valorAnterior === 0) return null;

    return ((valorUltimo - valorAnterior) / valorAnterior) * 100;
  }

  const formatoPorcentaje = (v) => {
  if (v == null) return "—";
  const num = Number(v);
  if (!Number.isFinite(num)) return "—";
  const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
  const texto = num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  return <span style={{ color, fontSize: 13}}>{texto}</span>;
  };

  const formatoPorcentajeGrande = (v) => {
  if (v == null) return "—";
  const num = Number(v);
  if (!Number.isFinite(num)) return "—";
  const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
  const texto = num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  return <span style={{ color, fontSize: 11 }}>{texto}</span>;
  };

  // Render del cambio respecto al último histórico: flecha y color según signo
  const renderCambioUltimo = (v) => {
  if (v == null) return <span style={{ color: "#888", fontSize: 11 }}>—</span>;
  const num = Number(v);
  if (!Number.isFinite(num)) return <span style={{ color: "#888", fontSize: 11 }}>—</span>;
  const color = num > 0 ? "rgb(67,222,67)" : num < 0 ? "rgb(222,67,67)" : "#888";
  const icon = num > 0 ? "▲" : num < 0 ? "▼" : "—";
  const texto = num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color, fontSize: 11 }}>
        <span style={{ fontSize: 11 }}>{icon}</span>
        <span>{texto}</span>
      </span>
    );
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
          {formatoValor(Number(portfolio?.valor_total || 0))}
        </p>
        <p className="cambio-ultimo" style={{ display: "flex", alignItems: "center" }}>
          {renderCambioUltimo(cambioUltimo)}
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
