import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080", // Cambiado para pruebas locales (antes https://cardex-29ba.onrender.com)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});