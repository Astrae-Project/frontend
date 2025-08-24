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
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);
  const [isListVisible, setIsListVisible] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) &&
        listRef.current && !listRef.current.contains(event.target) &&
        !event.target.closest(".bubble-container")
      ) {
        setIsListVisible(false);
        setActiveBubble(null);
        setBubbleData(null);
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
      if (response.data?.usuarios instanceof Array) {
        setUsers(response.data.usuarios);
        setError(null);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("No se pudieron obtener los usuarios.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(u => u.username.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, users]);

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
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
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsListVisible(true)}
        />
        {isListVisible && (
          <ul ref={listRef} className="lista-usuarios">
            {isLoading ? (
              <p>Cargando usuarios...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const esInversor = user.inversores?.length > 0;
                const esStartup = user.startups?.length > 0;
                return (
                  <li
                    key={user.id}
                    className="inversion-item"
                    role="button"
                    onClick={() => setActiveBubble("perfil")}
                  >
                    <div className="portfolio-icono">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        className="avatar-imagen"
                        alt="Avatar"
                      />
                    </div>
                    <div className="startup-lista">
                      {esInversor ? (
                        <>
                          <p className="nombre-startup">
                            {user.username || "Desconocido"}
                          </p>
                          <p className="username-startup">
                            {user.inversores[0].nombre}
                          </p>
                        </>
                      ) : esStartup ? (
                        <>
                          <p className="nombre-startup">
                            {user.startups[0].nombre}
                          </p>
                          <p className="username-startup">
                            {user.username || "Desconocido"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="username-startup">
                            {user.username || "Desconocido"}
                          </p>
                          <p className="nombre-startup">Sin datos</p>
                        </>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0 }}>No se encontraron usuarios</p>
                </div>
              </li>
            )}
          </ul>
        )}
        <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
          {activeBubble === "perfil" && bubbleData && (
            <PerfilOtro username={bubbleData.username} />
          )}
        </Bubble>
      </div>
    </main>
  );
}
