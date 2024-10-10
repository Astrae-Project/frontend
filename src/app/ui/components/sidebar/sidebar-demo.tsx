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

export function SidebarDemo() {
  const [open, setOpen] = useState(false); 

  useEffect(() => {
    setOpen(false); 
  }, []);

  const links = [
    {
      label: "Inicio",
      href: "/",
      icon: (
        <IconHome className="icon-style" />
      ),
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: (
        <IconWallet className="icon-style" />
      ),
    },
    {
      label: "Grupos",
      href: "/grupos",
      icon: (
        <IconMessage className="icon-style" />
      ),
    },
    {
      label: "Ajustes",
      href: "/ajustes",
      icon: (
        <IconSettings className="icon-style" />
      ),
    },
  ];

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
                icon: (
                  <IconUserCircle className="icon-style" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="logo-container"
    >
      <img
        src="/favicon.svg"
        alt="Logo Astrae"
        className="logo-img"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="logo-text"
      >
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  const { open } = useSidebar(); // Accede al estado de la barra lateral

  return (
    <Link href="/" className="logo-container">
      <motion.img
        src="/favicon.svg"
        alt="Logo Astrae"
        className="logo-img"
        animate={{
          scale: open ? 1.5 : 1, // Escala el logo cuando la barra está abierta
          translateX: open ? 0 : 0, // Cambia la posición en el eje X si es necesario
          translateY: open ? 0 : 0, // Cambia la posición en el eje Y si es necesario
        }}
        transition={{
          type: "spring", // Usa una animación de resorte para un efecto suave
          stiffness: 300, // Ajusta la rigidez del resorte
          damping: 20, // Ajusta la amortiguación para suavizar la animación
        }}
      />
    </Link>
  );
};



