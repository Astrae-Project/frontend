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
        const response = await customAxios.get(
          "http://localhost:5000/api/data/ofertas"
        );
        setOfertas(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  const formatoValor = (valor) =>
    valor == null
      ? "N/A"
      : new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
        }).format(valor);

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Aceptada":
        return "estado-aceptado";
      case "Pendiente":
        return "estado-pendiente";
      case "Rechazada":
        return "estado-rechazado";
      case "Contraoferta":
        return "estado-contraoferta";
      default:
        return "";
    }
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const openBubble = (oferta) => {
    if (oferta.estado === "Contraoferta") {
      setActiveBubble(oferta);
    }
  };

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setMessageType("");
  };

const handleAccept = async () => {
  if (!activeBubble) return;

  try {
    const { id: ofertaId, inversor } = activeBubble;
    const inversorId = inversor?.id_usuario;

    await customAxios.put(`http://localhost:5000/api/invest/contraoferta/${ofertaId}/aceptar/${inversorId}`,
      {},
      { withCredentials: true }
    );

    setConfirmationMessage("Oferta aceptada con éxito!");
    setMessageType("success");
  } catch (err) {
    setConfirmationMessage("Hubo un error al aceptar la oferta.");
    setMessageType("error");
  }
};

const handleReject = async () => {
  if (!activeBubble) return;

  try {
    const { id: ofertaId, inversor } = activeBubble;
    const userId = inversor?.id_usuario;

    await customAxios.put(`http://localhost:5000/api/invest/contraoferta/${ofertaId}/rechazar/${userId}`,
      {},
      { withCredentials: true }
    );

    setConfirmationMessage("Oferta rechazada con éxito!");
    setMessageType("success");
  } catch (err) {
    setConfirmationMessage("Hubo un error al rechazar la oferta.");
    setMessageType("error");
  }
};


  if (loading) {
    return <div className="no-ofertas">Cargando ofertas…</div>;
  }

  if (error) {
    return <div className="no-ofertas">Error: {error}</div>;
  }

  if (ofertas.length === 0) {
    return (
      <div className="no-ofertas">
        <h1>No hay ofertas disponibles</h1>
      </div>
    );
  }

  return (
    <div className="apartado3" id="tabla-inversores">
      <table className="custom-table">
        <thead className="titulos-tabla">
          <tr>
            <th className="col-startup"><p>Startup</p></th>
            <th className="col-monto"><p>Monto</p></th>
            <th className="col-porcentaje"><p>Porcentaje</p></th>
            <th className="col-estado"><p>Estado</p></th>
            <th className="col-fecha"><p>Fecha</p></th>
          </tr>
        </thead>
        <tbody>
          {ofertas.map((oferta) => (
            <tr key={oferta.id}>
              <td><p>{oferta.startup?.usuario.username || "Desconocido"}</p></td>
              <td><p>{formatoValor(oferta.monto_ofrecido)}</p></td>
              <td><p>{oferta.porcentaje_ofrecido}%</p></td>
              <td>
                <div
                  className={`estado-container ${getEstadoClass(oferta.estado)}`} 
                  onClick={() => openBubble(oferta)}
                >
                  <p>{oferta.estado}</p>
                </div>
              </td>
              <td><p>{formatoFecha(oferta.fecha_creacion)}</p></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble && (
          <div className="oferta-card">
            <div className="oferta-header">
              <h3>Contraoferta Recibida</h3>
              <span className="oferta-fecha">
                {formatoFecha(activeBubble.fecha_creacion)}
              </span>
            </div>

            <div className="oferta-body">
              <div className="oferta-dato">
                <span className="dato-label">Startup</span>
                <span className="dato-valor">
                  {activeBubble.startup?.usuario.username || "Desconocido"}
                </span>
              </div>

              <div className="oferta-dato">
                <span className="dato-label">Monto Ofrecido</span>
                <span className="dato-valor">
                  {formatoValor(activeBubble.contraoferta_monto)}
                </span>
              </div>

              <div className="oferta-dato">
                <span className="dato-label">Porcentaje Ofrecido</span>
                <span className="dato-valor">
                  {activeBubble.contraoferta_porcentaje}%
                </span>
              </div>
            </div>

            <div className="oferta-footer">
              <button className="btn btn-rechazar" onClick={handleReject}>
                Rechazar
              </button>
              <button className="btn btn-aceptar" onClick={handleAccept}>
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
