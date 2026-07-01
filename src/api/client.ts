import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://cardex-29ba.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});