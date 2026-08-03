import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getMasterData = async ({
  page = 1,
  limit = 10,
  search,
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (filters.categoryKey) {
    params.categoryKey = filters.categoryKey;
  }

  if (filters.isActive !== undefined) {
    params.isActive = filters.isActive;
  }

  const response = await apiClient.get("/options", {
    params,
  });

  return response.data;
};

export const useMasterData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "options",
      page,
      limit,
      search,
      filters.categoryKey,
      filters.isActive,
    ],
    queryFn: () =>
      getMasterData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    keepPreviousData: true,
  });
};
const createMasterData = async (data) => {
  const response = await apiClient.post("/options", data);
  return response.data;
};

export const useCreateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMasterData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["options"],
      });
    },
  });
};
const getSingleMasterData = async (id) => {
  const response = await apiClient.get(`/options/${id}`);
  return response.data;
};

export const useSingleMasterData = (id) => {
  return useQuery({
    queryKey: ["options", id],
    queryFn: () => getSingleMasterData(id),
    enabled: !!id,
  });
};

const updateMasterData = async ({ id, data }) => {
  const response = await apiClient.put(`/options/${id}`, data);
  return response.data;
};

export const useUpdateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMasterData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["options"],
      });
    },
  });
};

export const useDeleteMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/options/${id}`);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["options"],
      });
    },
  });
};

//  Get Locations
export const getLocations = async () => {
  const { data } = await apiClient.get("/options", {
    params: {
      categoryKey: "locations",
    },
  });

  return data.data;
};
export const useLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });
};

// Get Sharing Types
export const getSharingTypes = async () => {
  const { data } = await apiClient.get("/options", {
    params: {
      categoryKey: "sharingtype",
    },
  });

  return data.data;
};

export const useSharingTypes = () => {
  return useQuery({
    queryKey: ["sharing-types"],
    queryFn: getSharingTypes,
  });
};













// akash code  ......................................
const getBatchOptions = async (categories = []) => {
  const { data } = await apiClient.get("/options/batch", {
    params: {
      categories: categories.join(","),
    },
  });

  return data.data;
};

export const useBatchOptions = (categories = []) => {
  const sortedCategories = [...categories].sort();

  return useQuery({
    queryKey: ["batch-options", sortedCategories.join(",")],
    queryFn: () => getBatchOptions(sortedCategories),
    enabled: sortedCategories.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};