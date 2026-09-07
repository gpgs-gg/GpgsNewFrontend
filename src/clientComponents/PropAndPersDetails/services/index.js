
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";


const getSingleClientData = async (id) => {
  const response = await apiClient.get(`/client-perso-pro-details/${id}`);
  return response.data;
};

export const useSingleClientData = (id) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getSingleClientData(id),
    enabled: !!id,
  });
};
