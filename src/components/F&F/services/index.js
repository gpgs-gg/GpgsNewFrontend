import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";
// ======================= GET FNF / NOTICE DATA =======================
// ======================= GET FNF / NOTICE DATA =======================
//
const getFnFandNoticeData = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = { page, limit };
  // ======================= // Backend Search //
  // =======================
  //
  if (search?.trim()) {
    params.search = search.trim();
  }
  // ======================= // Property // =======================
  //
  if (filters.propertyId) {
    params.propertyId = filters.propertyId;
  }
  // ======================= // FNF Status // =======================
  //
  if (filters.fnfStatus) {
    params.fnfStatus = filters.fnfStatus;
  } // ======================= // Stay Type // =======================
  //
  if (filters.stayType) {
    params.stayType = filters.stayType;
  }
  // ⭐ CVD
  if (filters.hasCvd) {
    params.hasCvd = true;
  }

  const response = await apiClient.get("/clients/notice", { params });
  return response.data;
}; // ======================= HOOK =======================
//
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
      filters.propertyId,
      filters.fnfStatus,
      filters.stayType,
      filters.hasCvd,
    ],
    queryFn: () => getFnFandNoticeData({ page, limit, search, filters }),
    enabled,
    placeholderData: keepPreviousData,
  });
};