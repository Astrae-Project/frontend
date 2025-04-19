'use client';

import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import './lista-grupos-style.css';
import { IconLockFilled, IconPlus, IconSearch } from "@tabler/icons-react";
import Bubble from "@/app/ui/components/bubble/bubble";

const ListaGrupos = ({ onGroupSelect }) => {
  const [grupos, setGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", tipo: "publico" });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [messageType, setMessageType] = useState("");
  const [ultimoMensajePorGrupo, setUltimoMensajePorGrupo] = useState({});

  useEffect(() => {
    // Obtener los mensajes de cada grupo
    const fetchUltimosMensajes = async () => {
      try {
        const grupoIds = grupos.map(grupo => grupo.grupo.id);
        for (const grupoId of grupoIds) {
          const response = await customAxios.get(`http://localhost:5000/api/grupos/ver/${grupoId}/mensajes`);
          setUltimoMensajePorGrupo(prevState => ({
            ...prevState,
            [grupoId]: response.data.ultimoMensaje || { contenido: "No hay mensajes" } // Establecer el último mensaje
          }));
        }
      } catch (error) {
        console.error("Error obteniendo mensajes:", error);
      }
    };

    if (grupos.length > 0) {
      fetchUltimosMensajes();
    }
  }, [grupos]);

  // Maneja la creación de un nuevo grupo
  const handleCrearGrupo = async () => {
    try {
      await customAxios.post(
        "http://localhost:5000/api/grupos/crear",
        formData,
        { withCredentials: true }
      );
      setConfirmationMessage("¡Grupo creado con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      fetchGrupos(); // Refrescar lista de grupos
      closeBubble();
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      setConfirmationMessage("Hubo un error al crear el grupo.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  // Maneja la unión a un grupo
  const handleUnirGrupo = async () => {
    if (!selectedGroup) return;
    try {
      await customAxios.post(
        `http://localhost:5000/api/grupos/unir/${selectedGroup.id}`,
        {},
        { withCredentials: true }
      );
      setConfirmationMessage("¡Te has unido al grupo con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      fetchGrupos(); // Refrescar lista de grupos
      closeBubble();
    } catch (error) {
      console.error("Error al unirse al grupo:", error);
      setConfirmationMessage("Hubo un error al intentar unirse al grupo.");
      setMessageType("error");
      setFormSubmitted(true);
      if (error.response && error.response.status === 406) {
        setConfirmationMessage("No puedes unirte a un grupo privado.");
        setMessageType("error");
        setFormSubmitted(true);
      }
    }
  };

  // Seleccionar un grupo (desde la lista principal o el modal de unir)
  const handleSelectGroup = (grupo) => {
    setGrupoSeleccionado((prevSelected) => {
      const newSelected = prevSelected?.id === grupo.id ? null : grupo;
      if (newSelected && onGroupSelect) {
        // Retrasamos la actualización para evitar modificar el padre durante el render
        setTimeout(() => onGroupSelect(newSelected.id), 0);
      }
      return newSelected;
    });
  };

  // Fetch de los grupos a los que pertenece el usuario
  const fetchGrupos = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/data/grupos",
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setGrupos(response.data);
      } else {
        console.error("Datos de respuesta inválidos:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener los grupos:", error);
    }
  };

  // Fetch de todos los grupos (para el modal de unirse)
  const fetchTodosGrupos = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/data/todos-grupos",
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setTodosGrupos(response.data);
      } else {
        console.error("Datos de respuesta inválidos:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener los grupos:", error);
    }
  };

  // Carga inicial de los grupos
  useEffect(() => {
    fetchGrupos();
    fetchTodosGrupos();
  }, []);

  // Cierra el modal y resetea el formulario
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setFormSubmitted(false);
    setFormData({ nombre: "", descripcion: "", tipo: "publico" });
    setSelectedGroup(null);
    setMessageType("");
  };

  return (
    <div className="lista-grupos">
      <div className="divisor1">
        <p className="titulo-divisor">Chats</p>
      </div>
  
      {/* Buscador (opcional) */}
      <div className="search-container">
        <input 
          className="search-input" 
          placeholder="Busca un chat o inicia uno nuevo..."
        />
      </div>
  
      {/* Lista de grupos */}
      <div className="grupos">
        {grupos.length > 0 ? (
          <ul>
            {grupos.map((grupo) => (
              <li 
                key={grupo.grupo.id}
                className={grupoSeleccionado?.id === grupo.grupo.id ? "seleccionado" : ""}
                onClick={() => handleSelectGroup(grupo.grupo)}
                id="grupo"
              >
                <div className="grupo-icono1">
                  <img
                    src={grupo.grupo.foto_grupo || "/group-default-avatar.png"}
                    alt="Avatar del grupo"
                    className="grupo-avatar"
                  />
                </div>
                <div className="info-grupo">
                  <p id="nombre-grupo">{grupo.grupo.nombre}</p>
                  {grupo.grupo.tipo === "privado" && (
                    <IconLockFilled className="icono-candado" />
                  )}
                  {/* Mostrar el último mensaje de cada grupo */}
                  <p className="ultimo-mensaje">
                    <strong>{ultimoMensajePorGrupo[grupo.grupo.id]?.emisor.username || "Desconocido"}: </strong>
                    {ultimoMensajePorGrupo[grupo.grupo.id]?.contenido || "No hay mensajes"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="contenido-vacio" id="grupos-vacio">
            <button onClick={() => setActiveBubble("crear-grupo")} className="boton-grupo1">
              <IconPlus />
              <p>Crear</p>
            </button>
            <button onClick={() => setActiveBubble("unir-grupo")} className="boton-grupo1">
              <IconSearch />
              <p>Unir</p>
            </button>
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
                  className="botn-eventos"
                  onClick={closeBubble}
                >
                  Cancelar
                </button>
                <button type="submit" className="botn-eventos enviar">
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
                      className={selectedGroup?.id === grupo.id ? "selected" : ""}
                      onClick={() => handleSelectGroup(grupo)}
                    >
                      <div className="grupo-icono">
                        <img
                          src={grupo.foto_grupo || "/group-default-avatar.png"}
                          alt="Avatar del grupo"
                          className="grupo-avatar"
                        />
                      </div>
                      <div className="grupo-info">
                        <p id="nombre-grupo">{grupo.nombre}</p>
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
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={handleUnirGrupo}
                disabled={!selectedGroup}
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
