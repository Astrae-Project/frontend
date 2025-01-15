/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./sidebar";
import {
  IconHome,
  IconMessage,
  IconSettings,
  IconUserCircle,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import "./sidebar-demo-style.css";
import customAxios from "@/service/api.mjs";

export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const [rol, setRol] = useState(null); // Estado para almacenar el rol
  const [links, setLinks] = useState([]); // Estado para los enlaces dinámicos

  // Función para obtener los enlaces según el rol
  const getLinksByRole = (role) => {
    const rolesLinks = {
      inversor: [
        { label: "Inicio", href: "/", icon: <IconHome className="icon-style" /> },
        { label: "Portfolio", href: "/portfolio", icon: <IconWallet className="icon-style" /> },
        { label: "Grupos", href: "/grupos", icon: <IconMessage className="icon-style" /> },
        { label: "Ajustes", href: "/ajustes", icon: <IconSettings className="icon-style" /> },
      ],
      startup: [
        { label: "Inicio", href: "/", icon: <IconHome className="icon-style" /> },
        { label: "Grupos", href: "/grupos", icon: <IconMessage className="icon-style" /> },
        { label: "Ajustes", href: "/ajustes", icon: <IconSettings className="icon-style" /> },
      ],
    };
    return rolesLinks[role] || [];
  };

  const fetchRol = async () => {
    try {
      const response = await customAxios.get("http://localhost:5000/api/data/usuario", { withCredentials: true });
      if (response.data.startup) {
        setRol("startup");
      } else if (response.data.inversor) {
        setRol("inversor");
      } else {
        setRol(null); // Rol desconocido o usuario sin categoría
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setRol(null); // Maneja el error asignando un rol nulo
    }
  };

  // Fetch inicial para obtener el rol
  useEffect(() => {
    fetchRol();
  }, []);

  // Actualiza los enlaces cuando el rol cambie
  useEffect(() => {
    if (rol) {
      setLinks(getLinksByRole(rol));
    }
  }, [rol]);

  // Renderizar estado de carga si el rol aún no se ha obtenido
  if (rol === null) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="sidebar-body">
        <div className="content">
          {open ? <Logo /> : <LogoIcon />} 
          <div className="links-container">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: open ? "Perfil" : "",
              href: "/perfil",
              icon: <IconUserCircle className="icon-style" />,
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => (
  <Link href="/" className="logo-container">
    <img src="/favicon.svg" alt="Logo Astrae" className="logo-img" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="logo-text"
    />
  </Link>
);

export const LogoIcon = () => {
  const { open } = useSidebar();

  return (
    <Link href="/" className="logo-container">
      <motion.img
        src="/favicon.svg"
        alt="Logo Astrae"
        className="logo-img"
        animate={{
          scale: open ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      />
    </Link>
  );
};
