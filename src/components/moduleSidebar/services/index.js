import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../api/ApiClient";

// =====================================================
// GET MODULES
// =====================================================

const getModulesData = async ({
  page = 1,
  limit = 10,
  search = "",
  moduleType = "",
  isActive = "",
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (moduleType) {
    params.moduleType = moduleType;
  }

  if (isActive !== "") {
    params.isActive = isActive;
  }

  const response = await apiClient.get("/modules", {
    params,
  });

  return response.data;
};

export const useModulesData = ({
  page = 1,
  limit = 10,
  search = "",
  moduleType = "",
  isActive = "",
  enabled = true,
}) => {
  return useQuery({
    queryKey: ["modules-data", page, limit, search, moduleType, isActive],

    queryFn: () =>
      getModulesData({
        page,
        limit,
        search,
        moduleType,
        isActive,
      }),

    enabled,

    keepPreviousData: true,
  });
};

// =====================================================
// CREATE MODULE
// =====================================================

const createModuleData = async (data) => {
  const response = await apiClient.post("/modules", data);

  return response.data;
};

export const useCreateModuleData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createModuleData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modules-data"],
      });
    },
  });
};

// =====================================================
// GET SINGLE MODULE
// =====================================================

const getSingleModuleData = async (id) => {
  const response = await apiClient.get(`/modules/${id}`);

  return response.data;
};

export const useSingleModuleData = (id) => {
  return useQuery({
    queryKey: ["module", id],

    queryFn: () => getSingleModuleData(id),

    enabled: !!id,
  });
};

// =====================================================
// UPDATE MODULE
// =====================================================

const updateModuleData = async ({ id, data }) => {
  const response = await apiClient.put(`/modules/${id}`, data);

  return response.data;
};
export const useUpdateModuleData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateModuleData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modules-data"],
      });
    },
  });
};
// =====================================================
// DELETE MODULE
// =====================================================

const deleteModuleData = async (id) => {
  const response = await apiClient.delete(`/modules/${id}`);

  return response.data;
};

export const useDeleteModuleData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModuleData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modules-data"],
      });
    },
  });
};

// =====================================================
// TOGGLE MODULE STATUS
// =====================================================

const toggleModuleStatus = async (id) => {
  const response = await apiClient.patch(`/modules/${id}/toggle-status`);

  return response.data;
};

export const useToggleModuleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleModuleStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modules-data"],
      });
    },
  });
};
