import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getRentHistoryData = async (clientId) => {
  const response = await apiClient.get("/rent-history", {
    params: clientId ? { clientId } : {},
  });

  return response.data;
};


export const useRentHistoryData = (clientId) => {
  return useQuery({
    queryKey: ["rent-history-data", clientId],
    queryFn: () => getRentHistoryData(clientId),
  });
};








const getSingleClientRentData = async (id) => {
  const response = await apiClient.get(`/rent-history/${id}`);
  return response.data;
};

export const useSingleClientRentData = (id) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getSingleClientRentData(id),
    enabled: !!id,
  });
};




// ✅ Update Bed Sheet
const updateRentData = async ({ id, data }) => {
   console.log(11111111111111, id, data)
  const response = await apiClient.put(`/rent-history/${id}`, data);
  return response.data;
};
export const useUpdateRentData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRentData,
    onSuccess: () => {
      queryClient.invalidateQueries(["rent-history"]);
    },
  });
};
