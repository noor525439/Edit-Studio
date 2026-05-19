import axios from "axios";

export const API_BASE = "http://localhost:3000";
export const WORKFLOW_API = `${API_BASE}/workflow`;
export const REVIEWS_API = `${API_BASE}/api/reviews`;

export const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const apiGet = (url) => axios.get(url, getAuthHeader());
export const apiPost = (url, data) => axios.post(url, data, getAuthHeader());
export const apiPut = (url, data) => axios.put(url, data, getAuthHeader());
export const apiPatch = (url, data) => axios.patch(url, data, getAuthHeader());
export const apiDelete = (url) => axios.delete(url, getAuthHeader());
