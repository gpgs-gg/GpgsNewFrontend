import { useMutation, useQuery, useQueryClient , keepPreviousData} from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";
// ======================= GET FNF / NOTICE DATA =======================
const getFnFandNoticeData = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (filters.userId) {
    params.userId = filters.userId;
  }

  if (
    filters.isActive !== undefined &&
    filters.isActive !== ""
  ) {
    params.isActive = filters.isActive;
  }

  const response = await apiClient.get("/clients/rent-not-received", {
    params,
  });

  return response.data;
};

// ======================= HOOK =======================

export const useFnFnadNoticeData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: [
      "fnf-notice-data",
      page,
      limit,
      search,
      filters.userId,
      filters.isActive,
    ],

    queryFn: () =>
      getFnFandNoticeData({
        page,
        limit,
        search,
        filters,
      }),

    enabled,

    placeholderData: keepPreviousData,
  });
};



// ✅ 
const createRentNotReceivedCommen = async (data) => {
  const response = await apiClient.post("/rent-not-received/comment", data);
  return response.data;
};
export const useCreateRentNotReceivedComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRentNotReceivedCommen,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["fnf-notice-data"]);
    },
  });
};