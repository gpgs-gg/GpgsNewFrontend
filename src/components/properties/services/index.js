import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getPropertiesData= async () => {
  const response = await apiClient.get("/properties");
  return response.data;
};

export const usePropertiesData = ( enabled = true ) => {
  return useQuery({
    queryKey: ["properties-data"],
    queryFn: getPropertiesData,
    enabled ,// Only fetch when enabled is true
  });
};
// ✅ 
const createPropertyData = async (data) => {
  const response = await apiClient.post("/properties", data);
  return response.data;
};
export const usecreatePropertyData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPropertyData,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["properties-data"]);
    },
  });
};

const getSinglePropertiesData = async (id) => {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
};

export const useSinglePropertiesData = (id) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => getSinglePropertiesData(id),
    enabled: !!id,
  });
};

// ✅ Update property Sheet
const updatePropertiesData = async ({ id, data }) => {
  const response = await apiClient.put(`/properties/${id}`, data);
  return response.data;
};
export const useUpdatePropertiesData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePropertiesData,
    onSuccess: () => {
      queryClient.invalidateQueries(["properties-data"]);
    },
  });
};