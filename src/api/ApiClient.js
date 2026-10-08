import axios from "axios";

export const apiClient = axios.create({
  // baseURL: "http://localhost:5000/api",                          // local base url
  baseURL: "https://api-new.gpgs24.in/api",               // production base url
  withCredentials: true, 
});