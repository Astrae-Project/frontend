import React, { useEffect, useState } from "react";
import "./tabla-inversiones-style.css";
import customAxios from "@/service/api.mjs";

const TablaInversiones = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const response = await customAxios.get("http://localhost:5000/api/data/ofertas");
        setOfertas(response.data); // Guardamos todas las ofertas
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfertas();
  }, []);

  const formatoValor = (valor) => {
    if (valor == null) return "N/A";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Aceptada":
        return "estado-aceptado";
      case "Pendiente":
        return "estado-pendiente";
      case "Rechazada":
        return "estado-rechazado";
      default:
        return "";
    }
  };

  if (loading) return <p>Cargando ofertas...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  const formatoFecha = (fecha) => {
    if (!fecha) return "N/A"; // Si no hay fecha, se muestra N/A
    const options = { 
      year: 'numeric', // Año
      month: 'numeric', // Mes
      day: 'numeric', // Día del mes
    };
    return new Date(fecha).toLocaleDateString('es-ES', options); // Formato de fecha en español
  };  

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
          {ofertas.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-ofertas">No hay ofertas disponibles</td>
            </tr>
          ) : (
            ofertas.map((oferta) => (
              <tr key={oferta.id}>
                <td><p>{oferta.startup?.usuario.username || "Desconocido"}</p></td>
                <td><p>{formatoValor(oferta.monto_ofrecido)}</p></td>
                <td><p>{oferta.porcentaje_ofrecido}%</p></td>
                <td>
                  <div className={`estado-container ${getEstadoClass(oferta.estado)}`}>
                    <p>{oferta.estado}</p>
                  </div>
                </td>
                <td><p>{formatoFecha(oferta.fecha_creacion)}</p></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaInversiones;
