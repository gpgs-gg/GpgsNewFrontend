import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // IMPORTANT for refresh token cookies
});

const login = async (data) => {
  const response = await apiClient.post("/login", data);
  return response.data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["login"]);
    },
  });
};

// fecting data for employees
const fetchEmployeeDetailsData = async () => {
  const response = await apiClient.get("/Employees-details");
  return response.data;
};

// React Query hook to fetch property data
export const useEmployeeDetails = () => {
  return useQuery({
    queryKey: ["EmployeeDetails"],
    queryFn: fetchEmployeeDetailsData,
  });
};

// fecting data for clients
const fetchClientDetailsData = async () => {
  const response = await apiClient.get("/Clients-details");
  return response.data;
};

// React Query hook to fetch property data
export const useClientDetails = () => {
  return useQuery({
    queryKey: ["clientsDetails"],
    queryFn: fetchClientDetailsData,
  });
};

// ✅ Update Ticket Sheet
const changePassword = async (data) => {
  const response = await apiClient.post("/auth/update-password", data);
  return response.data;
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries(["update-password"]);
    },
  });
};

const getOtp = async (data) => {
  const response = await apiClient.post("/otp/send-otp", data);
  return response.data;
};

export const useGetOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getOtp,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["getOtp"]);
    },
  });
};

const verifyOtp = async (data) => {
  const response = await apiClient.post("/otp/verify-otp", data);
  return response.data;
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["verifyOtp"]);
    },
  });
};