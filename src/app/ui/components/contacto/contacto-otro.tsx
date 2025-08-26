'use client';

import customAxios from "@/service/api.mjs";
import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";

const InformacionContactoOtro = ({ contacto }) => {
  const contactoItems = [
    contacto?.correo && (
      <li className="contacto-item" key="correo">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/gmail.svg" className="contacto-imagen" alt="Correo" />
          </div>
        </div>
        <p>{contacto.correo}</p>
      </li>
    ),
    contacto?.twitter && (
      <li className="contacto-item" key="twitter">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/x.svg" className="contacto-imagen" alt="Twitter" />
          </div>
        </div>
        <p>@{contacto.twitter}</p>
      </li>
    ),
    contacto?.linkedin && (
      <li className="contacto-item" key="linkedin">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/linkedin.svg" className="contacto-imagen" alt="LinkedIn" />
          </div>
        </div>
        <p>@{contacto.linkedin}</p>
      </li>
    ),
    contacto?.facebook && (
      <li className="contacto-item" key="facebook">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/facebook.svg" className="contacto-imagen" alt="Facebook" />
          </div>
        </div>
        <p>@{contacto.facebook}</p>
      </li>
    ),
    contacto?.instagram && (
      <li className="contacto-item" key="instagram">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/instagram.svg" className="contacto-imagen" alt="Instagram" />
          </div>
        </div>
        <p>@{contacto.instagram}</p>
      </li>
    ),
  ].filter(Boolean).slice(0, 5); // Filtramos elementos nulos y limitamos a 4

  return (
    <>
      <div className="titulo-principal">
        <p className="titulo-contacto">Contacto</p>
      </div>
      <div className="contenido-scrollable">
        {contacto ? (
          <ul className="contacto-lista">
            {contactoItems}
          </ul>
        ) : (
          <p>No hay información de contacto disponible.</p>
        )}
      </div>
    </>
  );
};

export default function ContactoOtro({ username }) {
  const [contacto, setContacto] = useState(null);

  useEffect(() => {
    const fetchContacto = async () => {
      if (!username) return;

      try {
        const response = await customAxios.get(
          `https://backend-l3s8.onrender.com/api/data/usuario/${username}`,
          {
            withCredentials: true,
          }
        );
        // Ajuste aquí: verifica si es un array y selecciona el primer elemento
        const contactoData = response.data.contacto?.[0] || null;
        setContacto(contactoData);
      } catch (error) {
        console.error("Error al obtener los datos de contacto:", error);
      }
    };

    fetchContacto();
  }, [username]);

  return (
    <div className="seccion" id="contacto">
      <InformacionContactoOtro contacto={contacto} />
    </div>
  );
}
