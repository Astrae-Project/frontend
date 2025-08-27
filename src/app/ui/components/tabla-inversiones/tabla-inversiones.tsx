import React, { useEffect, useState } from "react";
import "./tabla-inversiones-style.css";
import customAxios from "@/service/api.mjs";
import Bubble from "../bubble/bubble";

const TablaInversiones = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBubble, setActiveBubble] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const { data } = await customAxios.get("https://api.astraesystem.com/api/data/ofertas", {
          withCredentials: true,
        });
        setOfertas(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  const formatoValor = (v) =>
    v == null
      ? "N/A"
      : new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
        }).format(v);

  const getEstadoClass = (e) => ({
    Aceptada: "estado-aceptado",
    Pendiente: "estado-pendiente",
    Rechazada: "estado-rechazado",
    Contraoferta: "estado-contraoferta",
  }[e] || "");

  const formatoFecha = (f) =>
    f
      ? new Date(f).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "N/A";

  const openBubble = (oferta) => {
    if (oferta.estado === "Contraoferta") setActiveBubble(oferta);
  };
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setMessageType("");
  };

  const handleAccept = async () => {
    try {
      const { id, inversor } = activeBubble;
      await customAxios.put(
        `https://api.astraesystem.com/api/invest/contraoferta/${id}/aceptar/${inversor.id_usuario}`,
        {},
        { withCredentials: true }
      );
      setConfirmationMessage("Oferta aceptada con éxito!");
      setMessageType("success");
    } catch {
      setConfirmationMessage("Error al aceptar la oferta.");
      setMessageType("error");
    }
  };
  const handleReject = async () => {
    try {
      const { id, inversor } = activeBubble;
      await customAxios.put(
        `https://api.astraesystem.com/api/invest/contraoferta/${id}/rechazar/${inversor.id_usuario}`,
        {},
        { withCredentials: true }
      );
      setConfirmationMessage("Oferta rechazada con éxito!");
      setMessageType("success");
    } catch {
      setConfirmationMessage("Error al rechazar la oferta.");
      setMessageType("error");
    }
  };

  if (loading)
    return <div className="no-ofertas">Cargando ofertas…</div>;
  if (error) return <div className="no-ofertas">Error: {error}</div>;
  if (!ofertas.length)
    return (
      <div className="no-ofertas">
        <h2>No hay ofertas disponibles</h2>
      </div>
    );

  return (
    <div className="apartado3 tabla-inversiones-wrapper">
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Monto</th>
              <th>Ofrecido %</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.map((oferta) => (
              <tr key={oferta.id}>
                <td>{oferta.startup?.usuario.username}</td>
                <td>{formatoValor(oferta.monto_ofrecido)}</td>
                <td>{oferta.porcentaje_ofrecido}%</td>
                <td>
                  <span
                    className={`estado-badge ${getEstadoClass(
                      oferta.estado
                    )}`}
                    onClick={() => openBubble(oferta)}
                  >
                    {oferta.estado}
                  </span>
                </td>
                <td>{formatoFecha(oferta.fecha_creacion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble && (
          <div className="oferta-card">
            <div className="oferta-header">
              <h3>Contraoferta</h3>
              <span>{formatoFecha(activeBubble.fecha_creacion)}</span>
            </div>
            <div className="oferta-body">
              <div>
                <strong>Startup:</strong>{" "}
                {activeBubble.startup.usuario.username}
              </div>
              <div>
                <strong>Monto:</strong>{" "}
                {formatoValor(activeBubble.contraoferta_monto)}
              </div>
              <div>
                <strong>% Ofrecido:</strong>{" "}
                {activeBubble.contraoferta_porcentaje}%
              </div>
            </div>
            <div className="oferta-footer">
              <button
                className="btn btn-rechazar"
                onClick={handleReject}
              >
                Rechazar
              </button>
              <button
                className="btn btn-aceptar"
                onClick={handleAccept}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default TablaInversiones;
