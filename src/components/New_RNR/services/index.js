import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getClients = async ({ page, limit, search, filters }) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await apiClient.get("/new-rnr", {
    params,
  });

  return response.data;
};

export const useClients = (
  { page, limit, search, filters },
  enabled = true,
) => {
  return useQuery({
    queryKey: ["get-clients-data", page, limit, search, filters],
    queryFn: () =>
      getClients({
        page,
        limit,
        search,
        filters,
      }),
    keepPreviousData: true,
    enabled,
  });
};

const getRentGenerationLogs = async () => {
  const response = await apiClient.get("/rent-generation-logs");

  return response.data;
};

export const useRentGenerationLogs = (enabled = true) => {
  return useQuery({
    queryKey: ["rent-generation-logs"],
    queryFn: getRentGenerationLogs,
    enabled,
  });
};
