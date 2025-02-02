import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import { IconLockFilled, IconPlus, IconSearch } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";
import Bubble from "../bubble/bubble";
import "./tabla-grupos-style.css";

const TablaGrupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeBubble, setActiveBubble] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "publico",
  });
  const [grupoId, setGrupoId] = useState(""); // Agregar estado para capturar el ID del grupo al unirse

  // Cierra el modal y resetea el formulario
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setFormSubmitted(false);
    setFormData({ nombre: "", descripcion: "", tipo: "publico" });
    setGrupoId("");
    setSelectedGroup(null);
    setMessageType("");
  };

  // Maneja la creación de un nuevo grupo
  const handleCrearGrupo = async () => {
    try {
      const response = await customAxios.post(
        "http://localhost:5000/api/grupos/crear",
        formData,
        { withCredentials: true }
      );
      setConfirmationMessage("Grupo creado con éxito!");
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
    if (!selectedGroup) return; // Verificación adicional
    try {
      const response = await customAxios.post(
        `http://localhost:5000/api/grupos/unir/${selectedGroup.id}`,
        {},
        { withCredentials: true }
      );
      setConfirmationMessage("Te has unido al grupo con éxito!");
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


  const handleSelectGroup = (grupo) => {
    setSelectedGroup((prevSelected) => (prevSelected?.id === grupo.id ? null : grupo));
  };

  // Fetch de los grupos desde la API
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

    // Fetch de los grupos desde la API
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

  return (
    <div className="seccion" id="grupos-perfil">
      <div className="titulo-principal">
        <p className="titulo-contacto">Grupos</p>
      </div>
      {grupos.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="grupos-lista">
            {grupos.map((grupo, index) => (
              <li key={index} className="grupo-item">
                <div className="grupo-icono">
                  <img
                    src={grupo.grupo.foto_grupo || "/default-avatar.png"}
                    alt="Avatar del grupo"
                    className="grupo-avatar"
                  />
                </div>
                <div className="grupo-info">
                  <p id="nombre-grupo">{grupo.grupo.nombre}</p>
                  {grupo.grupo.tipo === "privado" && (
                    <IconLockFilled className="icono-candado" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="contenido-vacio" id="grupos-vacio">
          <button onClick={() => setActiveBubble("crear-grupo")} className="boton-grupo"><IconPlus /><p>Crear</p></button>
          <button onClick={() => setActiveBubble("unir-grupo")} className="boton-grupo"><IconSearch /><p>Unir</p></button>
        </div>
      )}

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
          <p>Selecciona un evento para modificar</p>
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
                        src={grupo.foto_grupo || "/default-avatar.png"}
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
                <p>No hay startups disponibles.</p>
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

export default TablaGrupos;
