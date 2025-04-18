"use client";

import { useState, useEffect, useRef } from "react";
import customAxios from "@/service/api.mjs";
import "./placeholder-style.css";
import Bubble from "../bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";

export function Placeholder({ username }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBubble, setActiveBubble] = useState(null); // Controlar qué burbuja está activa
  const [bubbleData, setBubbleData] = useState(null); // Almacenar los datos de la burbuja
  const [isListVisible, setIsListVisible] = useState(false); // Mostrar la lista al hacer clic en el input

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Detectar clics fuera del input y la lista
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) && 
        listRef.current && !listRef.current.contains(event.target) &&
        !event.target.closest(".bubble-container") // Asegúrate de que no cierre si se hace clic dentro de la burbuja
      ) {
        setIsListVisible(false); // Ocultar lista al hacer clic fuera
        setActiveBubble(null); // Cerrar la burbuja
        setBubbleData(null); // Limpiar los datos de la burbuja
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await customAxios.get(
        "http://localhost:5000/api/data/todos-usuarios",
        { withCredentials: true }
      );

      if (response.data && Array.isArray(response.data.usuarios)) {
        setUsers(response.data.usuarios);
        setError(null);
      } else {
        throw new Error("La respuesta no contiene un array válido en 'usuarios'.");
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("No se pudieron obtener los usuarios. Intenta nuevamente.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Filtrar usuarios por nombre de usuario
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const results = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(results);
    }
  }, [searchQuery, users]);

  // Manejo de apertura y cierre de burbujas
  const handleBubbleOpen = (user) => {
    setBubbleData(user); // Establecer los datos del usuario seleccionado
    setActiveBubble("perfil"); // Activar la burbuja
    setIsListVisible(false); // Ocultar la lista al abrir la burbuja
  };

  const handleBubbleClose = () => {
    setActiveBubble(null); // Desactivar la burbuja
    setBubbleData(null); // Limpiar los datos de la burbuja
  };

  return (
    <main>
      <div className="placeholder-container">
        <input
          ref={inputRef}
          className="placeholder"
          type="text"
          placeholder="Buscar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsListVisible(true)} // Mostrar lista al hacer foco
        />
        {isListVisible && (
          <ul ref={listRef} className="lista-usuarios">
            {isLoading ? (
              <p>Cargando usuarios...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
            <li
              key={user.id}
              className="usuario-lista"
              role="button" // Indicar que el li actúa como un botón
              onClick={() => handleBubbleOpen(user)}
              tabIndex={0} // Asegura que el li sea enfocable
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleBubbleOpen(user); // Abrir la burbuja al presionar Enter o Espacio
                }
              }}
              style={{ cursor: 'pointer' }} // Cambiar el cursor para que se vea como un botón
            >
              <div className="portfolio-icono">
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  className="avatar-imagen"
                  alt="Avatar"
                />
              </div>
              <div className="startup-lista">
                {user.inversores.length > 0 && (
                  <p className="user-extra">
                    Inversor: {user.inversores[0].nombre}
                  </p>
                )}
                {user.startups.length > 0 && (
                  <p className="user-extra">Startup: {user.startups[0].nombre}</p>
                )}
                <p className="username-startup">{user.username || "Desconocido"}</p>
              </div>
            </li>

              ))
            ) : (
              <p>No se encontraron usuarios</p>
            )}
          </ul>
        )}
        {/* Mostrar la burbuja si está activa */}
        <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
          {activeBubble === "perfil" && bubbleData && (
            <PerfilOtro username={bubbleData.username} /> // Pasar el usuario a PerfilOtro
          )}
        </Bubble>
      </div>
    </main>
  );
}
