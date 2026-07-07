import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getTicketsData= async () => {
  const response = await apiClient.get("/tickets");
  return response.data;
};

export const useTicketsData = ( enabled = true ) => {
  return useQuery({
    queryKey: ["tickets-data"],
    queryFn: getTicketsData,
    enabled ,// Only fetch when enabled is true
  });
};

const createTicketData = async (data) => {
  const response = await apiClient.post("/tickets", data);
  return response.data;
};
export const useCreateTicketData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicketData,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["tickets-data"]);
    },
  });
};

const getSingleTicketData = async (id) => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};

export const useSingleTicketData = (id) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getSingleTicketData(id),
    enabled: !!id,
  });
};

const updateTicketData = async ({ id, data }) => {
  const response = await apiClient.put(`/tickets/${id}`, data);
  return response.data;
};
export const useUpdateTicketData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketData,
    onSuccess: () => {
      queryClient.invalidateQueries(["tickets-data"]);
    },
  });
};