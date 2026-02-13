import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "http://localhost:5000";

export const publicApi = axios.create({ baseURL: BASE_URL });
export const privateApi = axios.create({ baseURL: BASE_URL });

privateApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

export const apiRequest = async <T,>(
  instance: AxiosInstance, // Fixes: Unexpected any.
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: unknown
): Promise<T> => {
  const response: AxiosResponse<T> = await instance({ method, url, data });
  return response.data;
};
