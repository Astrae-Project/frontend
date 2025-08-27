'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Input from "../textarea/textarea-demo";
import "./chat-style.css";
import { IconDotsVertical, IconLogout2, IconPencil, IconUserShield } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";
import Bubble from "@/app/ui/components/bubble/bubble";

const SOCKET_SERVER_URL = "https://backend-l3s8.onrender.com";

interface ChatGroupProps {
  groupId?: number | string | null;
  user?: any;
}

interface Message {
  contenido: string;
  id_emisor?: number;
  id_grupo?: number;
  fecha_envio?: string;
  emisor?: { id?: number; username?: string; avatar?: string };
  [k: string]: any;
}

const ChatGroup: React.FC<ChatGroupProps> = ({ groupId, user }) => {
  const [currentUser, setCurrentUser] = useState<any>(user ?? null);
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupData, setGroupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDropdownId, setOpenDropdownId] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("");
  const [permisos, setPermisos] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Scroll refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const numericGroupId = groupId ? parseInt(String(groupId).trim(), 10) : null;

  const currentUserId = currentUser ? currentUser.id : null;

  const isCurrentUserAdmin = () => {
    const currentMember = groupData?.miembros?.find((miembro: any) => miembro.id === currentUserId);
    return !!(currentMember && (String(currentMember.rol || "").toLowerCase() === "administrador"));
  };

  // --- Fetch usuario (si no llega desde props) ---
  const fetchRol = async () => {
    try {
      console.log("[Chat] fetchRol: pidiendo usuario");
      const response = await customAxios.get(`/data/usuario`, { withCredentials: true });
      const usuario = response.data.inversor?.usuario || response.data.startup?.usuario;
      console.log("[Chat] fetchRol: usuario obtenido", usuario);
      setCurrentUser(usuario);
    } catch (error) {
      console.error("[Chat] Error obteniendo datos del usuario:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) fetchRol();
    // si user prop cambia, actualizamos
  }, []);

  // --- Fetch datos del grupo ---
  const fetchGroupData = async () => {
    if (!numericGroupId) return;
    try {
      console.log(`[Chat] fetchGroupData: pidiendo datos del grupo ${numericGroupId}`);
      const response = await customAxios.get(`/grupos/data/${numericGroupId}`);
      console.log("[Chat] fetchGroupData: datos recibidos", response.data);
      setGroupData(response.data);
      setPermisos(response.data.permisos ?? []);
    } catch (error) {
      console.error("[Chat] Error obteniendo datos del grupo:", error);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [numericGroupId]);

  // --- Actualizar permiso (fix URL y guard) ---
  const actualizarPermiso = async (permisoId: string, nuevoValor: boolean) => {
    if (!numericGroupId) return;
    try {
      console.log(`[Chat] actualizarPermiso: ${permisoId} -> ${nuevoValor}`);
      await customAxios.put(
        `https://backend-l3s8.onrender.com/api/grupos/cambio-permiso/${numericGroupId}`,
        {
          groupId: numericGroupId,
          permiso: permisoId,
          abierto: nuevoValor,
        }
      );
    } catch (error: any) {
      console.error("[Chat] Error actualizando permiso:", error?.response ?? error);
    }
  };

  useEffect(() => {
    // Si permisos vienen del servidor, no reenvíes inmediatamente todos (esto puede provocar bucle).
    // Aquí simplemente sincronizamos estado local con servidor sólo si hay cambios manuales (togglePermiso).
    // Por seguridad, no mandamos masivamente al montar.
  }, []);

  const togglePermiso = (permisoId: string) => {
    setPermisos((prev) =>
      prev.map((permiso) => {
        if (permiso.permiso === permisoId) {
          const nuevoValor = !permiso.abierto;
          // Llamada al backend
          actualizarPermiso(permisoId, nuevoValor);
          return { ...permiso, abierto: nuevoValor };
        }
        return permiso;
      })
    );
  };

  // --- Fetch mensajes iniciales ---
  useEffect(() => {
    if (!numericGroupId) return;
    setIsLoading(true);
    const fetchMessages = async () => {
      try {
        console.log(`[Chat] fetchMessages: grupo ${numericGroupId}`);
        const response = await customAxios.get(`/grupos/ver/${numericGroupId}/mensajes`);
        console.log("[Chat] fetchMessages: recibidos", response.data?.mensajes?.length ?? 0);
        setMessages(response.data.mensajes ?? []);
      } catch (error) {
        console.error("[Chat] Error obteniendo mensajes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [numericGroupId]);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current && !isLoading) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- Socket.IO: conectar / escuchar / limpiar ---
  useEffect(() => {
    if (!numericGroupId) return;

    console.log(`[Chat] Conectando socket al servidor ${SOCKET_SERVER_URL} para grupo ${numericGroupId}`);
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });

    newSocket.on("connect", () => {
      console.log("[Chat:socket] conectado, id:", newSocket.id);
      newSocket.emit("joinRoom", numericGroupId);
    });

    newSocket.on("newMessage", (data: Message) => {
      console.log("[Chat:socket] newMessage recibido:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      // Autoscroll si estamos cerca del final
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isAtBottom) {
          setTimeout(() => {
            chatContainerRef.current?.scrollTo({
              top: chatContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        }
      }
    });

    newSocket.on("connect_error", (err: any) => {
      console.error("[Chat:socket] Error de conexión:", err);
    });

    socketRef.current = newSocket;

    return () => {
      console.log("[Chat] Desconectando socket");
      try {
        socketRef.current?.disconnect();
      } catch (e) {
        console.warn("[Chat] Error al desconectar socket:", e);
      }
      socketRef.current = null;
    };
  }, [numericGroupId]);

  // Dropdown click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest(".btn-dropdown")
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setMessageType("");
  };

  // Edit group form state (actualizado al abrir editar)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "privado",
  });

  useEffect(() => {
    if (activeBubble === "editar-grupo" && selectedGroup) {
      setFormData({
        nombre: selectedGroup.nombre || "",
        descripcion: selectedGroup.descripcion || "",
        tipo: selectedGroup.tipo || "publico",
      });
    }
  }, [activeBubble, selectedGroup]);

  const handleEditarGrupo = async () => {
    try {
      console.log("[Chat] handleEditarGrupo", formData);
      await customAxios.put(`/grupos/datos/${groupId}`, formData);
      await fetchGroupData();
      setActiveBubble(null);
      setConfirmationMessage("Grupo editado correctamente");
      setMessageType("success");
    } catch (error: any) {
      console.error("[Chat] Error editando grupo:", error?.response ?? error);
      setConfirmationMessage(error?.response?.data?.message ?? "Error editando grupo");
      setMessageType("error");
    }
  };

  const handleSalirGrupo = async () => {
    try {
      await customAxios.delete(`/grupos/salir/${groupId}`);
      setActiveBubble(null);
      setGroupData(null);
      setConfirmationMessage("Has salido del grupo correctamente.");
      setMessageType("success");
    } catch (error: any) {
      console.error("[Chat] Error saliendo del grupo:", error?.response ?? error);
      setConfirmationMessage(error?.response?.data?.message ?? "Error saliendo del grupo");
      setMessageType("error");
    }
  };

  // Enviar mensaje
  const handleSendMessage = useCallback(
    async (messageContent: string) => {
      if (!socketRef.current || !numericGroupId || !currentUser) {
        console.warn("[Chat] No se puede enviar mensaje, faltan datos", { socket: !!socketRef.current, numericGroupId, currentUser });
        return;
      }
      try {
        const messageData = {
          contenido: messageContent,
          id_emisor: currentUser.id,
          id_grupo: numericGroupId,
          fecha_envio: new Date().toISOString(),
        };

        // Optimistic UI
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...messageData,
            emisor: { id: currentUser.id, username: currentUser.username },
          },
        ]);

        // Guardar en backend
        await customAxios.post(`/grupos/enviar/${numericGroupId}/mensajes`, messageData);

        // Emitir socket
        socketRef.current.emit("sendMessage", {
          ...messageData,
          username: currentUser.username,
        });

        // Scroll final
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      } catch (error) {
        console.error("[Chat] Error al enviar mensaje:", error);
      }
    },
    [numericGroupId, currentUser]
  );

  // Helpers para formato de fecha/hora
  function formatHourMinutes(fecha?: string) {
    if (!fecha) return "";
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  function formatDateSeparator(fecha?: string) {
    if (!fecha) return "";
    const date = new Date(fecha);
    const options = { day: "numeric", month: "long" } as const;
    return date.toLocaleDateString("es-ES", options);
  }

  function isValidDate(date: Date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  const renderMessagesWithSeparators = () => {
    const elements: React.ReactNode[] = [];
    let lastDateKey = "";
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.fecha_envio ?? "");
      let msgDateKey = "";
      if (isValidDate(msgDate)) {
        msgDateKey = msgDate.toISOString().split("T")[0];
        if (msgDateKey !== lastDateKey) {
          elements.push(
            <div key={`sep-${msgDateKey}`} className="date-separator">
              <p>{formatDateSeparator(msg.fecha_envio)}</p>
            </div>
          );
          lastDateKey = msgDateKey;
        }
      } else {
        console.error("[Chat] Fecha inválida en mensaje:", msg.fecha_envio);
      }

      const isMyMessage = currentUser && msg.emisor && msg.emisor.id === currentUser.id;
      let showHeader = true;
      if (!isMyMessage && index > 0) {
        const prevMsg = messages[index - 1];
        if (prevMsg?.emisor?.id === msg?.emisor?.id) {
          const prevDateKey = new Date(prevMsg.fecha_envio ?? "").toISOString().split("T")[0];
          if (prevDateKey === msgDateKey) {
            showHeader = false;
          }
        }
      }

      if (isMyMessage) {
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container my-message-container">
            <div className="message-content">
              <div className="chat-message my-message">
                <span className="contenido">{msg.contenido}</span>
                <span className="message-time" id="time">{formatHourMinutes(msg.fecha_envio)}</span>
              </div>
            </div>
          </div>
        );
      } else {
        const messageClass = showHeader ? "other-message" : "other-message consecutive-message";
        elements.push(
          <div key={`msg-${index}`} className="chat-message-container other-message-container">
            {showHeader && (
              <div className="avatar-miembro">
                <img
                  src={msg.emisor?.avatar || "/default-avatar.png"}
                  className="avatar-imagen"
                  alt="Avatar"
                />
              </div>
            )}
            <div className="message-content">
              {showHeader && <p className="username">{msg.emisor?.username}</p>}
              <div className={`chat-message ${messageClass}`}>
                <span className="contenido">{msg.contenido}</span>
                <span className="message-time" id="time1">{formatHourMinutes(msg.fecha_envio)}</span>
              </div>
            </div>
          </div>
        );
      }
    });
    return elements;
  };

  return (
    <div className="chat-container">
      {!numericGroupId ? (
        <div className="contenido-vacio" id="vacio">
          <p>Selecciona un grupo para empezar a chatear.</p>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <div className="group-info">
              <div className="avatar1" aria-label="Avatar del grupo">
                <img
                  src={groupData?.avatar || "/group-default-avatar.png"}
                  alt="Avatar del grupo"
                />
              </div>
              <p className="nombre-grupo">{groupData ? groupData.nombre : "Cargando..."}</p>
            </div>
            <div className="header-icons">
              <div className="dropdown-ref" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(openDropdownId === groupData?.id ? null : groupData?.id);
                  }}
                  className="iconos btn-dropdown"
                >
                  <IconDotsVertical />
                </button>
                {openDropdownId && (
                  <div
                    className="dropdown1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCurrentUserAdmin() && (
                      <>
                        <button
                          className="btn-dropdown1"
                          id="ver-perfil1"
                          onClick={() => {
                            setSelectedGroup(groupData);
                            setActiveBubble("editar-grupo");
                          }}
                        >
                          <IconPencil />
                          <p>Editar</p>
                        </button>
                        <button
                          className="btn-dropdown1"
                          id="permisos1"
                          onClick={() => {
                            setSelectedGroup(groupData);
                            setActiveBubble("permisos");
                          }}
                        >
                          <IconUserShield />
                          <p>Permisos</p>
                        </button>
                      </>
                    )}
                    <button
                      className="btn-dropdown1"
                      id="eliminar1"
                      onClick={() => {
                        setActiveBubble("confirmacion");
                        setConfirmationMessage("¿Estás seguro de que deseas salir del grupo?");
                        setMessageType("neutral");
                      }}
                    >
                      <IconLogout2 />
                      <p>Salir</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chat-messages" ref={chatContainerRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <img
                  src="/Logo.svg"
                  alt="Cargando..."
                  className="heartbeat"
                />
              </div>
            ) : (
              <>
                {renderMessagesWithSeparators()}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <Input onSendMessage={handleSendMessage} groupId={groupId} />
        </>
      )}

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "editar-grupo" && selectedGroup && (
          <div className="crear-grupo-container">
            <h2>Editar Grupo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditarGrupo();
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
                  rows={4}
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
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={formData.tipo === "privado"}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
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
                  <p>Cancelar</p>
                </button>
                <button type="submit" className="botn-eventos enviar">
                  <p>Guardar</p>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeBubble === "confirmacion" && (
          <div className="confirmacion-container">
            <div className="botones-confirmacion">
              <button
                className="botn-confirmar"
                onClick={() => {
                  setActiveBubble(null);
                  setConfirmationMessage("");
                  setMessageType("");
                }}
              >
                Cancelar
              </button>
              <button
                className="botn-confirmar"
                id="salir"
                onClick={handleSalirGrupo}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {activeBubble === "permisos" && selectedGroup && (
          <div className="permisos-container">
            <h2>Configurar permisos</h2>

            <ul className="lista-permisos">
              {permisos.map((permisoObj) => {
                const nombreVisible = {
                  invitar_miembros: "Invitar nuevos miembros",
                  crear_ofertas: "Publicar ofertas",
                  subir_documentos: "Subir documentos",
                }[permisoObj.permiso] || permisoObj.permiso;

                const acceso = permisoObj.abierto ? "Todos los miembros" : "Solo administradores";

                return (
                  <li key={permisoObj.permiso} className="permiso-item">
                    <div style={{ flex: 1 }}>
                      <div className="permiso-nombre">{nombreVisible}</div>
                      <div className="admins">{acceso}</div>
                    </div>

                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={!permisoObj.abierto}
                        onChange={() => togglePermiso(permisoObj.permiso)}
                      />
                      <span className="slider"></span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default ChatGroup;
