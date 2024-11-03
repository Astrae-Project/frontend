import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@nextui-org/react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const Tabla = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Función para obtener el portafolio
  const fetchPortfolio = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/portfolio", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPortfolio(data.inversiones);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Función para formatear el cambio porcentual
  const formatCambioPorcentual = (cambio) => {
    if (cambio > 0) {
      return {
        text: `+${Math.floor(cambio)}`,
        color: 'variacion-positiva',
        glowClass: 'variacion-positiva',
      };
    } else if (cambio < 0) {
      return {
        text: `${Math.floor(cambio)}`,
        color: 'variacion-negativa',
        glowClass: 'variacion-negativa',
      };
    }
    return {
      text: '0',
      color: 'variacion-neutral',
      glowClass: 'variacion-neutral',
    };
  };

  return (
    <div className="seccion" id="portfolio-componente">
      <div className='titulo-principal'>
        <p className='titulo-portfolio'>Activos</p>
      </div>
      <div className="contenido-scrollable">
        {isLoading ? (
          <Spinner color="white" />
        ) : portfolio.length > 0 ? (
          <Table
            aria-label="Portfolio table"
            className="max-h-[520px] overflow-scroll"
            isHeaderSticky
          >
            <TableHeader className="table-header">
              <TableColumn>Startup</TableColumn>
              <TableColumn>Porcentaje</TableColumn>
              <TableColumn>Cambio</TableColumn>
              <TableColumn>Valor</TableColumn>
            </TableHeader>
            <TableBody>
              {portfolio.map((inversion, index) => {
                const cambioPorcentualInfo = formatCambioPorcentual(inversion.cambio_porcentual);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="portfolio-icono">
                        <img src={inversion.startup.usuario.avatar} className="portfolio-imagen" alt={inversion.startup.nombre} />
                      </div>
                      <div className="portfolio-info">
                        <p className="startup-nombre">{inversion.startup.nombre}</p>
                        <p className="startup-username">{inversion.startup.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{inversion.porcentaje_adquirido}%</TableCell>
                    <TableCell className={`variacion ${cambioPorcentualInfo.glowClass}`} style={{ color: cambioPorcentualInfo.color }}>
                      {cambioPorcentualInfo.text}%
                    </TableCell>
                    <TableCell>{inversion.valor}€</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p>No hay inversiones en el portfolio.</p>
        )}
      </div>
    </div>
  );
};

export default Tabla;
