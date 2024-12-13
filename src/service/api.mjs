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
  
      console.log('Interceptando error:', error);
  
      if (error.response?.status === 403 || error.response?.status === 500 && !originalRequest._retry) {
        console.log('Token expirado, intentando refrescar...');
        originalRequest._retry = true;
  
        try {
          await generateRefreshToken(); // Refrescar el token
  
          console.log('Token refrescado, reintentando la solicitud...');
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
      const response = await customAxios.post("/auth/refrescar-token");
  
      // Verifica si la respuesta tiene un nuevo access token
      console.log('Respuesta del refresh token:', response);
    
  
      if (response.data.accessToken) {
        
        console.log('Nuevo access token recibido');  
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
