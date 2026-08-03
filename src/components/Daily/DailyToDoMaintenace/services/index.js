import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../../api/ApiClient";

/* ================= FETCH ================= */

export const fetchMaintenanceData = async () => {
  const res = await apiClient.get("/maintenance");
  return res.data;
};

export const useMaintenanceData = () => {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: fetchMaintenanceData,
  });
};

/* ================= UPDATE ================= */

const updateMaintenanceRow = async (payload) => {
  const res = await apiClient.post("/maintenance/update", payload);
  return res.data;
};

export const useUpdateMaintenanceRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaintenanceRow,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance"],
      });
    },
  });
};
