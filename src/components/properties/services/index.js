import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getPropertiesData = async ({
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
  if (filters.propertyId) {
    params.propertyId = filters.propertyId;
  }
  if (filters.propertyLocation) {
    params.propertyLocation = filters.propertyLocation;
  }
  if (filters.bedCount) {
    params.bedCount = filters.bedCount;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  const response = await apiClient.get("/properties", {
    params,
  });

  return response.data;
};

export const usePropertiesData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "properties-data",
      page,
      limit,
      search,
      filters.propertyId,
      filters.propertyLocation,
      filters.bedCount,
      filters.status,
    ],
    queryFn: () =>
      getPropertiesData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    keepPreviousData: true,
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

export const getPropertyDropdown = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const response = await apiClient.get("/properties/dropdown", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};
export const usePropertyDropdown = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
}) => {
  return useQuery({
    queryKey: ["property-dropdown", page, limit, search],
    queryFn: () =>
      getPropertyDropdown({
        page,
        limit,
        search,
      }),
    enabled,
    keepPreviousData: true,
  });
};

// ====================== DELETE SINGLE PROPERTY ======================
const deletePropertyData = async (id) => {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data;
};

export const useDeletePropertyData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePropertyData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties-data"],
      });
    },
  });
};



// ====================== DELETE MULTIPLE PROPERTIES ======================
const deleteMultiplePropertiesData = async (ids) => {
  const response = await apiClient.delete("/properties", {
    data: { ids },
  });

  return response.data;
};

export const useDeleteMultiplePropertiesData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMultiplePropertiesData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties-data"],
      });
    },
  });
};