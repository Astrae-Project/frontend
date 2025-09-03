'use client';

import { useState, useEffect, useRef, FC } from "react";
import customAxios from "@/service/api.mjs";
import "./placeholder-style.css";
import Bubble from "../bubble/bubble";
import dynamic from "next/dynamic";

// Tipado del componente dinámico
interface PerfilOtroProps {
  username: string;
}
const PerfilOtroComponent: FC<PerfilOtroProps> = dynamic(
  () => import('@/app/perfil-otro/PerfilOtroCliente'),
  { ssr: false }
) as unknown as FC<PerfilOtroProps>;

// Tipos locales
type UserType = {
  id?: string | number;
  username?: string;
  avatar?: string;
  inversores?: any[];
  startups?: any[];
  [k: string]: any;
};

export function Placeholder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [bubbleData, setBubbleData] = useState<UserType | null>(null);
  const [isListVisible, setIsListVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target) &&
        !(target instanceof Element && target.closest(".bubble-container"))
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
      const response = await customAxios.get("/data/todos-usuarios", { withCredentials: true });
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
      setFilteredUsers(users.filter(u => (u.username ?? "").toLowerCase().includes(q)));
    }
  }, [searchQuery, users]);

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  const safeUsernameFrom = (user: UserType | null) => {
    if (!user) return "";
    return user.username ?? user.usuario?.username ?? "";
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
          <ul ref={listRef} className="lista-usuarios" role="list">
            {isLoading ? (
              <li className="loading">Cargando usuarios...</li>
            ) : error ? (
              <li className="error-message">{error}</li>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const esInversor = Array.isArray(user.inversores) && user.inversores.length > 0;
                const esStartup = Array.isArray(user.startups) && user.startups.length > 0;

                return (
                  <li
                    key={user.id ?? user.username}
                    className="inversion-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // asignamos bubbleData y abrimos la burbuja
                      setBubbleData(user);
                      setActiveBubble("perfil");
                      setIsListVisible(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setBubbleData(user);
                        setActiveBubble("perfil");
                        setIsListVisible(false);
                      }
                    }}
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
                          <p className="nombre-startup">{user.username || "Desconocido"}</p>
                          <p className="username-startup">{user.inversores[0]?.nombre ?? ""}</p>
                        </>
                      ) : esStartup ? (
                        <>
                          <p className="nombre-startup">{user.startups[0]?.nombre ?? "Sin nombre"}</p>
                          <p className="username-startup">{user.username || "Desconocido"}</p>
                        </>
                      ) : (
                        <>
                          <p className="username-startup">{user.username || "Desconocido"}</p>
                          <p className="nombre-startup">Sin datos</p>
                        </>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="no-results">
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0 }}>No se encontraron usuarios</p>
                </div>
              </li>
            )}
          </ul>
        )}

        <Bubble show={!!activeBubble} onClose={handleBubbleClose} message={undefined} type={undefined}>
          {activeBubble === "perfil" && bubbleData &&(
            <div className="bubble-container">
              <PerfilOtroComponent username={safeUsernameFrom(bubbleData)} />
            </div>
          )}
        </Bubble>
      </div>
    </main>
  );
}
