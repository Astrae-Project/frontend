'use client';

import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";
import {
  IconLockFilled,
  IconPlus,
  IconSearch
} from "@tabler/icons-react";
import Bubble from "@/app/ui/components/bubble/bubble";
import './lista-grupos-style.css';

const ListaGrupos = ({ onGroupSelect }) => {
  const [grupos, setGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBubble, setActiveBubble] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "publico"
  });
  const [selectedToJoin, setSelectedToJoin] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ultimoMensajePorGrupo, setUltimoMensajePorGrupo] = useState({});
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  // — Fetch chats del usuario —
  const fetchGrupos = async () => {
    try {
      const { data } = await customAxios.get(
        "https://api.astraesystem.com/api/data/grupos",
        { withCredentials: true }
      );
      setGrupos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener los grupos:", err);
    }
  };

  // — Fetch grupos disponibles para unirse —
  const fetchTodosGrupos = async () => {
    try {
      const { data } = await customAxios.get(
        "https://api.astraesystem.com/api/data/todos-grupos",
        { withCredentials: true }
      );
      setTodosGrupos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener todos los grupos:", err);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchTodosGrupos();
  }, []);

  // — Fetch últimos mensajes cuando cambie la lista de chats —
  useEffect(() => {
    const fetchUltimos = async () => {
      for (const { grupo } of grupos) {
        try {
          const { data } = await customAxios.get(
            `https://api.astraesystem.com/api/grupos/ver/${grupo.id}/mensajes`
          );
          setUltimoMensajePorGrupo(prev => ({
            ...prev,
            [grupo.id]: data.ultimoMensaje ?? { contenido: "No hay mensajes" }
          }));
        } catch {
          setUltimoMensajePorGrupo(prev => ({
            ...prev,
            [grupo.id]: { contenido: "Error cargando mensajes" }
          }));
        }
      }
    };
    if (grupos.length) fetchUltimos();
  }, [grupos]);

  // — Crear grupo —
  const handleCrearGrupo = async () => {
    try {
      await customAxios.post(
        "https://api.astraesystem.com/api/grupos/crear",
        formData,
        { withCredentials: true }
      );
      setMessageType("success");
      setConfirmationMessage("¡Grupo creado con éxito!");
      setFormSubmitted(true);
      await fetchGrupos();
      await fetchTodosGrupos();
      closeBubble();
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setConfirmationMessage("Error creando el grupo");
      setFormSubmitted(true);
    }
  };

  // — Unirse a grupo —
  const handleUnirGrupo = async () => {
    if (!selectedToJoin) return;
    try {
      await customAxios.post(
        `https://api.astraesystem.com/api/grupos/unir/${selectedToJoin.id}`,
        {},
        { withCredentials: true }
      );
      setMessageType("success");
      setConfirmationMessage("¡Te has unido al grupo!");
      setFormSubmitted(true);
      await fetchGrupos();
      await fetchTodosGrupos();
      closeBubble();
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setConfirmationMessage(
        err.response?.status === 406
          ? "No puedes unirte a un grupo privado."
          : "Error al unirse al grupo"
      );
      setFormSubmitted(true);
    }
  };

  // — Selección de chat —
  const handleSelectChat = (e, grupo) => {
    e.stopPropagation();
    onGroupSelect?.(grupo.id);
    setGrupoSeleccionado(grupo);
  };

  // — Selección en modal de "unirse" —
  const handleSelectToJoin = (e, grupo) => {
    e.stopPropagation();
    setSelectedToJoin(prev => (prev?.id === grupo.id ? null : grupo));
  };

  // — Cerrar modal y reset —
  const closeBubble = () => {
    setActiveBubble(null);
    setFormData({ nombre: "", descripcion: "", tipo: "publico" });
    setSelectedToJoin(null);
    setConfirmationMessage("");
    setMessageType("");
    setFormSubmitted(false);
  };

  // — Filtrado de chats con el buscador —
  const gruposFiltrados = grupos.filter(({ grupo }) =>
    grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lista-grupos">
      <div className="divisor1">
        <p className="titulo-divisor">Chats</p>
        <div className="botones-titulo">
          <button className="botn-titulo" onClick={() => setActiveBubble("crear-grupo")}>
            <IconPlus className="icono-agregar" />
          </button>
          <button className="botn-titulo" onClick={() => setActiveBubble("unir-grupo")}>
            <IconSearch className="icono-agregar" />
          </button>
        </div>
      </div>

      <div className="search-container">
        <input
          className="search-input"
          placeholder="Busca un chat o inicia uno nuevo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grupos">
        {gruposFiltrados.length > 0 ? (
          <ul>
            {gruposFiltrados.map(({ grupo }) => (
              <li
                key={grupo.id}
                className={grupoSeleccionado?.id === grupo.id ? "seleccionado" : ""}
                onClick={e => handleSelectChat(e, grupo)}
                id="grupo"
              >
                <div className="grupo-icono1">
                  <img
                    src={grupo.foto_grupo || "/group-default-avatar.png"}
                    alt="Avatar del grupo"
                    className="grupo-avatar"
                  />
                </div>
                <div className="info-grupo">
                  <p id="nombre-grupo">{grupo.nombre}</p>
                  {grupo.tipo === "privado" && (
                    <IconLockFilled className="icono-candado" />
                  )}
                  <p className="ultimo-mensaje">
                    <strong>
                      {ultimoMensajePorGrupo[grupo.id]?.emisor?.username ||
                        "Desconocido"}
                      :{" "}
                    </strong>
                    {ultimoMensajePorGrupo[grupo.id]?.contenido ||
                      "No hay mensajes"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="contenido-vacio" id="grupos-vacio">
            <p>No hay chats que coincidan.</p>
          </div>
        )}
      </div>

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "crear-grupo" && !formSubmitted && (
          <div className="crear-grupo-container">
            <h2>Crear Grupo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCrearGrupo();
              }}
              className="crear-grupo-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                  placeholder="Descripción del grupo"
                />
              </div>
              <div className="form-group">
                <div className="tipo-opciones">
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="publico"
                      checked={formData.tipo === "publico"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={formData.tipo === "privado"}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    />
                    <p className="text-label">Privado</p>
                  </label>
                </div>
              </div>
              <div className="contendor-botn-grupo">
                <button
                  type="button"
                  className="botn-grupos"
                  onClick={closeBubble}
                >
                  Cancelar
                </button>
                <button type="submit" className="botn-grupos enviar">
                  Crear
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeBubble === "unir-grupo" && !formSubmitted && (
          <div>
            <p>Selecciona un grupo para unirte</p>
            <div className="contenedor-eventos">
              <ul>
                {todosGrupos.length > 0 ? (
                  todosGrupos.map((grupo) => (
                    <li
                      key={grupo.id}
                      className={selectedToJoin?.id === grupo.id ? "grupo-item1 selected" : "grupo-item1"}
                      onClick={e => handleSelectToJoin(e, grupo)}
                    >
                      <div className="grupo-icono">
                        <img
                          src={grupo.foto_grupo || "/group-default-avatar.png"}
                          alt="Avatar del grupo"
                          className="grupo-avatar"
                        />
                      </div>
                      <div className="grupo-info">
                        <p id="nombre-grupo1">{grupo.nombre}</p>
                        {grupo.tipo === "privado" && (
                          <IconLockFilled className="icono-candado" />
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No hay grupos disponibles.</p>
                )}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-grupos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-grupos enviar"
                onClick={handleUnirGrupo}
                disabled={!selectedToJoin}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default ListaGrupos;
