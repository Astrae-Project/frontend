import axios from "axios";

// Crear una instancia personalizada de axios
const customAxios = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Asegúrate de que las cookies se envíen
});

customAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 403 || error.response?.status === 401 || error.response?.status === 402 || error.response?.status === 500 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          await generateRefreshToken(); // Refrescar el token
  
          return customAxios(originalRequest); // Reintentar la solicitud original
        } catch (refreshError) {
          console.error('Error al refrescar el token:', refreshError);
          // Si no se puede refrescar, podrías redirigir al login o manejar el error de otra forma
        }
      }
  
      return Promise.reject(error); // Rechazar el error si no se puede refrescar el token
    }
  );  

  export const generateRefreshToken = async () => {
    try {
      const response = await customAxios.post("http://localhost:5000/api/auth/refrescar-token");
   
      if (response.data.accessToken) {
        } else {
        console.error('No se recibió un nuevo access token');
      }
    } catch (error) {
      console.error("Error al refrescar el token:", error);
      // Si la operación falla, lanzamos un error o podríamos manejar el error (ej. redirigir al login)
      throw new Error('Error al refrescar el token');
    }
  };
  
export default customAxios;
