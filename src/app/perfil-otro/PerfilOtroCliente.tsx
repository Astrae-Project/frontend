'use client';

import React, { useEffect, useState } from 'react';
import customAxios from '@/service/api.mjs';
import { BentoGridPerfilOtro } from './bento-perfil-otro/bento-perfil-otro';

interface PerfilOtroClienteProps {
  username: string;
}

const PerfilOtroCliente: React.FC<PerfilOtroClienteProps> = ({ username }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await customAxios.get(`/data/usuario/${username}`, { withCredentials: true });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [username]);

  return (
    <BentoGridPerfilOtro username={username} />
  );
};

export default PerfilOtroCliente;
