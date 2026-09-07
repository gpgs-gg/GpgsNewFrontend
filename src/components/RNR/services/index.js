import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";
// ======================= GET FNF / NOTICE DATA =======================
const getFnFandNoticeData = async ({
  page = 1,
  limit = 10,
  search = "",
  propertyId = "",
}) => {
  const params = {
    page,
    limit,
  };

  // SEARCH HAS PRIORITY
  if (search?.trim()) {
    params.search = search.trim();
  }
  // PROPERTY FILTER ONLY WHEN SEARCH IS EMPTY
  else if (propertyId?.trim()) {
    params.propertyId = propertyId.trim();
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
  propertyId = "",
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["fnf-notice-data", page, limit, search, propertyId],

    queryFn: () =>
      getFnFandNoticeData({
        page,
        limit,
        search,
        propertyId,
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