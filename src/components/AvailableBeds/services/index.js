import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getAvailableBedsData= async () => {
  const response = await apiClient.get("/available-beds");
  return response.data;
};

export const useAvailableBedsData = ( enabled = true ) => {
  return useQuery({
    queryKey: ["available-beds-data"],
    queryFn: getAvailableBedsData,
    enabled ,// Only fetch when enabled is true
  });
};















const getNewBooking= async () => {
  const response = await apiClient.get("/new-bookings");
  return response.data;
};

export const useNewBooking = ( enabled = true ) => {
  return useQuery({
    queryKey: ["get-new-booking-data"],
    queryFn: getNewBooking,
    enabled ,// Only fetch when enabled is true
  });
};

const createNewBooking = async (data) => {
  const response = await apiClient.post("/new-bookings", data);
  return response.data;
};
export const useCreateNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};



const createClientFromNewBooking = async (data) => {
  const response = await apiClient.post("/clients/create-from-booking", data);
  return response.data;
};
export const useClientFromNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientFromNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};
const cancelNewBooking = async (id) => {
  const response = await apiClient.put(`/new-bookings/cancel/${id}`);
  return response.data;
};
export const useCancelNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};