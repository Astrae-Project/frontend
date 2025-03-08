'use client';

import React, { useState } from "react";
import "./bento-grupos-style.css";
import ChatGroup from "../chat/chat";
import ListaGrupos from "../lista-grupos/lista-grupos";
import InfoGrupos from "../info-grupos/info-grupos";

const BentoGridGrupos = ({ user }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
  };

  return (
    <div className="contenedor2">
      <div className="bento2">
        <div className="apartado2">
          <ListaGrupos onGroupSelect={handleGroupSelect} />
        </div>
        <div className="apartado2">
          <ChatGroup groupId={selectedGroupId} user={user} />
        </div>
        <div className="apartado2">
          <InfoGrupos groupId={selectedGroupId} />
        </div>
      </div>
    </div>
  );
};

export default BentoGridGrupos;
