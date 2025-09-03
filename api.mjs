import axios from "axios";

const customAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // cambia según el entorno
  withCredentials: true,
});

customAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await generateRefreshToken();
        return customAxios(originalRequest);
      } catch (refreshError) {
        console.error("Error al refrescar el token:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const generateRefreshToken = async () => {
  try {
    const response = await customAxios.post("/auth/refrescar-token");

    if (response.data.accessToken) {
      // Guarda el nuevo token si es necesario
    } else {
      console.error("No se recibió un nuevo access token");
    }
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    throw new Error("Error al refrescar el token");
  }
};

export default customAxios;