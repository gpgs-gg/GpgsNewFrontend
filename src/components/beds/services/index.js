import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";


const getBedsData = async ({ page = 1, limit = 10, search, filters = {} }) => {
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
  if (filters.gender) {
    params.gender = filters.gender;
  }
  if (filters.sharingType) {
    params.sharingType = filters.sharingType;
  }
  if (filters.bathAttached) {
    params.bathAttached = filters.bathAttached;
  }
  if (filters.propertyLocation) {
    params.propertyLocation = filters.propertyLocation;
  }
  if (filters.acRoom) {
    params.acRoom = filters.acRoom;
  }
  if (filters.roomNo) {
    params.roomNo = filters.roomNo;
  }
  if (filters.bedNo) {
    params.bedNo = filters.bedNo;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  const response = await apiClient.get("/beds", {
    params,
  });
  return response.data;
};
export const useBedsData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "beds-data",
      page,
      limit,
      search,
      filters.propertyId,
      filters.gender,
      filters.sharingType,
      filters.bathAttached,
      filters.acRoom,
      filters.roomNo,
      filters.bedNo,
      filters.status,
      filters.propertyLocation,
    ],
    queryFn: () =>
      getBedsData({
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



const getPropertiesDropdown= async () => {
  const response = await apiClient.get("/properties/dropdown");
  return response.data;
};

export const usePropertiesDropdown = ( enabled = true ) => {
  return useQuery({
    queryKey: ["properties-dropdown"],
    queryFn: getPropertiesDropdown,
    enabled ,// Only fetch when enabled is true
  });
};

