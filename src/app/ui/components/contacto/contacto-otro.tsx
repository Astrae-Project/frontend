'use client';

import customAxios from "@/service/api.mjs";
import React, { useState, useEffect } from "react";

const InformacionContactoOtro = ({ contacto }) => {
  return (
    <div className="seccion" id="contacto">
      <div className="titulo-principal">
        <p className="titulo-contacto">Contacto</p>
      </div>
      {contacto ? (
        <div className="contenedor-social">
          {contacto.correo && (
            <div className="borde-icono icono-social">
              <div className="icono-social2 movimiento-icono">
                <img
                  src="/Imagenes/iconos/gmail.svg"
                  alt="Gmail"
                  className="contacto-imagen imagen2"
                />
              </div>
            </div>
          )}
          {contacto.twitter && (
            <div className="borde-icono icono-social">
              <div className="icono-social2 movimiento-icono">
                <img
                  src="/Imagenes/iconos/x.svg"
                  alt="Twitter"
                  className="contacto-imagen imagen2"
                />
              </div>
            </div>
          )}
          {contacto.linkedin && (
            <div className="borde-icono icono-social">
              <div className="icono-social2 movimiento-icono">
                <img
                  src="/Imagenes/iconos/linkedin.svg"
                  alt="LinkedIn"
                  className="contacto-imagen imagen2"
                />
              </div>
            </div>
          )}
          {contacto.facebook && (
            <div className="borde-icono icono-social">
              <div className="icono-social2 movimiento-icono">
                <img
                  src="/Imagenes/iconos/facebook.svg"
                  alt="Facebook"
                  className="contacto-imagen imagen2"
                />
              </div>
            </div>
          )}
          {contacto.instagram && (
            <div className="borde-icono icono-social">
              <div className="icono-social2 movimiento-icono">
                <img
                  src="/Imagenes/iconos/instagram.svg"
                  alt="Instagram"
                  className="contacto-imagen imagen2"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No hay información de contacto disponible.</p>
      )}
    </div>
  );
};

export default function ContactoOtro({ username }) {
  const [contacto, setContacto] = useState(null);
  const [error, setError] = useState(null);

  const fetchContacto = async () => {
    if (!username) return;

    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/data/usuario/${username}`,
        {
          withCredentials: true,
        }
      );
      setContacto(response.data?.usuario || null);
    } catch (error) {
      console.error("Error al obtener los datos de contacto:", error);
      setError("No se pudo cargar la información de contacto.");
    }
  };

  useEffect(() => {
    fetchContacto();
  }, [username]);

  return (
    <div className="seccion">
      <InformacionContactoOtro contacto={contacto} />
    </div>
  );
}
