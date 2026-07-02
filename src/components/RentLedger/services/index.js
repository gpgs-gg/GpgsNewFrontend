import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// const getRentHistoryData= async () => {
//   const response = await apiClient.get(`/rent-history?clientId${clientId}`);
//   return response.data;
// };

// export const useRentHistoryData = ( enabled = true ) => {
//   return useQuery({
//     queryKey: ["Rent-history-data"],
//     queryFn: getRentHistoryData,
//     enabled ,// Only fetch when enabled is true
//   });
// };

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


// ✅ 
const createBedData = async (data) => {
  const response = await apiClient.post("/beds", data);
  return response.data;
};
export const usecreateBedData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBedData,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["beds-data"]);
    },
  });
};

const getSingleBedsData = async (id) => {
  const response = await apiClient.get(`/beds/${id}`);
  return response.data;
};

export const useSingleBedsData = (id) => {

  return useQuery({
    queryKey: ["beds", id],
    queryFn: () => getSingleBedsData(id),
    enabled: !!id,
  });
};

// ✅ Update Bed Sheet
const updateBedsData = async ({ id, data }) => {
  const response = await apiClient.put(`/beds/${id}`, data);
  return response.data;
};
export const useUpdateBedsData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBedsData,
    onSuccess: () => {
      queryClient.invalidateQueries(["beds-data"]);
    },
  });
};



const getPropertiesDropdown = async () => {
  const response = await apiClient.get("/properties/dropdown");
  return response.data;
};

export const usePropertiesDropdown = (enabled = true) => {
  return useQuery({
    queryKey: ["properties-dropdown"],
    queryFn: getPropertiesDropdown,
    enabled,// Only fetch when enabled is true
  });
};